import datetime as dt
from typing import Any, Optional
from pydantic import BaseModel, Field

class QuestionOut(BaseModel):
    id: Optional[int]
    date: dt.date
    prompt: str
    category: Optional[str]


class ReflectionIn(BaseModel):
    date: dt.date
    answers: dict[str, Any]
    mood_score: Optional[int] = Field(default=None, ge=1, le=10)


class ReflectionOut(BaseModel):
    id: int
    date: dt.date
    mood_score: Optional[int]
    created_at: dt.datetime

    class Config:
        from_attributes = True
