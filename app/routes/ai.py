from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app import schemas, models
from app.auth import get_current_user
from app.db import get_session
from app.llm.client import generate_insight
from app.services import insights

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/ask", response_model=schemas.AIResponse)
async def ask_ai(
    payload: schemas.AIAskRequest,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    recent = await insights.latest_insights(session, user.id, limit=3)
    context_lines = [f"- {ins.title}: {ins.summary}" for ins in recent]
    context = "\n".join(context_lines) or "No recent insights."
    prompt = f"User question: {payload.question}\nContext:\n{context}\nGive a concise, actionable reply (<=60 words)."
    answer = await generate_insight(prompt, context=prompt)
    return schemas.AIResponse(answer=answer, source="llm" if "(stub)" not in answer else "stub")
