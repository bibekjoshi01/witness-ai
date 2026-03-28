from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models, schemas
from app.auth import create_access_token, verify_google_token
from app.db import get_session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=schemas.TokenResponse)
async def auth_google(
    payload: schemas.GoogleAuthRequest, session: AsyncSession = Depends(get_session)
):
    token_info = await verify_google_token(payload.id_token)
    google_sub = token_info["sub"]

    result = await session.execute(
        select(models.User).where(models.User.google_sub == google_sub)
    )
    user = result.scalar_one_or_none()
    if not user:
        user = models.User(google_sub=google_sub, timezone=payload.timezone or "UTC")
        session.add(user)
        await session.commit()
        await session.refresh(user)

    token = create_access_token(user_id=user.id)
    return schemas.TokenResponse(access_token=token)
