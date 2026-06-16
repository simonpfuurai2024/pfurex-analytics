from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from decimal import Decimal

from app.database import get_db
from app.models.company import Company
from app.models.scenario import SimulationScenario
from app.models.auth import User, UserRole
from app.auth.dependencies import get_current_active_user
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/companies/{company_id}/scenarios", tags=["scenarios"])

class ScenarioCreate(BaseModel):
    name: str
    notes: Optional[str] = ""
    mode: str  # "deterministic" or "monte-carlo"
    assumptions: Dict[str, Any]
    results: Dict[str, Any]

class ScenarioOut(BaseModel):
    id: UUID
    company_id: UUID
    name: str
    notes: Optional[str]
    mode: str
    assumptions: Dict[str, Any]
    results: Dict[str, Any]
    created_at: str

    class Config:
        from_attributes = True

@router.post("/", response_model=ScenarioOut)
async def save_scenario(
    company_id: UUID,
    payload: ScenarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if current_user.role == UserRole.BUSINESS_OWNER and company.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    scenario = SimulationScenario(
        company_id=company_id,
        name=payload.name,
        notes=payload.notes,
        mode=payload.mode,
        assumptions=payload.assumptions,
        results=payload.results,
        created_by=str(current_user.id)
    )
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return {
        **scenario.__dict__,
        "created_at": scenario.created_at.isoformat()
    }

@router.get("/", response_model=List[ScenarioOut])
async def list_scenarios(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    q = select(SimulationScenario).where(
        SimulationScenario.company_id == company_id
    ).order_by(SimulationScenario.created_at.desc())
    result = await db.execute(q)
    scenarios = result.scalars().all()
    return [
        {**s.__dict__, "created_at": s.created_at.isoformat()}
        for s in scenarios
    ]

@router.delete("/{scenario_id}")
async def delete_scenario(
    company_id: UUID,
    scenario_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    scenario = await db.get(SimulationScenario, scenario_id)
    if not scenario or scenario.company_id != company_id:
        raise HTTPException(status_code=404, detail="Scenario not found")
    await db.delete(scenario)
    await db.commit()
    return {"status": "deleted"}
