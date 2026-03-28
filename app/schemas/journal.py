import datetime as dt
from typing import Any, List, Optional
from pydantic import BaseModel


class JournalQuestionIn(BaseModel):
    question_text: str
    schema: dict[str, Any]
    answer_data: Optional[dict[str, Any]] = None


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

    class Config:
        from_attributes = True


class JournalListOut(BaseModel):
    items: List[JournalOut]
    total: int
