import datetime as dt
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.models.base import Base, JSONType


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_sub = Column(String(255), unique=True, nullable=False, index=True)
    timezone = Column(String(64), default="UTC")
    created_at = Column(
        DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc)
    )

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False
    )
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    profile_picture = Column(String(500), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    hobbies = Column(JSONType, default=list)
    mental_health_goal = Column(String(255), nullable=True)
    extra_notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: dt.datetime.now(dt.timezone.utc),
        onupdate=lambda: dt.datetime.now(dt.timezone.utc),
    )
    user = relationship("User", back_populates="profile")


__all__ = ["User", "UserProfile"]
