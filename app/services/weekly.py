import datetime as dt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models

async def generate_weekly_summary(session: AsyncSession, user: models.User) -> models.WeeklySummary:
    today = dt.date.today()
    week_start = today - dt.timedelta(days=today.weekday())
    result = await session.execute(
        select(models.WeeklySummary).where(
            models.WeeklySummary.user_id == user.id, models.WeeklySummary.week_start == week_start
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    # naive summary
    summary = "This week you reflected consistently. Keep observing small shifts in mood and tasks."
    weekly = models.WeeklySummary(
        user_id=user.id,
        week_start=week_start,
        content=summary,
        shared_with_peer=False,
    )
    session.add(weekly)
    await session.commit()
    await session.refresh(weekly)
    return weekly
