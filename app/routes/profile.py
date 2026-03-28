from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.auth import get_current_user
from app.db import get_session

router = APIRouter(prefix="/profile", tags=["profile"])


def _ensure_profile(user: models.User, session: AsyncSession) -> models.UserProfile:
    if user.profile:
        return user.profile
    profile = models.UserProfile(user_id=user.id)
    session.add(profile)
    return profile


@router.get("", response_model=schemas.UserProfileOut)
async def get_profile(
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    profile = _ensure_profile(user, session)
    await session.commit()
    await session.refresh(profile)
    return profile


@router.patch("", response_model=schemas.UserProfileOut)
async def update_profile(
    payload: schemas.UserProfileUpdate,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    profile = _ensure_profile(user, session)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await session.commit()
    await session.refresh(profile)
    return profile
