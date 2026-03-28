from pydantic import BaseModel, Field, EmailStr


class UserProfileOut(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    profile_picture: str | None = None
    age: int | None = Field(default=None, ge=18)
    gender: str | None = None
    hobbies: list[str] | None = None
    mental_health_goal: str | None = None
    extra_notes: str | None = None


class UserProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    age: int | None = Field(default=None, ge=18)
    gender: str | None = Field(default=None)
    hobbies: list[str] | None = None
    mental_health_goal: str | None = None
    extra_notes: str | None = None


class UserProfileUpdateOut(BaseModel):
    message: str
