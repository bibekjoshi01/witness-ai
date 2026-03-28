import datetime as dt
from pydantic import BaseModel

class WeeklySummaryOut(BaseModel):
    week_start: dt.date
    content: str
    shared_with_peer: bool
    created_at: dt.datetime

    class Config:
        from_attributes = True
