from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    first_time: bool
    token_type: str = "bearer"


class GoogleAuthRequest(BaseModel):
    id_token: str
    timezone: str | None = None
