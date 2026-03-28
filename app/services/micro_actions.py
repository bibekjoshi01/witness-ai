import datetime as dt
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models

DEFAULT_ACTIONS = [
    "Take a 2-minute breathing pause when you feel overwhelmed.",
    "Complete one small task before 10 AM tomorrow.",
    "Step outside for a 5-minute walk.",
]

def next_due_at():
    return dt.datetime.utcnow() + dt.timedelta(days=1)

async def generate_micro_action(session: AsyncSession, user_id: int) -> models.MicroAction:
    # pick first pending else create new
    result = await session.execute(
        select(models.MicroAction)
        .where(models.MicroAction.user_id == user_id, models.MicroAction.status == "pending")
        .order_by(models.MicroAction.created_at.asc())
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    action_text = DEFAULT_ACTIONS[0]
    action = models.MicroAction(user_id=user_id, action=action_text, status="pending", due_at=next_due_at())
    session.add(action)
    await session.commit()
    await session.refresh(action)
    return action

async def complete_micro_action(session: AsyncSession, user_id: int, action_id: int) -> models.MicroAction:
    result = await session.execute(
        select(models.MicroAction).where(models.MicroAction.id == action_id, models.MicroAction.user_id == user_id)
    )
    action = result.scalar_one_or_none()
    if not action:
        raise ValueError("Action not found")
    action.status = "completed"
    await session.commit()
    await session.refresh(action)
    return action
