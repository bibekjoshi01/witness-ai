import datetime as dt
from zoneinfo import ZoneInfo
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas


def _get_today(timezone: str | None) -> dt.date:
    try:
        tz = ZoneInfo(timezone) if timezone else ZoneInfo("UTC")
    except Exception:
        tz = ZoneInfo("UTC")
    return dt.datetime.now(tz).date()


def _build_current_state(entries: List[models.DailyJournalEntry]) -> str:
    if not entries:
        return "No reflections yet. Start with a quick check-in today."

    latest = entries[0]
    parts: List[str] = [f"Latest on {latest.date}."]
    if latest.free_text:
        snippet = latest.free_text.strip().replace("\n", " ")[:220]
        parts.append(f"You noted: {snippet}")
    if latest.insights:
        first_insight = next((i for i in latest.insights if isinstance(i, dict)), None)
        if first_insight:
            parts.append(
                f"Key insight: {first_insight.get('title','Insight')} - {first_insight.get('summary','')[:160]}"
            )
    return " ".join(parts)


def _collect_insights(entries: List[models.DailyJournalEntry]) -> List[schemas.InsightItem]:
    items: List[schemas.InsightItem] = []
    for entry in entries:
        for ins in entry.insights or []:
            if isinstance(ins, dict) and len(items) < 4:
                title = ins.get("title") or "Insight"
                summary = ins.get("summary") or ""
                items.append(schemas.InsightItem(title=title, summary=summary))
        if len(items) >= 4:
            break
    return items


def _collect_actions(entries: List[models.DailyJournalEntry]) -> List[schemas.ActionItem]:
    actions: List[schemas.ActionItem] = []
    for entry in entries:
        for ma in entry.micro_actions or []:
            if not isinstance(ma, dict):
                continue
            status = ma.get("status")
            if status and status.lower() == "completed":
                continue
            action = ma.get("action") or "Try a tiny step today."
            due_days = ma.get("due_days")
            actions.append(
                schemas.ActionItem(action=action, status=status, due_days=due_days)
            )
        if len(actions) >= 3:
            break
    return actions


def _compute_streak(entries: List[models.DailyJournalEntry], today: dt.date) -> int:
    dates = {e.date for e in entries}
    streak = 0
    cursor = today
    while cursor in dates:
        streak += 1
        cursor = cursor - dt.timedelta(days=1)
    return streak


async def build_dashboard(
    session: AsyncSession, user: models.User
) -> schemas.DashboardResponse:
    today = _get_today(user.timezone)

    result = await session.execute(
        select(models.DailyJournalEntry)
        .where(models.DailyJournalEntry.user_id == user.id)
        .order_by(models.DailyJournalEntry.date.desc())
        .limit(30)
    )
    entries = list(result.scalars().all())

    current_state = _build_current_state(entries)
    insights = _collect_insights(entries)
    actions = _collect_actions(entries)

    last_entry_date = entries[0].date if entries else None
    total_entries = len(entries)
    weekly_entries = len([e for e in entries if (today - e.date).days <= 6])
    streak = _compute_streak(entries, today)

    if not actions:
        actions.append(
            schemas.ActionItem(
                action="Pick one tiny self-care action (stretch, glass of water, deep breath).",
                status="pending",
                due_days=0,
            )
        )

    return schemas.DashboardResponse(
        current_state=current_state,
        current_date=today,
        last_entry_date=last_entry_date,
        what_were_noticing=insights,
        try_this_today=actions,
        progress=schemas.ProgressBlock(
            streak_days=streak,
            total_entries=total_entries,
            weekly_entries=weekly_entries,
        ),
    )
