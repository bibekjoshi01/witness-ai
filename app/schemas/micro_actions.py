import datetime as dt
from pydantic import BaseModel
from typing import Optional

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
