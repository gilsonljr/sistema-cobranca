from fastapi import APIRouter, Depends, Query, Path, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.api.deps import get_current_active_user, get_current_supervisor
from app.db.session import get_db
from app.models.user import UserRole
from app.models.order import OrderStatus
from app.schemas.order import Order, OrderUpdate, BillingHistoryCreate
from app.services.order import order_service
from app.core.errors import NotFoundError, AuthorizationError

router = APIRouter()

@router.get("/", response_model=List[Order], summary="Get all orders", description="Get a list of orders. Results are filtered based on user role.")
def get_orders(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    status: OrderStatus = Query(None, description="Filter orders by status")
):
    """Get a list of orders.

    Results are filtered based on user role:
    - Admin and Supervisor: All orders
    - Collector: Only orders assigned to the collector
    - Seller: Only orders created by the seller

    - **status**: Optional filter by order status
    """
    if current_user.role == UserRole.COLLECTOR:
        return order_service.get_orders_by_collector(db, current_user.id)
    elif current_user.role == UserRole.SELLER:
        return order_service.get_orders_by_seller(db, current_user.id)
    elif status:
        return order_service.get_orders_by_status(db, status)
    return order_service.get_orders(db)

@router.get("/{order_id}", response_model=Order, summary="Get order by ID", description="Get a specific order by its ID")
def get_order(
    order_id: int = Path(..., description="The ID of the order to retrieve", gt=0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific order by its ID.

    Access is restricted based on user role:
    - Admin and Supervisor: Can access any order
    - Collector: Can only access orders assigned to them
    - Seller: Can only access orders they created

    - **order_id**: The ID of the order to retrieve
    """
    order = order_service.get_order(db, order_id)
    if not order:
        raise NotFoundError(detail="Order not found")

    if current_user.role == UserRole.COLLECTOR and order.collector_id != current_user.id:
        raise AuthorizationError()
    elif current_user.role == UserRole.SELLER and order.seller_id != current_user.id:
        raise AuthorizationError()

    return order

@router.put("/{order_id}", response_model=Order, summary="Update order", description="Update an existing order")
def update_order(
    order_id: int = Path(..., description="The ID of the order to update", gt=0),
    order_update: OrderUpdate = Body(..., description="Updated order data"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update an existing order.

    Access is restricted based on user role:
    - Admin and Supervisor: Can update any order
    - Collector: Can only update orders assigned to them
    - Seller: Cannot update orders

    - **order_id**: The ID of the order to update
    - **order_update**: Updated order data
    """
    order = order_service.get_order(db, order_id)
    if not order:
        raise NotFoundError(detail="Order not found")

    if current_user.role == UserRole.COLLECTOR and order.collector_id != current_user.id:
        raise AuthorizationError()

    return order_service.update_order(db, order_id, order_update)

@router.post("/{order_id}/billing", response_model=Order, summary="Add billing history", description="Add a billing history entry to an order")
def add_billing_history(
    order_id: int = Path(..., description="The ID of the order", gt=0),
    billing: BillingHistoryCreate = Body(..., description="Billing history data"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Add a billing history entry to an order.

    Access is restricted based on user role:
    - Admin and Supervisor: Can add billing history to any order
    - Collector: Can only add billing history to orders assigned to them
    - Seller: Cannot add billing history

    - **order_id**: The ID of the order
    - **billing**: Billing history data including amount and optional notes
    """
    order = order_service.get_order(db, order_id)
    if not order:
        raise NotFoundError(detail="Order not found")

    if current_user.role == UserRole.COLLECTOR and order.collector_id != current_user.id:
        raise AuthorizationError()

    billing.order_id = order_id
    order_service.add_billing_history(db, billing, current_user.id)
    return order_service.get_order(db, order_id)

@router.get("/duplicates", response_model=List[Order], summary="Get duplicate orders", description="Get a list of orders marked as duplicates")
def get_duplicate_orders(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_supervisor)
):
    """Get a list of orders marked as duplicates.

    Only admin and supervisor users can access this endpoint.
    """
    return order_service.get_duplicate_orders(db)

@router.get("/search", response_model=List[Order], summary="Search orders", description="Search orders by various criteria (order number, customer name, phone, tracking code)")
def search_orders(
    query: str = Query(..., description="Search query", min_length=2),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Search orders by various criteria.

    Searches in order number, customer name, phone, and tracking code.
    Results are filtered based on user role.

    - **query**: Search query (minimum 2 characters)
    """
    # Apply role-based filtering to search results
    results = order_service.search_orders(db, query)

    if current_user.role == UserRole.COLLECTOR:
        return [order for order in results if order.collector_id == current_user.id]
    elif current_user.role == UserRole.SELLER:
        return [order for order in results if order.seller_id == current_user.id]

    return results

@router.get("/statistics", response_model=Dict[str, Any], summary="Get order statistics", description="Get statistics about orders, including totals and counts by status")
def get_order_statistics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_supervisor),
    start_date: Optional[datetime] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date (ISO format)")
):
    """Get statistics about orders.

    Returns total orders, total amount, total paid, payment rate, and counts by status.
    Only admin and supervisor users can access this endpoint.

    - **start_date**: Optional filter by start date (ISO format)
    - **end_date**: Optional filter by end date (ISO format)
    """
    return order_service.get_orders_statistics(db)

@router.post("/detect-duplicates", response_model=List[Order], summary="Detect duplicate orders", description="Run the duplicate detection algorithm on all orders")
def detect_duplicate_orders(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_supervisor)
):
    """Run duplicate detection algorithm on orders.

    This endpoint analyzes all orders to find potential duplicates based on customer information and order amounts.
    Only admin and supervisor users can access this endpoint.
    """
    return order_service.detect_duplicate_orders(db)