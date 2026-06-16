from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/contact", tags=["contact"])

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.post("/")
async def receive_contact(msg: ContactMessage):
    # For now, just log to console
    print(f"\n📬 CONTACT FORM")
    print(f"   From: {msg.name} <{msg.email}>")
    print(f"   Message: {msg.message}\n")
    # Later, you can call send_email here
    return {"status": "received"}
