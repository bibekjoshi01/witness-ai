import datetime as dt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app import models, schemas
from app.auth import get_current_user
from app.db import get_session
from app.services.chat import generate_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


async def _get_session_for_user(
    session: AsyncSession, user_id: int, session_id: int | None
) -> models.ChatSession | None:
    if session_id is None:
        return None
    result = await session.execute(
        select(models.ChatSession).where(
            models.ChatSession.id == session_id,
            models.ChatSession.user_id == user_id,
        )
    )
    return result.scalars().first()


@router.get("/sessions", response_model=list[schemas.ChatSessionOut])
async def list_sessions(
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(models.ChatSession)
        .where(models.ChatSession.user_id == user.id)
        .order_by(models.ChatSession.updated_at.desc())
    )
    sessions = result.scalars().all()
    return [
        schemas.ChatSessionOut(
            id=s.id, title=s.title, created_at=s.created_at, updated_at=s.updated_at
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages", response_model=list[schemas.ChatMessageOut])
async def get_session_messages(
    session_id: int,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    chat_session = await _get_session_for_user(session, user.id, session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    result = await session.execute(
        select(models.ChatMessage)
        .where(models.ChatMessage.session_id == chat_session.id)
        .order_by(models.ChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [
        schemas.ChatMessageOut(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.post("/message", response_model=schemas.ChatReply)
async def send_message(
    payload: schemas.ChatMessageCreate,
    user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    message_text = payload.message.strip()
    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    chat_session = await _get_session_for_user(session, user.id, payload.session_id)
    if payload.session_id and not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    if not chat_session:
        chat_session = models.ChatSession(user_id=user.id, title=None)
        session.add(chat_session)
        await session.flush()

    user_message = models.ChatMessage(
        session_id=chat_session.id,
        user_id=user.id,
        role="user",
        content=message_text,
    )
    session.add(user_message)
    await session.flush()

    reply = await generate_chat_reply(session, user, chat_session, message_text)

    assistant_message = models.ChatMessage(
        session_id=chat_session.id,
        user_id=None,
        role="assistant",
        content=reply.strip(),
    )
    session.add(assistant_message)

    if not chat_session.title:
        chat_session.title = message_text[:80]

    chat_session.updated_at = dt.datetime.now(dt.timezone.utc)

    await session.commit()

    # pull recent history explicitly to avoid lazy-loading with async session
    result = await session.execute(
        select(models.ChatMessage)
        .where(models.ChatMessage.session_id == chat_session.id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(6)
    )
    history = list(result.scalars().all())
    history.reverse()

    return schemas.ChatReply(
        session_id=chat_session.id,
        user_message_id=user_message.id,
        assistant_message_id=assistant_message.id,
        reply=assistant_message.content,
        title=chat_session.title,
        history=[
            schemas.ChatMessageOut(
                id=m.id,
                session_id=m.session_id,
                role=m.role,
                content=m.content,
                created_at=m.created_at,
            )
            for m in history
        ],
    )
