import datetime as dt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import get_settings
from app.db import get_session
from app import models

security = HTTPBearer()
settings = get_settings()


def create_access_token(device_id: str) -> str:
    expire = dt.datetime.utcnow() + dt.timedelta(days=settings.jwt_expires_days)
    payload = {"sub": device_id, "exp": expire}
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return token

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> models.User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        device_id: Optional[str] = payload.get("sub")
        if device_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token decode error")

    result = await session.execute(select(models.User).where(models.User.device_id == device_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
