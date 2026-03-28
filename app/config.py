from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    database_url: str = Field(
        default="sqlite+aiosqlite:///./witness.db",
        description="SQLAlchemy database URL",
    )
    jwt_secret: str = Field(default="change-me", description="JWT signing secret")
    jwt_expires_days: int = Field(default=30, description="JWT expiration in days")
    llm_provider: str = Field(default="stub", description="LLM provider name")
    llm_model: str = Field(default="stub-model", description="LLM model id")
    llm_api_key: str | None = Field(default=None, description="LLM provider API key")
    scheduler_enabled: bool = Field(default=True)
    app_timezone: str = Field(default="UTC")
    google_client_id: str = Field(
        description="Google OAuth client id"
    )

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
