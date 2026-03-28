from fastapi import APIRouter, Depends
from app.background import scheduler
from app.auth import get_current_user
from app import models

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/run/daily")
async def run_daily(user: models.User = Depends(get_current_user)):
    # Authenticated user can trigger; in real life restrict to admins.
    await scheduler.run_daily_jobs()
    return {"status": "triggered"}

@router.post("/run/weekly")
async def run_weekly(user: models.User = Depends(get_current_user)):
    await scheduler.run_weekly_jobs()
    return {"status": "triggered"}
