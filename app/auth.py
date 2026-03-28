import asyncio
import datetime as dt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.config import get_settings
from app.db import get_session
from app import models

security = HTTPBearer()
settings = get_settings()


def create_access_token(user_id: int) -> str:
    expire = dt.datetime.now(dt.timezone.utc) + dt.timedelta(
        days=settings.jwt_expires_days
    )
    payload = {"sub": str(user_id), "exp": expire}
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return token


async def verify_google_token(id_token_str: str) -> dict:
    """
    Validate a Google ID token.

    """
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google client id is not configured",
        )

    def _blocking_verify() -> dict:
        return id_token.verify_oauth2_token(
            id_token_str, google_requests.Request(), settings.google_client_id
        )

    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(None, _blocking_verify)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> models.User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token decode error"
        )

    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject"
        )

    result = await session.execute(
        select(models.User).where(models.User.id == user_id_int)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user
