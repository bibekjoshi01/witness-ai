import datetime as dt
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship
from app.db import Base

JSONType = JSONB if hasattr(JSONB, "__module__") else JSON

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(255), unique=True, nullable=False, index=True)
    timezone = Column(String(64), default="UTC")
    created_at = Column(DateTime(timezone=True), default=dt.datetime.utcnow)

    reflections = relationship("Reflection", back_populates="user")
    insights = relationship("PatternInsight", back_populates="user")

class DailyQuestion(Base):
    __tablename__ = "daily_questions"
    id = Column(Integer, primary_key=True)
    date = Column(Date, index=True, nullable=False)
    prompt = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    generated_by = Column(String(50), default="system")

class Reflection(Base):
    __tablename__ = "reflections"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    answers = Column(JSONType, nullable=False)
    mood_score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=dt.datetime.utcnow)

    user = relationship("User", back_populates="reflections")

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
