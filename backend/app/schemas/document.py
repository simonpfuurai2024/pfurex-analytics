from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    PITCH_DECK = "pitch_deck"
    ECOCASH_STATEMENT = "ecocash_statement"
    TAX_RETURN = "tax_return"
    FINANCIAL_MODEL = "financial_model"
    FUNDING_APPLICATION = "funding_application"
    OTHER = "other"

class DocumentOut(BaseModel):
    id: UUID
    company_id: UUID
    title: str
    document_type: DocumentType
    file_path: Optional[str] = None
    uploaded_at: datetime
    parsed_data: Optional[Dict[str, Any]] = None
    parse_status: str
    confidence_scores: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ParseRequest(BaseModel):
    pass

class RatingsEditRequest(BaseModel):
    scorecard_ratings: Optional[Dict[str, float]] = None
    risk_scores: Optional[Dict[str, int]] = None
    justifications: Optional[Dict[str, str]] = None
    recalculate: bool = True
