from fastapi import APIRouter

from . import health, auth, profile, journal, ai, chat

router = APIRouter()

router.include_router(health.router)
router.include_router(auth.router)
router.include_router(profile.router)
router.include_router(journal.router)
router.include_router(ai.router)
router.include_router(chat.router)

__all__ = ["router"]
