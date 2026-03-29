from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import datetime as dt
import asyncio

from app import models, schemas
from app.auth import get_current_user
from app.db import get_session
from app.services.insight_gen import generate_and_store_insights

router = APIRouter(prefix="/journal", tags=["journal"])


@router.post("", response_model=schemas.JournalCreateOut)
async def create_journal_entry(
    payload: schemas.JournalCreateIn,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # prevent duplicate entry per user per date
    existing = await session.execute(
        select(models.DailyJournalEntry).where(
            models.DailyJournalEntry.user_id == user.id,
            models.DailyJournalEntry.date == payload.date,
        )
    )
    if existing.scalar_one_or_none():
        return schemas.JournalCreateOut(
            message="Entry for this date already exists."
        )

    try:
        entry = models.DailyJournalEntry(
            user_id=user.id,
            date=payload.date,
            free_text=payload.free_text,
            insights=payload.insights or [],
            micro_actions=payload.micro_actions or [],
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
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500, detail="Failed to save journal entry"
        ) from e

    asyncio.create_task(generate_and_store_insights(entry.id, user.id))
    return schemas.JournalCreateOut(
        message="Your reflection has been saved. We'll start identifying patterns as you continue."
    )


@router.get("", response_model=schemas.JournalListOut)
async def list_journals(
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    start_date: dt.date | None = Query(None),
    end_date: dt.date | None = Query(None),
    limit: int = Query(20, ge=1, le=500),
    offset: int = Query(0, ge=0),
    entry_id: int | None = Query(None),
):
    stmt = select(models.DailyJournalEntry).where(
        models.DailyJournalEntry.user_id == user.id
    )
    if entry_id:
        stmt = stmt.where(models.DailyJournalEntry.id == entry_id)
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
                insights=e.insights or [],
                micro_actions=e.micro_actions or [],
                created_at=e.created_at,
            )
            for e in items
        ],
        total=total,
    )


@router.get("/by-date", response_model=schemas.JournalOut | None)
async def get_journal_by_date(
    date: dt.date,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(models.DailyJournalEntry)
        .where(models.DailyJournalEntry.user_id == user.id)
        .where(models.DailyJournalEntry.date == date)
        .order_by(models.DailyJournalEntry.created_at.desc())
        .limit(1)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        return None
    return schemas.JournalOut(
        id=entry.id,
        date=entry.date,
        free_text=entry.free_text,
        insights=entry.insights or [],
        micro_actions=entry.micro_actions or [],
        created_at=entry.created_at,
    )
