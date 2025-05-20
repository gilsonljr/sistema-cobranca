from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.config import settings
from app.db.session import get_db
from app.schemas.order import OrderCreate
from app.services.order import order_service
from app.services.user import user_service
from app.core.errors import AuthorizationError, ServerError

router = APIRouter()

@router.post("/orders")
async def receive_order(
    order: OrderCreate,
    x_webhook_secret: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Verify webhook secret
    if x_webhook_secret != settings.WEBHOOK_SECRET:
        raise AuthorizationError(detail="Invalid webhook secret")

    # Get the least busy collector
    collector = user_service.get_least_busy_collector(db)
    if not collector:
        raise ServerError(detail="No available collectors")

    # Create the order
    db_order = order_service.create_order(db, order, collector.id)

    return {"message": "Order received successfully", "order_id": db_order.id}