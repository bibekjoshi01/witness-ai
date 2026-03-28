from fastapi import APIRouter

from . import health, auth, profile

router = APIRouter()

router.include_router(health.router)
router.include_router(auth.router)
router.include_router(profile.router)
# router.include_router(reflections.router)
# router.include_router(insights.router)
# router.include_router(micro_actions.router)
# router.include_router(ai.router)
# router.include_router(tasks.router)

__all__ = ["router"]
