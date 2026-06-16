from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import json

from app.database import get_db
from app.models.company import Company, Document
from app.models.auth import User, UserRole
from app.auth.dependencies import get_current_active_user
from app.llm_client import llm_complete

router = APIRouter(prefix="/companies/{company_id}/simulate/suggest", tags=["simulation-assumptions"])

@router.get("/")
async def suggest_assumptions(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    company = await db.get(Company, company_id)
    if not company: raise HTTPException(status_code=404, detail="Company not found")
    if current_user.role == UserRole.BUSINESS_OWNER and company.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    app_query = select(Document).where(
        Document.company_id == company_id,
        Document.document_type == "funding_application",
        Document.parse_status == "completed"
    ).order_by(Document.uploaded_at.desc()).limit(1)
    app_res = await db.execute(app_query)
    app_doc = app_res.scalar_one_or_none()

    if not app_doc or not app_doc.parsed_data:
        raise HTTPException(status_code=404, detail="No completed funding application found.")

    form_data = app_doc.parsed_data.get("form_data", {})
    llm_analysis = app_doc.parsed_data.get("llm_analysis", {})

    desc_parts = []
    if form_data:
        for key in ['executive_summary', 'business_model', 'history', 'team', 'purpose_of_application', 'traction_to_date', 'offer']:
            if form_data.get(key): desc_parts.append(f"{key}: {form_data[key]}")
    if llm_analysis:
        projected_rev = llm_analysis.get("projected_revenue_usd", "")
        desc_parts.append(f"Projected Revenue: {projected_rev}")
        deal_terms = llm_analysis.get("deal_terms", {})
        desc_parts.append(f"Funding Request: {deal_terms.get('funding_requirement_usd', '')}")
        desc_parts.append(f"Stake Offered: {deal_terms.get('stake_offered_percent', '')}%")

    business_text = "\n".join(desc_parts)

    prompt = f"""You are a financial analyst for Zimbabwean startups. Based on the following business description, suggest realistic simulation assumptions for a 36‑month financial projection. Return ONLY a valid JSON object with these fields:

{{
  "monthly_revenue_growth_pct": 8.0,
  "salary_growth_pct": 2.0,
  "cogs_pct_of_revenue": 40.0,
  "marketing_pct_of_revenue": 10.0,
  "gna_pct_of_revenue": 15.0,
  "infrastructure_fixed": 500.0,
  "currency_mix_usd_pct": 70.0,
  "forex_premium_pct": 5.0,
  "zesa_cost_per_month": 200.0,
  "inflation_rate_pct": 10.0,
  "payment_delay_days": 30,
  "capex": [],
  "new_hires": [],
  "reasoning": "Brief explanation of why you chose these numbers."
}}

Be conservative and realistic for the Zimbabwean context.

Business description:
{business_text[:1500]}

JSON:"""

    raw_output = await llm_complete(prompt=prompt, max_tokens=1024)
    json_str = raw_output.strip()
    if json_str.startswith("```"):
        json_str = json_str.split("```")[1]
        if json_str.startswith("json"): json_str = json_str[4:]

    try:
        assumptions = json.loads(json_str)
    except json.JSONDecodeError:
        from json_repair import repair_json
        assumptions = json.loads(repair_json(json_str))

    return {"suggested_assumptions": assumptions, "company_sector": company.sector, "company_stage": company.stage, "raw_llm_output": raw_output}
