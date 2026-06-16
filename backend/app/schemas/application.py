from pydantic import BaseModel
from typing import Optional

class ApplicationForm(BaseModel):
    executive_summary: str
    business_model: str
    history: str
    team: str
    purpose_of_application: str
    technical_assistance_required: Optional[str] = ""
    offer: str
    traction_to_date: str
    additional_documents: Optional[str] = ""
