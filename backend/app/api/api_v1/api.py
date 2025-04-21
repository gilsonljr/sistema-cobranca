from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, orders, webhook, users, tracking, settings, nutra

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["tracking"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(nutra.router, prefix="/nutra", tags=["nutra"])