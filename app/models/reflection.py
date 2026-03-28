import datetime as dt
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, JSONType


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

__all__ = ["DailyQuestion", "Reflection"]
