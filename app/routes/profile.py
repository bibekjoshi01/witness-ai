from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import EmailStr

from app import models, schemas
from app.auth import get_current_user
from app.db import get_session

router = APIRouter(prefix="/profile", tags=["profile"])


async def _ensure_profile(
    user: models.User, session: AsyncSession
) -> models.UserProfile:
    result = await session.execute(
        select(models.UserProfile).where(models.UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile:
        return profile
    profile = models.UserProfile(user_id=user.id)
    session.add(profile)
    await session.flush()
    return profile


@router.get("", response_model=schemas.UserProfileOut)
async def get_profile(
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    profile = await _ensure_profile(user, session)
    await session.commit()
    return profile


@router.patch("", response_model=schemas.UserProfileUpdateOut)
async def update_profile(
    payload: schemas.UserProfileUpdate,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    profile = await _ensure_profile(user, session)

    allowed_genders = {"male", "female", "non-binary", "prefer_not_say", "other"}
    if payload.gender and payload.gender not in allowed_genders:
        raise HTTPException(status_code=400, detail="Invalid gender value.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "hobbies" and value is not None:
            setattr(profile, field, [h.strip() for h in value if h.strip()])
        else:
            setattr(profile, field, value)

    await session.commit()
    return {"message": "Profile updated successfully."}
