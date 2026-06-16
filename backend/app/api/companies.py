from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.company import Company
from app.models.auth import User, UserRole
from app.auth.dependencies import get_current_active_user, require_admin, require_investor, require_business_owner
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut

router = APIRouter(prefix="/companies", tags=["companies"])

def can_view_company(user: User, company: Company) -> bool:
    """Visibility rule: business_owner only sees own companies; investor/admin see all."""
    if user.role == UserRole.ADMIN or user.role == UserRole.INVESTOR:
        return True
    if user.role == UserRole.BUSINESS_OWNER:
        return company.owner_id == user.id
    return False

def can_edit_company(user: User, company: Company) -> bool:
    """Edit rule: owner or admin."""
    return user.role == UserRole.ADMIN or company.owner_id == user.id

@router.post("/", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Determine owner_id: if admin, can specify; otherwise force to current user
    if current_user.role == UserRole.ADMIN and payload.owner_id:
        owner_id = payload.owner_id
    else:
        owner_id = current_user.id

    company = Company(**payload.dict(exclude={"owner_id"}), owner_id=owner_id)
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company

@router.get("/", response_model=List[CompanyOut])
async def list_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == UserRole.BUSINESS_OWNER:
        query = select(Company).where(Company.owner_id == current_user.id)
    else:
        query = select(Company)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{company_id}", response_model=CompanyOut)
async def get_company(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if not can_view_company(current_user, company):
        raise HTTPException(status_code=403, detail="Access denied")
    return company

@router.put("/{company_id}", response_model=CompanyOut)
async def update_company(
    company_id: UUID,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if not can_edit_company(current_user, company):
        raise HTTPException(status_code=403, detail="Access denied")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(company, field, value)
    await db.commit()
    await db.refresh(company)
    return company

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can delete companies")
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await db.delete(company)
    await db.commit()
    return None
