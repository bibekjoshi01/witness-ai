import datetime as dt
from typing import Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class JournalQuestionIn(BaseModel):
    question_text: str
    question_schema: dict[str, Any] = Field(alias="schema")
    answer_data: Optional[dict[str, Any]] = None

    model_config = ConfigDict(populate_by_name=True)


class JournalCreateIn(BaseModel):
    date: dt.date
    free_text: Optional[str] = None
    questions: List[JournalQuestionIn]


class JournalCreateOut(BaseModel):
    message: str


class JournalOut(BaseModel):
    id: int
    date: dt.date
    mood: Optional[str]
    free_text: Optional[str]
    created_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)


class JournalListOut(BaseModel):
    items: List[JournalOut]
    total: int
