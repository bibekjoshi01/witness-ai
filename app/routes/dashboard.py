from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.auth import get_current_user
from app.db import get_session
from app.services.dashboard import build_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=schemas.DashboardResponse)
async def get_dashboard(
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await build_dashboard(session, user)
