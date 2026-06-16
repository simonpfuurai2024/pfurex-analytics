from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.auth import User, UserRole
from app.auth.dependencies import require_admin
from app.auth.utils import hash_password
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/admin", tags=["admin"])

# ---------- Schemas ----------
class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

class UserCreateAdmin(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole

class UserUpdate(BaseModel):
    is_active: bool | None = None
    role: UserRole | None = None
    full_name: str | None = None

# ---------- Endpoints ----------
@router.get("/users", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get all users (admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreateAdmin,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Create a new user (admin only)."""
    existing = await db.execute(select(User).where(User.email == user_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: UUID,
    updates: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Update user details (admin only)."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if updates.is_active is not None:
        user.is_active = updates.is_active
    if updates.role is not None:
        user.role = updates.role
    if updates.full_name is not None:
        user.full_name = updates.full_name
    await db.commit()
    await db.refresh(user)
    return user
