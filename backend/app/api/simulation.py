from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from decimal import Decimal
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models.company import Company, Document, FinancialRecord
from app.models.reference import ExitMultiple
from app.models.auth import User, UserRole
from app.auth.dependencies import get_current_active_user
from app.engines.simulation import run_projection, run_monte_carlo
from pydantic import BaseModel

router = APIRouter(prefix="/companies/{company_id}/simulate", tags=["simulation"])

class CapexItem(BaseModel):
    month: int
    amount: float
    useful_life: int = 36

class HireItem(BaseModel):
    month: int
    salary: float

class SimulationRequest(BaseModel):
    # Growth assumptions
    monthly_revenue_growth_pct: float = 10.0
    salary_growth_pct: float = 2.0
    # Expense ratios (% of revenue)
    cogs_pct_of_revenue: float = 40.0
    marketing_pct_of_revenue: float = 10.0
    gna_pct_of_revenue: float = 15.0
    # Fixed infrastructure cost
    infrastructure_fixed: float = 500.0
    # Hiring plan
    new_hires: List[HireItem] = []
    # CapEx plan
    capex: List[CapexItem] = []
    # Zimbabwe‑specific
    currency_mix_usd_pct: float = 70.0
    forex_premium_pct: float = 5.0
    zesa_cost_per_month: float = 200.0
    inflation_rate_pct: float = 10.0
    payment_delay_days: int = 30
    # Manual override if no records exist
    initial_revenue_override: Optional[float] = None

class DistributionItem(BaseModel):
    name: str
    type: str   # uniform or normal
    params: List[float]   # [low, high] or [mean, std]

class MonteCarloRequest(BaseModel):
    # Base assumptions (same as above)
    base_assumptions: SimulationRequest
    # Distributions for selected fields
    distributions: List[DistributionItem]
    iterations: int = 500

async def fetch_financials(db: AsyncSession, company_id: UUID) -> Dict[str, float]:
    """Helper to fetch current financials."""
    async def get(metric: str) -> float | None:
        q = select(FinancialRecord.amount).where(
            FinancialRecord.company_id == company_id,
            FinancialRecord.metric_name == metric,
        ).order_by(FinancialRecord.period_end.desc()).limit(1)
        res = await db.execute(q)
        val = res.scalar()
        if val is None:
            return None
        return float(val) if isinstance(val, Decimal) else val

    rev = await get("revenue")
    cogs = await get("cogs") or await get("cost_of_goods_sold")
    salaries = await get("salaries") or await get("wages") or 1000.0
    marketing = await get("marketing")
    gna = await get("general_and_administrative")
    infra = await get("infrastructure") or await get("rent") or 500.0
    cash = await get("cash_balance") or await get("cash") or 0.0

    # Fallback: funding application
    if rev is None:
        q = select(Document).where(
            Document.company_id == company_id,
            Document.document_type == "funding_application",
            Document.parse_status == "completed",
        ).order_by(Document.uploaded_at.desc()).limit(1)
        r = await db.execute(q)
        doc = r.scalar_one_or_none()
        if doc and doc.parsed_data:
            llm = doc.parsed_data.get("llm_analysis", {})
            rev = llm.get("projected_revenue_usd")
            if rev:
                rev = float(rev)

    return {
        "revenue": rev or 0,
        "cogs": cogs or (rev * 0.4 if rev else 0),
        "salaries": salaries,
        "marketing": marketing or (rev * 0.1 if rev else 0),
        "gna": gna or (rev * 0.15 if rev else 0),
        "infrastructure": infra,
        "cash": cash,
    }

