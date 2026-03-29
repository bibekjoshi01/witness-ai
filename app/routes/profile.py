import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

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


@router.post("/picture", response_model=schemas.UserProfileOut)
async def upload_profile_picture(
    request: Request,
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed.")

    profile = await _ensure_profile(user, session)

    media_dir = Path("media/profile_pictures")
    media_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{uuid4().hex}{ext}"
    filepath = media_dir / filename

    content = await file.read()
    # simple size guard ~5MB
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 5MB).")

    with open(filepath, "wb") as f:
        f.write(content)

    base_url = str(request.base_url).rstrip("/")
    profile.profile_picture = f"{base_url}/media/profile_pictures/{filename}"

    await session.commit()
    await session.refresh(profile)
    return profile
