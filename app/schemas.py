import datetime as dt
from typing import Any, List, Optional
from pydantic import BaseModel, Field

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class DeviceAuthRequest(BaseModel):
    device_id: str
    timezone: str | None = None

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

class InsightOut(BaseModel):
    id: int
    title: str
    summary: str
    tags: List[str] | None = []
    severity: str
    source: str
    created_at: dt.datetime
    class Config:
        from_attributes = True

class MicroActionOut(BaseModel):
    id: int
    action: str
    status: str
    due_at: Optional[dt.datetime]
    created_at: dt.datetime
    class Config:
        from_attributes = True

class MicroActionCompleteIn(BaseModel):
    action_id: int

class AIAskRequest(BaseModel):
    question: str

class AIResponse(BaseModel):
    answer: str
    source: str

class WeeklySummaryOut(BaseModel):
    week_start: dt.date
    content: str
    shared_with_peer: bool
    created_at: dt.datetime
    class Config:
        from_attributes = True
