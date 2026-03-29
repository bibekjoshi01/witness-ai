from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import datetime as dt
from app import schemas, models
from app.auth import get_current_user
from app.db import get_session
from app.services.question_gen import generate_questions_for_user

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/generate-questions", response_model=list[schemas.JournalQuestionOut])
async def generate_questions(
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    today = dt.date.today()
    existing = await session.execute(
        select(models.DailyJournalEntry).where(
            models.DailyJournalEntry.user_id == user.id,
            models.DailyJournalEntry.date == today,
        )
    )
    if existing.scalar_one_or_none():
        return []

    questions = await generate_questions_for_user(session, user)
    # return with schema alias
    return [
        schemas.JournalQuestionOut(
            question_text=q["question_text"], question_schema=q["question_schema"]
        )
        for q in questions
    ]
