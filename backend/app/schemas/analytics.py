from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

# ---------- Valuation ----------
class ValuationRequest(BaseModel):
    company_ratings: Dict[str, float]
    weights: Optional[Dict[str, float]] = None
    baseline_valuation: Optional[float] = None

class ValuationOut(BaseModel):
    id: UUID
    company_id: UUID
    method: str
    calculated_value_usd: float
    pre_money_usd: Optional[float]
    post_money_usd: Optional[float]
    assumptions: Dict[str, Any]
    output_details: Optional[Dict[str, Any]]
    performed_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Risk Assessment ----------
class RiskAssessmentRequest(BaseModel):
    category_scores: Dict[str, int]
    weights: Optional[Dict[str, float]] = None
    notes: Optional[str] = None

class RiskAssessmentOut(BaseModel):
    id: UUID
    company_id: UUID
    overall_score: int
    category_scores: Dict[str, Any]
    assessment_notes: Optional[str]
    assessed_at: datetime

    class Config:
        from_attributes = True
