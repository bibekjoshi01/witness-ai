from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from app.db import Base

JSONType = JSONB if hasattr(JSONB, "__module__") else JSON

__all__ = ["Base", "JSONType"]
