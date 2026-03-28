from typing import Optional
import httpx
from app.config import get_settings

settings = get_settings()

async def generate_insight(prompt: str, context: Optional[str] = None) -> str:
    # If no API key, fall back to stub
    if not settings.llm_api_key or settings.llm_provider == "stub":
        return f"(stub) {prompt[:120]}"
    if settings.llm_provider.lower() == "openai":
        headers = {"Authorization": f"Bearer {settings.llm_api_key}"}
        payload = {
            "model": settings.llm_model,
            "messages": [
                {"role": "system", "content": "You are a concise mental health reflection assistant."},
                {"role": "user", "content": context or prompt},
            ],
            "temperature": 0.4,
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    return "LLM provider not configured"
