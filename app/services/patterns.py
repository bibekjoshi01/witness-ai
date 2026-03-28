import datetime as dt
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models

LOW_MOOD_THRESHOLD = 3
LOW_MOOD_WINDOW = 3

async def detect_patterns(session: AsyncSession, user: models.User) -> List[models.PatternInsight]:
    result = await session.execute(
        select(models.Reflection)
        .where(models.Reflection.user_id == user.id)
        .order_by(models.Reflection.date.desc())
        .limit(10)
    )
    reflections = result.scalars().all()
    insights: List[models.PatternInsight] = []

    if len(reflections) >= LOW_MOOD_WINDOW:
        last_moods = [r.mood_score for r in reflections[:LOW_MOOD_WINDOW] if r.mood_score is not None]
        if len(last_moods) == LOW_MOOD_WINDOW and all(m <= LOW_MOOD_THRESHOLD for m in last_moods):
            insights.append(
                models.PatternInsight(
                    user_id=user.id,
                    title="Sustained low mood",
                    summary="Your last few days show low mood scores. Consider scheduling a small, energizing activity.",
                    tags=["mood", "energy"],
                    severity="warning",
                )
            )

    # Simple avoidance detection
    avoided = [r for r in reflections if r.answers.get("avoided_task")]
    if len(avoided) >= 2:
        insights.append(
            models.PatternInsight(
                user_id=user.id,
                title="Task avoidance pattern",
                summary="You reported avoiding important tasks multiple times. Try a small step early tomorrow.",
                tags=["avoidance"],
                severity="info",
            )
        )

    # Upcoming deadline stress: if frequent "deadline" mention in thoughts
    deadline_mentions = [
        r for r in reflections if "deadline" in str(r.answers.get("thought", "")).lower()
    ]
    if len(deadline_mentions) >= 2:
        insights.append(
            models.PatternInsight(
                user_id=user.id,
                title="Deadline stress",
                summary="Deadlines keep coming up. Plan one protective block before your next deadline.",
                tags=["stress", "deadline"],
                severity="info",
            )
        )

    for insight in insights:
        session.add(insight)
    if insights:
        await session.commit()
        for ins in insights:
            await session.refresh(ins)
    return insights
