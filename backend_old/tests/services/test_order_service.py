import pytest
from sqlalchemy.orm import Session
from app.services.order import order_service
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderCreate, OrderUpdate, BillingHistoryCreate

def test_get_orders(db: Session):
    # Get all orders
    orders = order_service.get_orders(db)
    assert len(orders) == 4  # We have 4 test orders

def test_get_order(db: Session):
    # Get order by ID
    order = order_service.get_order(db, order_id=1)
    assert order is not None
    assert order.order_number == "TEST-001"
    assert order.status == OrderStatus.PAID

def test_get_order_by_number(db: Session):
    # Get order by order number
    order = order_service.get_order_by_number(db, order_number="TEST-001")
    assert order is not None
    assert order.id == 1
    assert order.status == OrderStatus.PAID

def test_get_orders_by_status(db: Session):
    # Get orders by status
    orders = order_service.get_orders_by_status(db, status=OrderStatus.PENDING)
    assert len(orders) == 2  # We have 2 pending orders
    assert all(order.status == OrderStatus.PENDING for order in orders)

def test_get_orders_by_collector(db: Session):
    # Get orders by collector
    orders = order_service.get_orders_by_collector(db, collector_id=3)  # Collector ID is 3
    assert len(orders) == 4  # All orders are assigned to the collector
    assert all(order.collector_id == 3 for order in orders)

def test_get_orders_by_seller(db: Session):
    # Get orders by seller
    orders = order_service.get_orders_by_seller(db, seller_id=4)  # Seller ID is 4
    assert len(orders) == 4  # All orders are created by the seller
    assert all(order.seller_id == 4 for order in orders)

def test_create_order(db: Session):
    # Create a new order
    order_in = OrderCreate(
        order_number="TEST-005",
        customer_name="Test Customer 5",
        customer_phone="5555555555",
        customer_address="Test Address 5, 555, Test Neighborhood, Test City, TS, 12345-678",
        total_amount=500.0,
        tracking_code="TEST555555555",
        seller_id=4  # Seller ID is 4
    )
    order = order_service.create_order(db, order=order_in, collector_id=3)  # Collector ID is 3
    assert order is not None
    assert order.order_number == "TEST-005"
    assert order.customer_name == "Test Customer 5"
    assert order.total_amount == 500.0
    assert order.paid_amount == 0.0
    assert order.status == OrderStatus.PENDING
    assert order.tracking_code == "TEST555555555"
    assert order.seller_id == 4
    assert order.collector_id == 3
    assert order.is_duplicate is False
    
    # Verify the order was added to the database
    db_order = order_service.get_order_by_number(db, order_number="TEST-005")
    assert db_order is not None
    assert db_order.id == order.id

def test_update_order(db: Session):
    # Update an order
    order_update = OrderUpdate(
        customer_name="Updated Customer",
        total_amount=150.0,
        status=OrderStatus.IN_PROGRESS
    )
    updated_order = order_service.update_order(db, order_id=1, order_update=order_update)
    assert updated_order is not None
    assert updated_order.customer_name == "Updated Customer"
    assert updated_order.total_amount == 150.0
    assert updated_order.status == OrderStatus.IN_PROGRESS
    assert updated_order.order_number == "TEST-001"  # Order number should not change

def test_add_billing_history(db: Session):
    # Add billing history to an order
    billing_in = BillingHistoryCreate(
        order_id=2,  # Order ID is 2 (partially paid)
        amount=50.0,
        notes="Test payment"
    )
    billing = order_service.add_billing_history(db, billing=billing_in, created_by=1)  # Admin ID is 1
    assert billing is not None
    assert billing.order_id == 2
    assert billing.amount == 50.0
    assert billing.notes == "Test payment"
    assert billing.created_by == 1
    
    # Verify the order's paid amount was updated
    order = order_service.get_order(db, order_id=2)
    assert order.paid_amount == 150.0  # 100.0 + 50.0
    assert order.status == OrderStatus.PARTIALLY_PAID  # Still partially paid

def test_add_billing_history_full_payment(db: Session):
    # Add billing history to complete payment
    billing_in = BillingHistoryCreate(
        order_id=2,  # Order ID is 2 (partially paid)
        amount=100.0,  # This will make it fully paid
        notes="Final payment"
    )
    billing = order_service.add_billing_history(db, billing=billing_in, created_by=1)  # Admin ID is 1
    
    # Verify the order's status was updated to PAID
    order = order_service.get_order(db, order_id=2)
    assert order.paid_amount == 200.0  # 100.0 + 100.0
    assert order.status == OrderStatus.PAID  # Now fully paid

def test_get_duplicate_orders(db: Session):
    # Get duplicate orders
    duplicates = order_service.get_duplicate_orders(db)
    assert len(duplicates) == 1  # We have 1 duplicate order
    assert duplicates[0].order_number == "TEST-004"
    assert duplicates[0].is_duplicate is True

def test_search_orders(db: Session):
    # Search orders by customer name
    results = order_service.search_orders(db, query="Customer 2")
    assert len(results) == 2  # We have 2 orders with Customer 2
    assert all("Customer 2" in order.customer_name for order in results)
    
    # Search orders by order number
    results = order_service.search_orders(db, query="TEST-001")
    assert len(results) == 1
    assert results[0].order_number == "TEST-001"
    
    # Search orders by phone
    results = order_service.search_orders(db, query="1234567890")
    assert len(results) == 1
    assert results[0].customer_phone == "1234567890"
    
    # Search orders by tracking code
    results = order_service.search_orders(db, query="TEST123456789")
    assert len(results) == 1
    assert results[0].tracking_code == "TEST123456789"

def test_get_orders_statistics(db: Session):
    # Get order statistics
    stats = order_service.get_orders_statistics(db)
    assert stats["total_orders"] == 4
    assert stats["total_amount"] == 800.0  # 100 + 200 + 300 + 200
    assert stats["total_paid"] == 200.0  # 100 + 100 + 0 + 0
    assert stats["payment_rate"] == 0.25  # 200 / 800
    assert stats["status_counts"][OrderStatus.PAID.value] == 1
    assert stats["status_counts"][OrderStatus.PARTIALLY_PAID.value] == 1
    assert stats["status_counts"][OrderStatus.PENDING.value] == 2
