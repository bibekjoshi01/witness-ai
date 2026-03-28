from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models

async def latest_insights(session: AsyncSession, user_id: int, limit: int = 5):
    result = await session.execute(
        select(models.PatternInsight)
        .where(models.PatternInsight.user_id == user_id)
        .order_by(models.PatternInsight.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()

async def insights_history(session: AsyncSession, user_id: int, offset: int = 0, limit: int = 20):
    result = await session.execute(
        select(models.PatternInsight)
        .where(models.PatternInsight.user_id == user_id)
        .order_by(models.PatternInsight.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()
