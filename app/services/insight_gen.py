import asyncio
import datetime as dt
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from app import models
from app.db import AsyncSessionLocal
from app.llm.factory import get_llm_adapter


class GeneratedInsight(BaseModel):
    title: str = Field(..., max_length=120)
    summary: str = Field(..., max_length=400)
    tags: List[str] = Field(default_factory=list)


class GeneratedMicroAction(BaseModel):
    action: str = Field(..., max_length=200)
    status: str = Field(default="pending")
    due_days: Optional[int] = Field(default=None, ge=0, le=14)


class InsightActionBundle(BaseModel):
    insights: List[GeneratedInsight]
    micro_actions: List[GeneratedMicroAction]


def _fallback_bundle() -> InsightActionBundle:
    return InsightActionBundle(
        insights=[
            GeneratedInsight(
                title="Energy dipped mid-day",
                summary="You mentioned low energy; try a short break before important tasks.",
                tags=["energy", "breaks"],
            )
        ],
        micro_actions=[
            GeneratedMicroAction(
                action="Take a 5-minute walk before your next focus block",
                status="pending",
                due_days=1,
            )
        ],
    )


def _build_prompt(date: dt.date, user_meta: str, history: str) -> str:
    parser = PydanticOutputParser(pydantic_object=InsightActionBundle)
    prompt_template = PromptTemplate(
        template="""
You are Witness AI, a concise mental health reflection assistant.
Given today's entry date {date}, user meta, and recent history, generate supportive insights and tiny micro-actions.
{format_instructions}
Rules:
- 2-3 insights max; each <=120 chars title and <=300 chars summary.
- 1-2 micro-actions; practical, very small, doable within 24-48h; include status and optional due_days (0-14).
- Avoid clinical/diagnostic language; be gentle and stigma-free.
- Keep actions observable and specific.
User meta:
{user_meta}
History:
{history}
""",
        input_variables=["date", "user_meta", "history"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    return (
        prompt_template.format(
            date=str(date),
            user_meta=user_meta or "none",
            history=history or "none",
        ),
        parser,
    )


async def generate_and_store_insights(entry_id: int, user_id: int) -> None:
    adapter = get_llm_adapter()
    async with AsyncSessionLocal() as session:
        entry_result = await session.execute(
            select(models.DailyJournalEntry).where(
                models.DailyJournalEntry.id == entry_id
            )
        )
        entry = entry_result.scalar_one_or_none()
        if not entry:
            return

        # Load user with profile eagerly
        user_result = await session.execute(
            select(models.User)
            .options(selectinload(models.User.profile))
            .where(models.User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        if not user:
            return

        # recent history
        hist_result = await session.execute(
            select(models.DailyJournalEntry)
            .where(models.DailyJournalEntry.user_id == user.id)
            .order_by(models.DailyJournalEntry.date.desc())
            .limit(5)
        )
        recent = hist_result.scalars().all()

        history_lines = []
        for e in recent:
            history_lines.append(f"- {e.date}: {e.free_text or 'no text'}")
            if e.insights:
                for ins in e.insights:
                    if isinstance(ins, dict):
                        history_lines.append(
                            f"  insight: {ins.get('title','')} | {ins.get('summary','')}"
                        )
            if e.micro_actions:
                for ma in e.micro_actions:
                    if isinstance(ma, dict):
                        history_lines.append(
                            f"  micro: {ma.get('action','')} status={ma.get('status','')}"
                        )

        meta_parts = []
        if user.profile:
            if user.profile.age:
                meta_parts.append(f"age: {user.profile.age}")
            if user.profile.gender:
                meta_parts.append(f"gender: {user.profile.gender}")
            if user.profile.hobbies:
                meta_parts.append(f"hobbies: {', '.join(user.profile.hobbies)}")
            if user.profile.mental_health_goal:
                meta_parts.append(f"goal: {user.profile.mental_health_goal}")
        if user.timezone:
            meta_parts.append(f"timezone: {user.timezone}")

        prompt, parser = _build_prompt(
            date=entry.date,
            user_meta="; ".join(meta_parts) or "none",
            history="\n".join(history_lines[-30:]) or "none",
        )

        bundle: InsightActionBundle
        if adapter:
            try:
                raw = await adapter.generate_text(
                    prompt, temperature=0.25, max_tokens=500
                )
                bundle = parser.parse(raw)
            except Exception:
                bundle = _fallback_bundle()
        else:
            bundle = _fallback_bundle()

        entry.insights = [i.model_dump() for i in bundle.insights]
        entry.micro_actions = [m.model_dump() for m in bundle.micro_actions]
        await session.commit()
