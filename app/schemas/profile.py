from pydantic import BaseModel

class UserProfileOut(BaseModel):
    name: str | None = None
    email: str | None = None
    profile_picture: str | None = None
    age: int | None = None
    gender: str | None = None
    hobbies: list[str] | None = None
    mental_health_goal: str | None = None
    extra_notes: str | None = None


class UserProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    profile_picture: str | None = None
    age: int | None = None
    gender: str | None = None
    hobbies: list[str] | None = None
    mental_health_goal: str | None = None
    extra_notes: str | None = None
