import datetime as dt
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class InsightItem(BaseModel):
    title: str
    summary: str


class ActionItem(BaseModel):
    action: str
    status: str | None = None
    due_days: int | None = None


class ProgressBlock(BaseModel):
    streak_days: int
    total_entries: int
    weekly_entries: int


class DashboardResponse(BaseModel):
    current_state: str
    current_date: dt.date
    last_entry_date: Optional[dt.date]
    what_were_noticing: List[InsightItem]
    try_this_today: List[ActionItem]
    progress: ProgressBlock

    model_config = ConfigDict(from_attributes=True)
