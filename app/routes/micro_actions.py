from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import schemas, models
from app.auth import get_current_user
from app.db import get_session
from app.services import micro_actions

router = APIRouter(prefix="/micro-actions", tags=["micro-actions"])

@router.get("/next", response_model=schemas.MicroActionOut)
async def get_next_action(
    user: models.User = Depends(get_current_user), session: AsyncSession = Depends(get_session)
):
    action = await micro_actions.generate_micro_action(session, user.id)
    return action

@router.post("/complete", response_model=schemas.MicroActionOut)
async def complete_action(
    payload: schemas.MicroActionCompleteIn,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        action = await micro_actions.complete_micro_action(session, user.id, payload.action_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return action
