from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.company import Company
from app.models.analytics import Valuation
from app.models.auth import User, UserRole
from app.auth.dependencies import get_current_active_user
from app.schemas.analytics import ValuationRequest, ValuationOut
from app.engines.valuation import scorecard_valuation

router = APIRouter(prefix="/companies/{company_id}/valuations", tags=["valuations"])

def can_access_company(user: User, company: Company) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.INVESTOR):
        return True
    if user.role == UserRole.BUSINESS_OWNER:
        return company.owner_id == user.id
    return False

@router.post("/scorecard", response_model=ValuationOut, status_code=status.HTTP_201_CREATED)
async def compute_scorecard_valuation(
    company_id: UUID,
    payload: ValuationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if not can_access_company(current_user, company):
        raise HTTPException(status_code=403, detail="Access denied")

    result = scorecard_valuation(
        payload.company_ratings,
        payload.weights,
        payload.baseline_valuation
    )

    valuation = Valuation(
        company_id=company_id,
        method="scorecard",
        calculated_value_usd=result["pre_money_usd"],
        pre_money_usd=result["pre_money_usd"],
        assumptions={
            "company_ratings": payload.company_ratings,
            "weights": result["weights"],
            "baseline_valuation_usd": result["baseline_valuation_usd"]
        },
        output_details=result,
        performed_by=str(current_user.id)
    )
    db.add(valuation)
    await db.commit()
    await db.refresh(valuation)
    return valuation

@router.get("/", response_model=List[ValuationOut])
async def list_valuations(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company or not can_access_company(current_user, company):
        raise HTTPException(status_code=404, detail="Company not found")
    result = await db.execute(
        select(Valuation).where(Valuation.company_id == company_id)
    )
    return result.scalars().all()
