import datetime as dt
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ChatMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[int] = None


class ChatMessageOut(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)


class ChatReply(BaseModel):
    session_id: int
    user_message_id: int
    assistant_message_id: int
    reply: str
    title: Optional[str] = None
    history: List[ChatMessageOut] | None = None


class ChatSessionOut(BaseModel):
    id: int
    title: Optional[str]
    created_at: dt.datetime
    updated_at: dt.datetime | None = None

    model_config = ConfigDict(from_attributes=True)