# ── Deterministic endpoint (already existed) ──
@router.post("/")
async def simulate_deterministic(
    company_id: UUID, payload: SimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if current_user.role == UserRole.BUSINESS_OWNER and company.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    fin = await fetch_financials(db, company_id)
    rev = payload.initial_revenue_override or fin["revenue"]
    # Funding
    funding = 0.0
    q = select(Document).where(
        Document.company_id == company_id,
        Document.document_type == "funding_application",
        Document.parse_status == "completed",
    ).order_by(Document.uploaded_at.desc()).limit(1)
    r = await db.execute(q)
    doc = r.scalar_one_or_none()
    if doc and doc.parsed_data:
        deal = doc.parsed_data.get("llm_analysis", {}).get("deal_terms", {})
        funding = float(deal.get("funding_requirement_usd", 0))

    proj, metrics = run_projection(
        current_revenue=rev,
        current_cogs=fin["cogs"],
        current_salaries=fin["salaries"],
        current_marketing=fin["marketing"],
        current_gna=fin["gna"],
        current_infrastructure=fin["infrastructure"],
        current_cash=fin["cash"],
        funding_amount=funding,
        monthly_revenue_growth_pct=payload.monthly_revenue_growth_pct,
        cogs_pct_of_revenue=payload.cogs_pct_of_revenue,
        salary_growth_pct=payload.salary_growth_pct,
        marketing_pct_of_revenue=payload.marketing_pct_of_revenue,
        gna_pct_of_revenue=payload.gna_pct_of_revenue,
        infrastructure_fixed=payload.infrastructure_fixed,
        new_hires_per_month=[h.dict() for h in payload.new_hires],
        capex=[c.dict() for c in payload.capex],
        currency_mix_usd_pct=payload.currency_mix_usd_pct,
        forex_premium_pct=payload.forex_premium_pct,
        zesa_cost_per_month=payload.zesa_cost_per_month,
        inflation_rate_pct=payload.inflation_rate_pct,
        payment_delay_days=payload.payment_delay_days,
        months=36,
    )

    exit_multiple = 5.0
    if company.sector:
        eq = await db.execute(select(ExitMultiple.multiple).where(ExitMultiple.sector == company.sector))
        m = eq.scalar()
        if m:
            exit_multiple = float(m) if isinstance(m, Decimal) else float(m)
    terminal_value = metrics["terminal_revenue"] * exit_multiple
    years = 36 / 12
    irr = (terminal_value / funding) ** (1 / years) - 1 if funding else None

    return {
        "assumptions": payload.dict(),
        "current_financials": {**fin, "funding_amount": funding, "exit_multiple": exit_multiple},
        "projections": proj,
        "runway_months": metrics["runway_months"],
        "break_even_month": metrics["break_even_month"],
        "final_cash_balance": metrics["final_cash_balance"],
        "irr": round(irr * 100, 2) if irr else None,
        "terminal_value": round(terminal_value, 2),
    }

# ── Monte Carlo endpoint ──
@router.post("/monte-carlo")
async def simulate_monte_carlo(
    company_id: UUID,
    payload: MonteCarloRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if current_user.role == UserRole.BUSINESS_OWNER and company.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    fin = await fetch_financials(db, company_id)
    base = payload.base_assumptions
    rev = base.initial_revenue_override or fin["revenue"]

    funding = 0.0
    q = select(Document).where(
        Document.company_id == company_id,
        Document.document_type == "funding_application",
        Document.parse_status == "completed",
    ).order_by(Document.uploaded_at.desc()).limit(1)
    r = await db.execute(q)
    doc = r.scalar_one_or_none()
    if doc and doc.parsed_data:
        deal = doc.parsed_data.get("llm_analysis", {}).get("deal_terms", {})
        funding = float(deal.get("funding_requirement_usd", 0))

    base_assumptions = {
        "current_revenue": rev,
        "current_cogs": fin["cogs"],
        "current_salaries": fin["salaries"],
        "current_marketing": fin["marketing"],
        "current_gna": fin["gna"],
        "current_infrastructure": fin["infrastructure"],
        "current_cash": fin["cash"],
        "funding_amount": funding,
        "monthly_revenue_growth_pct": base.monthly_revenue_growth_pct,
        "cogs_pct_of_revenue": base.cogs_pct_of_revenue,
        "salary_growth_pct": base.salary_growth_pct,
        "marketing_pct_of_revenue": base.marketing_pct_of_revenue,
        "gna_pct_of_revenue": base.gna_pct_of_revenue,
        "infrastructure_fixed": base.infrastructure_fixed,
        "new_hires": [h.dict() for h in base.new_hires],
        "capex": [c.dict() for c in base.capex],
        "currency_mix_usd_pct": base.currency_mix_usd_pct,
        "forex_premium_pct": base.forex_premium_pct,
        "zesa_cost_per_month": base.zesa_cost_per_month,
        "inflation_rate_pct": base.inflation_rate_pct,
        "payment_delay_days": base.payment_delay_days,
    }

    distributions = {
        d.name: {"type": d.type, "params": d.params}
        for d in payload.distributions
    }

    result = run_monte_carlo(
        base_assumptions=base_assumptions,
        distributions=distributions,
        iterations=payload.iterations,
        months=36,
    )

    exit_multiple = 5.0
    if company.sector:
        eq = await db.execute(select(ExitMultiple.multiple).where(ExitMultiple.sector == company.sector))
        m = eq.scalar()
        if m:
            exit_multiple = float(m) if isinstance(m, Decimal) else float(m)

    # IRR based on median terminal revenue
    median_terminal_rev = result["revenue_bands"][-1]["p50"]
    terminal_value = median_terminal_rev * exit_multiple
    years = 36 / 12
    irr = (terminal_value / funding) ** (1 / years) - 1 if funding else None

    return {
        "iterations": result["iterations"],
        "cash_balance_bands": result["cash_balance_bands"],
        "revenue_bands": result["revenue_bands"],
        "runway_percentiles": result["runway_percentiles"],
        "breakeven_probability": result["breakeven_probability"],
        "cash_positive_probability": result["cash_positive_probability"],
        "final_cash_percentiles": result["final_cash_percentiles"],
        "irr_p50": round(irr * 100, 2) if irr else None,
        "terminal_value_p50": round(terminal_value, 2),
    }
