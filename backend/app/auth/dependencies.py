from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.auth.utils import SECRET_KEY, ALGORITHM
from app.models.auth import User, UserRole
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)  # auto_error=False for optional

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    if token is None:
        return None
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

async def get_optional_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    """Return User or None if no valid token."""
    if token is None:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = await db.get(User, user_id)
        return user
    except JWTError:
        return None

def require_role(role: UserRole):
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role != role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

require_admin = require_role(UserRole.ADMIN)
require_investor = require_role(UserRole.INVESTOR)
require_business_owner = require_role(UserRole.BUSINESS_OWNER)
