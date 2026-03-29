import datetime as dt
import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from app import models
from app.llm.factory import get_llm_adapter


class QuestionField(BaseModel):
    name: str = Field(..., max_length=50)
    type: str = Field(..., description="select | multi_select | text | scale")
    label: str = Field(..., max_length=120)
    options: Optional[List[str]] = None
    scale_min: Optional[int] = None
    scale_max: Optional[int] = None


class QuestionSchema(BaseModel):
    type: str = Field(default="multi_input")
    fields: List[QuestionField]


class GeneratedQuestionOut(BaseModel):
    question_text: str = Field(..., max_length=120)
    schema: QuestionSchema


class GeneratedQuestionList(BaseModel):
    questions: List[GeneratedQuestionOut]


def _fallback_questions() -> List[dict]:
    return [
        GeneratedQuestionOut(
            question_text="How are you feeling today?",
            schema=QuestionSchema(
                fields=[
                    QuestionField(
                        name="emotion",
                        type="select",
                        label="Emotion",
                        options=["calm", "anxious", "stressed", "okay"],
                    ),
                    QuestionField(
                        name="intensity",
                        type="scale",
                        label="Intensity",
                        scale_min=1,
                        scale_max=5,
                    ),
                ]
            ),
        ),
        GeneratedQuestionOut(
            question_text="What drained the most energy today?",
            schema=QuestionSchema(
                fields=[
                    QuestionField(
                        name="stressor",
                        type="text",
                        label="Describe briefly",
                    )
                ]
            ),
        ),
        GeneratedQuestionOut(
            question_text="Did you avoid an important task?",
            schema=QuestionSchema(
                fields=[
                    QuestionField(
                        name="avoidance",
                        type="select",
                        label="Avoided?",
                        options=["yes", "no"],
                    )
                ]
            ),
        ),
    ]


async def generate_questions_for_user(
    session: AsyncSession, user: models.User, target_date: dt.date | None = None
) -> List[dict]:
    target_date = target_date or dt.date.today()
    result = await session.execute(
        select(models.DailyJournalEntry)
        .where(models.DailyJournalEntry.user_id == user.id)
        .order_by(models.DailyJournalEntry.date.desc())
        .limit(5)
    )
    recent = result.scalars().all()

    adapter = get_llm_adapter()
    if not adapter:
        return [q.model_dump() for q in _fallback_questions()]

    history_lines = []
    for entry in recent:
        history_lines.append(f"- {entry.date}: {entry.free_text or 'no free text'}")
        if entry.insights:
            for ins in entry.insights:
                if isinstance(ins, dict):
                    history_lines.append(
                        f"  insight: {ins.get('title','')} | {ins.get('summary','')}"
                    )
        if entry.micro_actions:
            for ma in entry.micro_actions:
                if isinstance(ma, dict):
                    history_lines.append(
                        f"  micro: {ma.get('action','')} status={ma.get('status','')}"
                    )

    meta_lines = []
    if user.profile:
        if user.profile.name:
            meta_lines.append(f"name: {user.profile.name}")
        if user.profile.age:
            meta_lines.append(f"age: {user.profile.age}")
        if user.profile.gender:
            meta_lines.append(f"gender: {user.profile.gender}")
        if user.profile.hobbies:
            meta_lines.append(f"hobbies: {', '.join(user.profile.hobbies)}")
        if user.profile.mental_health_goal:
            meta_lines.append(f"goal: {user.profile.mental_health_goal}")
    if user.timezone:
        meta_lines.append(f"timezone: {user.timezone}")

    parser = PydanticOutputParser(pydantic_object=GeneratedQuestionList)
    prompt_template = PromptTemplate(
        template="""
You are Witness AI, a concise mental health reflection assistant.
Generate exactly 3 structured, purposeful questions for a user's daily journal entry for {date}.
Use past reflections, insights, micro-actions, and user profile to personalize, but stay gentle and stigma-free.
{format_instructions}
Rules:
- Max 120 chars per question.
- Prefer scales or multiple choice when possible.
- Avoid clinical/diagnostic language.
- If no history, use helpful, general prompts about energy, focus, and avoidance.
- Schemas use fields: name, type(select|multi_select|text|scale), label, options, scale_min, scale_max.
User meta:
{user_meta}
History:
{history}
""",
        partial_variables={"format_instructions": parser.get_format_instructions()},
        input_variables=["date", "user_meta", "history"],
    )
    prompt = prompt_template.format(
        date=str(target_date),
        history="\n".join(history_lines[-20:]) or "none",
        user_meta="; ".join(meta_lines) or "none",
    )

    try:
        raw = await adapter.generate_text(prompt, temperature=0.2, max_tokens=500)
        parsed = parser.parse(raw)
        cleaned = [
            {"question_text": q.question_text, "question_schema": q.schema.model_dump()}
            for q in parsed.questions[:3]
        ]
        if cleaned:
            return cleaned
    except Exception:
        return [q.model_dump() for q in _fallback_questions()]

    return [q.model_dump() for q in _fallback_questions()]
