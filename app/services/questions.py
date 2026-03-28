import datetime as dt
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models

SEED_QUESTIONS = [
    {"prompt": "How was your energy today?", "category": "mood"},
    {"prompt": "Did you avoid any important task today?", "category": "avoidance"},
    {"prompt": "What thought repeated most frequently today?", "category": "thought"},
]

def _date_today():
    return dt.date.today()

async def get_or_create_daily_questions(session: AsyncSession, date: dt.date | None = None) -> List[models.DailyQuestion]:
    target_date = date or _date_today()
    result = await session.execute(
        select(models.DailyQuestion).where(models.DailyQuestion.date == target_date)
    )
    existing = result.scalars().all()
    if existing:
        return existing
    created = []
    for q in SEED_QUESTIONS:
        dq = models.DailyQuestion(date=target_date, prompt=q["prompt"], category=q.get("category"))
        session.add(dq)
        created.append(dq)
    await session.commit()
    for dq in created:
        await session.refresh(dq)
    return created
