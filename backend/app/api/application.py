from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID, uuid4
import asyncio
import json

from app.database import get_db
from app.models.company import Company, Document
from app.models.auth import User, UserRole
from app.auth.dependencies import get_current_active_user
from app.schemas.application import ApplicationForm
from app.utils.email import send_email
from sqlalchemy import select

router = APIRouter(prefix="/companies/{company_id}/application", tags=["application"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def submit_application(
    company_id: UUID,
    payload: ApplicationForm,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check company exists and owner matches
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if current_user.role != UserRole.ADMIN and company.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner or admin can submit an application")

    # Upsert: one application per company
    existing = await db.execute(
        select(Document).where(
            Document.company_id == company_id,
            Document.document_type == "funding_application"
        )
    )
    existing_doc = existing.scalar_one_or_none()

    if existing_doc:
        existing_doc.parsed_data = {"form_data": payload.dict()}
        existing_doc.parse_status = "pending"
        doc = existing_doc
    else:
        doc = Document(
            id=uuid4(),
            company_id=company_id,
            title="Funding Application",
            document_type="funding_application",
            file_path=None,
            parse_status="pending",
            parsed_data={"form_data": payload.dict()}
        )
        db.add(doc)

    await db.commit()
    await db.refresh(doc)

    # Trigger background processing
    from app.api.documents import process_pdf_document
    text = json.dumps(payload.dict())
    asyncio.create_task(process_pdf_document(str(doc.id), str(company_id), None, text))

    # Send email notifications to all investors
    # 1) Fetch investor emails
    investor_emails_result = await db.execute(
        select(User.email).where(User.role == UserRole.INVESTOR, User.is_active == True)
    )
    investor_emails = [row[0] for row in investor_emails_result.all()]

    if investor_emails:
        subject = f"New Funding Application from {company.name}"
        body = (
            f"A new funding application has been submitted by {company.name}.\n\n"
            f"View the dashboard: http://localhost:5173/companies/{company_id}\n\n"
            f"Pfurex Analytics"
        )
        # Fire-and-forget email sending
        asyncio.create_task(send_email(investor_emails, subject, body))

    return {"message": "Application submitted", "document_id": str(doc.id)}
