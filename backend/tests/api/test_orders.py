import pytest
from fastapi.testclient import TestClient
from typing import Dict

def test_get_orders(client: TestClient, admin_token: Dict[str, str]):
    # Test getting all orders as admin
    response = client.get("/api/v1/orders/", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4  # We have 4 test orders
    assert all("id" in order for order in data)
    assert all("order_number" in order for order in data)
    assert all("customer_name" in order for order in data)
    assert all("total_amount" in order for order in data)

def test_get_orders_as_collector(client: TestClient, collector_token: Dict[str, str]):
    # Test getting orders as collector (should only see assigned orders)
    response = client.get("/api/v1/orders/", headers=collector_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4  # All test orders are assigned to the collector
    assert all(order["collector_id"] == 3 for order in data)  # Collector ID is 3

def test_get_orders_as_seller(client: TestClient, seller_token: Dict[str, str]):
    # Test getting orders as seller (should only see own orders)
    response = client.get("/api/v1/orders/", headers=seller_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4  # All test orders are created by the seller
    assert all(order["seller_id"] == 4 for order in data)  # Seller ID is 4

def test_get_order_by_id(client: TestClient, admin_token: Dict[str, str]):
    # Test getting an order by ID
    response = client.get("/api/v1/orders/1", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["order_number"] == "TEST-001"
    assert data["status"] == "paid"

def test_get_order_by_id_not_found(client: TestClient, admin_token: Dict[str, str]):
    # Test getting a nonexistent order
    response = client.get("/api/v1/orders/999", headers=admin_token)  # This ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "not_found"

def test_get_order_by_id_unauthorized(client: TestClient, collector_token: Dict[str, str]):
    # Create a new order not assigned to the collector
    order_data = {
        "order_number": "TEST-UNAUTH",
        "customer_name": "Unauthorized Test",
        "customer_phone": "9999999999",
        "customer_address": "Test Address, 999, Test, Test, TS, 12345-678",
        "total_amount": 999.0,
        "seller_id": 4  # Seller ID is 4
    }
    create_response = client.post("/api/v1/orders/", json=order_data, headers=admin_token)
    order_id = create_response.json()["id"]
    
    # Update the order to assign to a different collector (which doesn't exist in our test data)
    update_data = {
        "collector_id": 999  # This collector doesn't exist
    }
    client.put(f"/api/v1/orders/{order_id}", json=update_data, headers=admin_token)
    
    # Test getting the order as collector (should fail)
    response = client.get(f"/api/v1/orders/{order_id}", headers=collector_token)
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authorization_error"

def test_create_order(client: TestClient, admin_token: Dict[str, str]):
    # Test creating a new order
    order_data = {
        "order_number": "TEST-NEW",
        "customer_name": "New Test Customer",
        "customer_phone": "1231231234",
        "customer_address": "New Test Address, 123, Test, Test, TS, 12345-678",
        "total_amount": 123.45,
        "tracking_code": "TEST-TRACKING",
        "seller_id": 4  # Seller ID is 4
    }
    response = client.post("/api/v1/orders/", json=order_data, headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert data["order_number"] == "TEST-NEW"
    assert data["customer_name"] == "New Test Customer"
    assert data["total_amount"] == 123.45
    assert data["tracking_code"] == "TEST-TRACKING"
    assert data["seller_id"] == 4
    assert "id" in data
    
    # Verify we can get the new order
    order_id = data["id"]
    response = client.get(f"/api/v1/orders/{order_id}", headers=admin_token)
    assert response.status_code == 200
    assert response.json()["id"] == order_id

def test_create_order_duplicate(client: TestClient, admin_token: Dict[str, str]):
    # Test creating an order with an existing order number
    order_data = {
        "order_number": "TEST-001",  # This order number already exists
        "customer_name": "Duplicate Order",
        "customer_phone": "1231231234",
        "customer_address": "Duplicate Address, 123, Test, Test, TS, 12345-678",
        "total_amount": 123.45,
        "seller_id": 4  # Seller ID is 4
    }
    response = client.post("/api/v1/orders/", json=order_data, headers=admin_token)
    assert response.status_code == 200  # Should still succeed but mark as duplicate
    data = response.json()
    assert data["order_number"] == "TEST-001"
    assert data["is_duplicate"] is True

def test_update_order(client: TestClient, admin_token: Dict[str, str]):
    # Test updating an order
    update_data = {
        "customer_name": "Updated Customer",
        "total_amount": 150.0,
        "status": "in_progress"
    }
    response = client.put("/api/v1/orders/1", json=update_data, headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["customer_name"] == "Updated Customer"
    assert data["total_amount"] == 150.0
    assert data["status"] == "in_progress"
    assert data["order_number"] == "TEST-001"  # Order number should not change

def test_update_order_not_found(client: TestClient, admin_token: Dict[str, str]):
    # Test updating a nonexistent order
    update_data = {
        "customer_name": "Nonexistent Order"
    }
    response = client.put("/api/v1/orders/999", json=update_data, headers=admin_token)  # This ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "not_found"

def test_add_billing_history(client: TestClient, admin_token: Dict[str, str]):
    # Test adding billing history to an order
    billing_data = {
        "amount": 50.0,
        "notes": "Test payment"
    }
    response = client.post("/api/v1/orders/2/billing", json=billing_data, headers=admin_token)  # Order ID is 2
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 2
    assert data["paid_amount"] == 150.0  # 100.0 + 50.0
    assert data["status"] == "partially_paid"  # Still partially paid
    assert len(data["billing_history"]) > 0

def test_add_billing_history_full_payment(client: TestClient, admin_token: Dict[str, str]):
    # Test adding billing history to complete payment
    billing_data = {
        "amount": 100.0,  # This will make it fully paid
        "notes": "Final payment"
    }
    response = client.post("/api/v1/orders/2/billing", json=billing_data, headers=admin_token)  # Order ID is 2
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 2
    assert data["paid_amount"] == 200.0  # 100.0 + 100.0
    assert data["status"] == "paid"  # Now fully paid

def test_add_billing_history_order_not_found(client: TestClient, admin_token: Dict[str, str]):
    # Test adding billing history to a nonexistent order
    billing_data = {
        "amount": 50.0,
        "notes": "Test payment"
    }
    response = client.post("/api/v1/orders/999/billing", json=billing_data, headers=admin_token)  # This ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "not_found"

def test_get_duplicate_orders(client: TestClient, admin_token: Dict[str, str]):
    # Test getting duplicate orders
    response = client.get("/api/v1/orders/duplicates", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1  # We have 1 duplicate order
    assert data[0]["order_number"] == "TEST-004"
    assert data[0]["is_duplicate"] is True

def test_get_duplicate_orders_unauthorized(client: TestClient, collector_token: Dict[str, str]):
    # Test getting duplicate orders as collector (should fail)
    response = client.get("/api/v1/orders/duplicates", headers=collector_token)
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authorization_error"

def test_search_orders(client: TestClient, admin_token: Dict[str, str]):
    # Test searching orders
    response = client.get("/api/v1/orders/search?query=Customer+2", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2  # We have 2 orders with Customer 2
    assert all("Customer 2" in order["customer_name"] for order in data)

def test_search_orders_as_collector(client: TestClient, collector_token: Dict[str, str]):
    # Test searching orders as collector (should only see assigned orders)
    response = client.get("/api/v1/orders/search?query=Customer", headers=collector_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(order["collector_id"] == 3 for order in data)  # Collector ID is 3

def test_get_order_statistics(client: TestClient, admin_token: Dict[str, str]):
    # Test getting order statistics
    response = client.get("/api/v1/orders/statistics", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert "total_orders" in data
    assert "total_amount" in data
    assert "total_paid" in data
    assert "payment_rate" in data
    assert "status_counts" in data
    assert data["total_orders"] == 4
    assert data["total_amount"] == 800.0  # 100 + 200 + 300 + 200
    assert data["total_paid"] == 200.0  # 100 + 100 + 0 + 0
    assert data["payment_rate"] == 0.25  # 200 / 800

def test_get_order_statistics_unauthorized(client: TestClient, collector_token: Dict[str, str]):
    # Test getting order statistics as collector (should fail)
    response = client.get("/api/v1/orders/statistics", headers=collector_token)
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authorization_error"

def test_detect_duplicate_orders(client: TestClient, admin_token: Dict[str, str]):
    # Test detecting duplicate orders
    response = client.post("/api/v1/orders/detect-duplicates", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # The test data has duplicates with the same phone number
    assert len(data) > 0
