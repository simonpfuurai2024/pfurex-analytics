from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.auth import User, UserRole
from app.auth.utils import verify_password, create_access_token, hash_password
from app.auth.dependencies import get_current_active_user, get_optional_current_user
from pydantic import BaseModel, EmailStr
from uuid import UUID

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole

class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await db.execute(select(User).where(User.email == form_data.username))
    user = user.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserOut)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)  # <-- optional
):
    # If the request is authenticated (admin), allow any role
    if current_user:
        if current_user.role != UserRole.ADMIN:
            if user_data.role != UserRole.BUSINESS_OWNER:
                raise HTTPException(status_code=403, detail="Only admin can create investors/admins")
    else:
        # Unauthenticated: only business_owner self-registration allowed
        if user_data.role != UserRole.BUSINESS_OWNER:
            raise HTTPException(status_code=401, detail="Authentication required to create this role")

    existing = await db.execute(select(User).where(User.email == user_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
