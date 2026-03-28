from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models, schemas
from app.auth import (
    create_access_token,
    verify_google_token,
    verify_password,
    get_password_hash,
)
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
    first_time = False

    # Register New User
    if not user:
        user = models.User(google_sub=google_sub, timezone=payload.timezone or "UTC")
        session.add(user)
        await session.commit()
        await session.refresh(user)
        first_time = True

    token = create_access_token(user_id=user.id)
    return schemas.TokenResponse(access_token=token, first_time=first_time)


@router.post("/basic", response_model=schemas.TokenResponse)
async def auth_basic(
    payload: schemas.BasicAuthRequest, session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(models.User).where(models.User.username == payload.username)
    )
    user = result.scalar_one_or_none()
    first_time = False

    if not user:
        user = models.User(
            username=payload.username,
            password_hash=get_password_hash(payload.password),
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        first_time = True
    else:
        if not user.password_hash or not verify_password(
            payload.password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )

    token = create_access_token(user_id=user.id)
    return schemas.TokenResponse(access_token=token, first_time=first_time)
