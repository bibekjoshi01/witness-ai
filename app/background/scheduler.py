import datetime as dt
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import AsyncSessionLocal
from app import models
from app.services import questions, patterns, weekly, micro_actions
from app.config import get_settings

settings = get_settings()
scheduler = AsyncIOScheduler(timezone=settings.app_timezone)

async def run_daily_jobs():
    async with AsyncSessionLocal() as session:
        users = (await session.execute(select(models.User))).scalars().all()
        for user in users:
            await questions.get_or_create_daily_questions(session)
            await micro_actions.generate_micro_action(session, user.id)

async def run_weekly_jobs():
    async with AsyncSessionLocal() as session:
        users = (await session.execute(select(models.User))).scalars().all()
        for user in users:
            await weekly.generate_weekly_summary(session, user)

async def run_post_reflection(user: models.User):
    async with AsyncSessionLocal() as session:
        await patterns.detect_patterns(session, user)
        await micro_actions.generate_micro_action(session, user.id)

def start_scheduler():
    if not settings.scheduler_enabled:
        return
    if scheduler.running:
        return
    scheduler.add_job(run_daily_jobs, CronTrigger(hour=7, minute=0))
    scheduler.add_job(run_weekly_jobs, CronTrigger(day_of_week="sun", hour=8, minute=0))
    scheduler.start()
