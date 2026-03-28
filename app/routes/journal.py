from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import datetime as dt

from app import models, schemas
from app.auth import get_current_user
from app.db import get_session

router = APIRouter(prefix="/journal", tags=["journal"])


@router.post("", response_model=schemas.JournalCreateOut)
async def create_journal_entry(
    payload: schemas.JournalCreateIn,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    entry = models.DailyJournalEntry(
        user_id=user.id,
        date=payload.date,
        free_text=payload.free_text,
    )
    session.add(entry)
    await session.flush()

    for q in payload.questions:
        gq = models.GeneratedQuestion(
            journal_entry_id=entry.id,
            question_text=q.question_text,
            question_schema=q.question_schema,
        )
        session.add(gq)
        await session.flush()
        ua = models.UserAnswer(
            question_id=gq.id,
            journal_entry_id=entry.id,
            answer_data=q.answer_data,
        )
        session.add(ua)

    await session.commit()
    await session.refresh(entry)
    return schemas.JournalCreateOut(
        {
            "message": "Your reflection has been saved. We'll start identifying patterns as you continue."
        }
    )


@router.get("", response_model=schemas.JournalListOut)
async def list_journals(
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    start_date: dt.date | None = Query(None),
    end_date: dt.date | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    stmt = select(models.DailyJournalEntry).where(
        models.DailyJournalEntry.user_id == user.id
    )
    if start_date:
        stmt = stmt.where(models.DailyJournalEntry.date >= start_date)
    if end_date:
        stmt = stmt.where(models.DailyJournalEntry.date <= end_date)
    total_stmt = stmt.with_only_columns(func.count())

    stmt = (
        stmt.order_by(models.DailyJournalEntry.date.desc()).limit(limit).offset(offset)
    )
    result = await session.execute(stmt)
    items = result.scalars().all()

    total_result = await session.execute(total_stmt)
    total = total_result.scalar_one()

    return schemas.JournalListOut(
        items=[
            schemas.JournalOut(
                id=e.id,
                date=e.date,
                free_text=e.free_text,
                created_at=e.created_at,
            )
            for e in items
        ],
        total=total,
    )
