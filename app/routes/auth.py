from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models, schemas
from app.auth import create_access_token
from app.db import get_session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/device", response_model=schemas.TokenResponse)
async def auth_device(payload: schemas.DeviceAuthRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(models.User).where(models.User.device_id == payload.device_id))
    user = result.scalar_one_or_none()
    if not user:
        user = models.User(device_id=payload.device_id, timezone=payload.timezone or "UTC")
        session.add(user)
        await session.commit()
        await session.refresh(user)
    token = create_access_token(device_id=user.device_id)
    return schemas.TokenResponse(access_token=token)
