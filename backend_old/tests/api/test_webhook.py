import pytest
from fastapi.testclient import TestClient
from app.core.test_config import test_settings

def test_webhook_success(client: TestClient):
    # Test successful webhook call
    webhook_data = {
        "order_number": "WEBHOOK-001",
        "customer_name": "Webhook Customer",
        "customer_phone": "1231231234",
        "customer_address": "Webhook Address, 123, Test, Test, TS, 12345-678",
        "total_amount": 123.45,
        "seller_id": 4  # Seller ID is 4
    }
    headers = {
        "X-Webhook-Secret": test_settings.WEBHOOK_SECRET
    }
    response = client.post("/api/v1/webhook/order", json=webhook_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["order_number"] == "WEBHOOK-001"
    assert data["customer_name"] == "Webhook Customer"
    assert data["total_amount"] == 123.45
    assert data["seller_id"] == 4
    assert "id" in data
    assert "collector_id" in data  # Should be assigned to a collector

def test_webhook_invalid_secret(client: TestClient):
    # Test webhook call with invalid secret
    webhook_data = {
        "order_number": "WEBHOOK-002",
        "customer_name": "Invalid Secret",
        "customer_phone": "1231231234",
        "customer_address": "Invalid Address, 123, Test, Test, TS, 12345-678",
        "total_amount": 123.45,
        "seller_id": 4  # Seller ID is 4
    }
    headers = {
        "X-Webhook-Secret": "invalid-secret"
    }
    response = client.post("/api/v1/webhook/order", json=webhook_data, headers=headers)
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authorization_error"

def test_webhook_missing_secret(client: TestClient):
    # Test webhook call with missing secret
    webhook_data = {
        "order_number": "WEBHOOK-003",
        "customer_name": "Missing Secret",
        "customer_phone": "1231231234",
        "customer_address": "Missing Address, 123, Test, Test, TS, 12345-678",
        "total_amount": 123.45,
        "seller_id": 4  # Seller ID is 4
    }
    response = client.post("/api/v1/webhook/order", json=webhook_data)
    assert response.status_code == 422  # Unprocessable Entity (missing header)

def test_webhook_invalid_data(client: TestClient):
    # Test webhook call with invalid data
    webhook_data = {
        # Missing required fields
        "customer_name": "Invalid Data",
        "customer_phone": "1231231234"
    }
    headers = {
        "X-Webhook-Secret": test_settings.WEBHOOK_SECRET
    }
    response = client.post("/api/v1/webhook/order", json=webhook_data, headers=headers)
    assert response.status_code == 422  # Unprocessable Entity (validation error)
    data = response.json()
    assert "detail" in data

def test_webhook_duplicate_order(client: TestClient):
    # First, create an order
    webhook_data = {
        "order_number": "WEBHOOK-DUP",
        "customer_name": "Duplicate Webhook",
        "customer_phone": "1231231234",
        "customer_address": "Duplicate Address, 123, Test, Test, TS, 12345-678",
        "total_amount": 123.45,
        "seller_id": 4  # Seller ID is 4
    }
    headers = {
        "X-Webhook-Secret": test_settings.WEBHOOK_SECRET
    }
    client.post("/api/v1/webhook/order", json=webhook_data, headers=headers)
    
    # Test creating a duplicate order
    response = client.post("/api/v1/webhook/order", json=webhook_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["order_number"] == "WEBHOOK-DUP"
    assert data["is_duplicate"] is True

def test_webhook_test_endpoint(client: TestClient):
    # Test the webhook test endpoint
    response = client.get("/api/v1/webhook/test")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Webhook endpoint is working"
