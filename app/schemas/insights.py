import datetime as dt
from typing import List
from pydantic import BaseModel

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
