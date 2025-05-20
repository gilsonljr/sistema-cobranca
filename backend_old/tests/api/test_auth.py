import pytest
from fastapi.testclient import TestClient

def test_login_success(client: TestClient):
    # Test successful login
    login_data = {
        "username": "admin@test.com",
        "password": "admin123",
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client: TestClient):
    # Test login with wrong password
    login_data = {
        "username": "admin@test.com",
        "password": "wrongpassword",
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authentication_error"

def test_login_nonexistent_user(client: TestClient):
    # Test login with nonexistent user
    login_data = {
        "username": "nonexistent@test.com",
        "password": "password",
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authentication_error"

def test_refresh_token(client: TestClient):
    # First, login to get a refresh token
    login_data = {
        "username": "admin@test.com",
        "password": "admin123",
    }
    login_response = client.post("/api/v1/auth/login", data=login_data)
    refresh_token = login_response.json()["refresh_token"]
    
    # Test refreshing the token
    refresh_data = {
        "refresh_token": refresh_token
    }
    response = client.post("/api/v1/auth/refresh", json=refresh_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_refresh_token_invalid(client: TestClient):
    # Test refreshing with invalid token
    refresh_data = {
        "refresh_token": "invalid-token"
    }
    response = client.post("/api/v1/auth/refresh", json=refresh_data)
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authentication_error"

def test_password_reset_request(client: TestClient):
    # Test requesting password reset
    reset_data = {
        "email": "admin@test.com"
    }
    response = client.post("/api/v1/auth/password-reset/request", json=reset_data)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "token" in data  # In a real app, this would be sent via email

def test_password_reset_confirm(client: TestClient):
    # First, request a reset token
    reset_request_data = {
        "email": "admin@test.com"
    }
    request_response = client.post("/api/v1/auth/password-reset/request", json=reset_request_data)
    reset_token = request_response.json()["token"]
    
    # Test confirming password reset
    reset_confirm_data = {
        "token": reset_token,
        "new_password": "newpassword123"
    }
    response = client.post("/api/v1/auth/password-reset/confirm", json=reset_confirm_data)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    
    # Verify we can login with the new password
    login_data = {
        "username": "admin@test.com",
        "password": "newpassword123",
    }
    login_response = client.post("/api/v1/auth/login", data=login_data)
    assert login_response.status_code == 200

def test_password_reset_confirm_invalid_token(client: TestClient):
    # Test confirming with invalid token
    reset_confirm_data = {
        "token": "invalid-token",
        "new_password": "newpassword123"
    }
    response = client.post("/api/v1/auth/password-reset/confirm", json=reset_confirm_data)
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authentication_error"
