import datetime as dt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models, schemas
from app.auth import get_current_user
from app.db import get_session
from app.services import questions, patterns, micro_actions
from app.background.scheduler import run_post_reflection

router = APIRouter(prefix="/reflections", tags=["reflections"])

@router.get("/questions", response_model=list[schemas.QuestionOut])
async def get_questions(date: dt.date | None = None, session: AsyncSession = Depends(get_session)):
    qs = await questions.get_or_create_daily_questions(session, date=date)
    return [schemas.QuestionOut(id=q.id, date=q.date, prompt=q.prompt, category=q.category) for q in qs]

@router.post("", response_model=schemas.ReflectionOut)
async def submit_reflection(
    payload: schemas.ReflectionIn,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    reflection = models.Reflection(
        user_id=user.id,
        date=payload.date,
        answers=payload.answers,
        mood_score=payload.mood_score,
    )
    session.add(reflection)
    await session.commit()
    await session.refresh(reflection)

    # kick off pattern detection (fire-and-forget)
    await patterns.detect_patterns(session, user)
    await micro_actions.generate_micro_action(session, user.id)

    return schemas.ReflectionOut(
        id=reflection.id,
        date=reflection.date,
        mood_score=reflection.mood_score,
        created_at=reflection.created_at,
    )
