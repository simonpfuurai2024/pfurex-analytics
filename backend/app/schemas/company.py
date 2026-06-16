from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    sector: Optional[str] = None
    founded_year: Optional[int] = None
    country: str = "Zimbabwe"
    description: Optional[str] = None
    stage: Optional[str] = None
    primary_contact: Optional[Dict[str, Any]] = None

class CompanyCreate(CompanyBase):
    owner_id: Optional[UUID] = None   # Admin can set this; for business_owner it's ignored

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    sector: Optional[str] = None
    founded_year: Optional[int] = None
    country: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[str] = None
    primary_contact: Optional[Dict[str, Any]] = None

class CompanyOut(CompanyBase):
    id: UUID
    owner_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
