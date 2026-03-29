from typing import Optional
from app.config import get_settings
from app.llm.mistral_adapter import MistralAdapter

_settings = get_settings()


def get_llm_adapter() -> Optional[MistralAdapter]:
    if not _settings.llm_api_key:
        return None
    return MistralAdapter(api_key=_settings.llm_api_key)
