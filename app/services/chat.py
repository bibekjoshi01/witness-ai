from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.llm.factory import get_llm_adapter


def _fallback_reply(message: str) -> str:
    return (
        "Thanks for sharing. I don't have AI enabled right now, but I'm here to listen. "
        "Tell me more about what's on your mind."
    )


def _build_profile_block(user: models.User) -> str:
    parts: List[str] = []
    profile = getattr(user, "profile", None)
    if profile:
        if profile.name:
            parts.append(f"name: {profile.name}")
        if profile.age:
            parts.append(f"age: {profile.age}")
        if profile.gender:
            parts.append(f"gender: {profile.gender}")
        if profile.hobbies:
            parts.append(f"hobbies: {', '.join(profile.hobbies)}")
        if profile.mental_health_goal:
            parts.append(f"goal: {profile.mental_health_goal}")
    if user.timezone:
        parts.append(f"timezone: {user.timezone}")
    return "; ".join(parts) or "none"


async def _build_journal_block(session: AsyncSession, user: models.User) -> str:
    stmt = (
        select(models.DailyJournalEntry)
        .where(models.DailyJournalEntry.user_id == user.id)
        .order_by(models.DailyJournalEntry.date.desc())
        .limit(7)
    )
    result = await session.execute(stmt)
    entries = result.scalars().all()
    lines: List[str] = []
    for entry in entries:
        snippet = (entry.free_text or "no text")[:160].replace("\n", " ")
        lines.append(f"- {entry.date}: {snippet}")
        if entry.insights:
            for ins in entry.insights[:2]:
                if isinstance(ins, dict):
                    title = ins.get("title", "insight")
                    summary = ins.get("summary", "")[:120]
                    lines.append(f"  insight: {title} | {summary}")
        if entry.micro_actions:
            for ma in entry.micro_actions[:2]:
                if isinstance(ma, dict):
                    action = ma.get("action", "")[:120]
                    status = ma.get("status", "")
                    lines.append(f"  micro: {action} (status={status})")
    return "\n".join(lines) or "none"


async def _fetch_chat_history(session: AsyncSession, chat_session_id: int) -> List[models.ChatMessage]:
    stmt = (
        select(models.ChatMessage)
        .where(models.ChatMessage.session_id == chat_session_id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(10)
    )
    result = await session.execute(stmt)
    messages = list(result.scalars().all())
    messages.reverse()
    return messages


async def generate_chat_reply(
    session: AsyncSession,
    user: models.User,
    chat_session: models.ChatSession,
    user_message: str,
) -> str:
    adapter = get_llm_adapter()
    if not adapter:
        return _fallback_reply(user_message)

    profile_block = _build_profile_block(user)
    journal_block = await _build_journal_block(session, user)
    history = await _fetch_chat_history(session, chat_session.id)
    history_lines = [f"{m.role}: {m.content}" for m in history[-8:]]

    prompt = f"""
You are Witness AI, a concise, empathetic mental health companion.
Use the provided profile and daily logs for context. Keep responses under 120 words, supportive, and non-clinical. Avoid promises or diagnoses. If the user hints at harm to self or others, encourage reaching out to a trusted person or hotline.

User profile:
{profile_block}

Recent daily logs:
{journal_block}

Recent chat history:
{chr(10).join(history_lines) or 'none'}

User just said: {user_message}
Respond with a single, kind reply.
"""

    try:
        return await adapter.generate_text(prompt, temperature=0.35, max_tokens=280)
    except Exception:
        return _fallback_reply(user_message)
