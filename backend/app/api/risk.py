from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.company import Company
from app.models.analytics import RiskAssessment
from app.models.auth import User, UserRole
from app.auth.dependencies import get_current_active_user
from app.schemas.analytics import RiskAssessmentRequest, RiskAssessmentOut
from app.engines.risk_scoring import calculate_risk_score

router = APIRouter(prefix="/companies/{company_id}/risk", tags=["risk"])

def can_access_company(user: User, company: Company) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.INVESTOR):
        return True
    if user.role == UserRole.BUSINESS_OWNER:
        return company.owner_id == user.id
    return False

@router.post("/", response_model=RiskAssessmentOut, status_code=status.HTTP_201_CREATED)
async def compute_risk(
    company_id: UUID,
    payload: RiskAssessmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if not can_access_company(current_user, company):
        raise HTTPException(status_code=403, detail="Access denied")

    result = calculate_risk_score(payload.category_scores, payload.weights)

    assessment = RiskAssessment(
        company_id=company_id,
        overall_score=result["overall_score"],
        category_scores=result,
        assessment_notes=payload.notes
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment

@router.get("/", response_model=List[RiskAssessmentOut])
async def list_risk_assessments(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company or not can_access_company(current_user, company):
        raise HTTPException(status_code=404, detail="Company not found")
    result = await db.execute(
        select(RiskAssessment).where(RiskAssessment.company_id == company_id)
    )
    return result.scalars().all()
