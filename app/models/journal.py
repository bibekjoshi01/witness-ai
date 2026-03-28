import datetime as dt
from sqlalchemy import Column, Integer, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, JSONType


class DailyJournalEntry(Base):
    __tablename__ = "daily_journal_entries"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    date = Column(Date, nullable=False)

    # user's own journal text
    free_text = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc)
    )

    user = relationship("User", back_populates="journal_entries")
    questions = relationship(
        "GeneratedQuestion",
        back_populates="journal_entry",
        cascade="all, delete-orphan",
    )
    answers = relationship(
        "UserAnswer", back_populates="journal_entry", cascade="all, delete-orphan"
    )


class GeneratedQuestion(Base):
    __tablename__ = "generated_questions"

    id = Column(Integer, primary_key=True)

    journal_entry_id = Column(
        Integer, ForeignKey("daily_journal_entries.id"), nullable=False
    )

    question_text = Column(Text, nullable=False)
    schema = Column(JSONType, nullable=False)

    created_at = Column(
        DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc)
    )

    journal_entry = relationship("DailyJournalEntry", back_populates="questions")
    answers = relationship(
        "UserAnswer", back_populates="question", cascade="all, delete-orphan"
    )


class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True)

    question_id = Column(Integer, ForeignKey("generated_questions.id"), nullable=False)

    journal_entry_id = Column(
        Integer, ForeignKey("daily_journal_entries.id"), nullable=False
    )

    answer_data = Column(JSONType, nullable=True)

    created_at = Column(
        DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc)
    )

    question = relationship("GeneratedQuestion", back_populates="answers")
    journal_entry = relationship("DailyJournalEntry", back_populates="answers")


__all__ = ["DailyJournalEntry", "GeneratedQuestion", "UserAnswer"]
