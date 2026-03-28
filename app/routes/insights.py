from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app import schemas, models
from app.auth import get_current_user
from app.db import get_session
from app.services import insights

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("/latest", response_model=list[schemas.InsightOut])
async def get_latest_insights(
    user: models.User = Depends(get_current_user), session: AsyncSession = Depends(get_session)
):
    data = await insights.latest_insights(session, user.id)
    return data

@router.get("/history", response_model=list[schemas.InsightOut])
async def get_history(
    user: models.User = Depends(get_current_user), session: AsyncSession = Depends(get_session)
):
    data = await insights.insights_history(session, user.id)
    return data
