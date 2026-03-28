import datetime as dt
from sqlalchemy import Column, Integer, String, DateTime, Date, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, JSONType


class PatternInsight(Base):
    __tablename__ = "pattern_insights"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    tags = Column(JSONType, default=list)
    severity = Column(String(20), default="info")
    source = Column(String(50), default="rule")
    created_at = Column(DateTime(timezone=True), default=dt.datetime.utcnow)

    user = relationship("User", back_populates="insights")


class MicroAction(Base):
    __tablename__ = "micro_actions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    due_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=dt.datetime.utcnow)


class WeeklySummary(Base):
    __tablename__ = "weekly_summaries"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    week_start = Column(Date, nullable=False)
    content = Column(Text, nullable=False)
    shared_with_peer = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=dt.datetime.utcnow)

__all__ = ["PatternInsight", "MicroAction", "WeeklySummary"]
