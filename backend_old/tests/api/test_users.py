import pytest
from fastapi.testclient import TestClient
from typing import Dict

def test_get_users(client: TestClient, admin_token: Dict[str, str]):
    # Test getting all users as admin
    response = client.get("/api/v1/users/", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4  # We have 4 test users
    assert all("id" in user for user in data)
    assert all("email" in user for user in data)
    assert all("full_name" in user for user in data)
    assert all("role" in user for user in data)

def test_get_users_unauthorized(client: TestClient, supervisor_token: Dict[str, str]):
    # Test getting all users as non-admin (should fail)
    response = client.get("/api/v1/users/", headers=supervisor_token)
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authorization_error"

def test_get_current_user(client: TestClient, admin_token: Dict[str, str]):
    # Test getting current user info
    response = client.get("/api/v1/users/me", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.com"
    assert data["role"] == "admin"

def test_update_current_user(client: TestClient, admin_token: Dict[str, str]):
    # Test updating current user info
    update_data = {
        "full_name": "Updated Admin Name"
    }
    response = client.put("/api/v1/users/me", json=update_data, headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Admin Name"
    assert data["email"] == "admin@test.com"  # Email should not change

def test_create_user(client: TestClient, admin_token: Dict[str, str]):
    # Test creating a new user as admin
    user_data = {
        "email": "newuser@test.com",
        "password": "newuser123",
        "full_name": "New Test User",
        "role": "seller"
    }
    response = client.post("/api/v1/users/", json=user_data, headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["full_name"] == "New Test User"
    assert data["role"] == "seller"
    assert "id" in data
    
    # Verify we can get the new user
    user_id = data["id"]
    response = client.get(f"/api/v1/users/{user_id}", headers=admin_token)
    assert response.status_code == 200
    assert response.json()["id"] == user_id

def test_create_user_duplicate_email(client: TestClient, admin_token: Dict[str, str]):
    # Test creating a user with an existing email
    user_data = {
        "email": "admin@test.com",  # This email already exists
        "password": "password123",
        "full_name": "Duplicate Email User",
        "role": "seller"
    }
    response = client.post("/api/v1/users/", json=user_data, headers=admin_token)
    assert response.status_code == 409  # Conflict
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "conflict"

def test_create_user_unauthorized(client: TestClient, supervisor_token: Dict[str, str]):
    # Test creating a user as non-admin (should fail)
    user_data = {
        "email": "unauthorized@test.com",
        "password": "password123",
        "full_name": "Unauthorized User",
        "role": "seller"
    }
    response = client.post("/api/v1/users/", json=user_data, headers=supervisor_token)
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "authorization_error"

def test_get_user_by_id(client: TestClient, admin_token: Dict[str, str]):
    # Test getting a user by ID
    response = client.get("/api/v1/users/2", headers=admin_token)  # Supervisor ID is 2
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 2
    assert data["email"] == "supervisor@test.com"
    assert data["role"] == "supervisor"

def test_get_user_by_id_not_found(client: TestClient, admin_token: Dict[str, str]):
    # Test getting a nonexistent user
    response = client.get("/api/v1/users/999", headers=admin_token)  # This ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "not_found"

def test_update_user(client: TestClient, admin_token: Dict[str, str]):
    # Test updating a user as admin
    update_data = {
        "full_name": "Updated Supervisor Name",
        "role": "supervisor"  # Keep the same role
    }
    response = client.put("/api/v1/users/2", json=update_data, headers=admin_token)  # Supervisor ID is 2
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 2
    assert data["full_name"] == "Updated Supervisor Name"
    assert data["role"] == "supervisor"
    assert data["email"] == "supervisor@test.com"  # Email should not change

def test_update_user_not_found(client: TestClient, admin_token: Dict[str, str]):
    # Test updating a nonexistent user
    update_data = {
        "full_name": "Nonexistent User"
    }
    response = client.put("/api/v1/users/999", json=update_data, headers=admin_token)  # This ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "not_found"

def test_delete_user(client: TestClient, admin_token: Dict[str, str]):
    # First, create a user to delete
    user_data = {
        "email": "todelete@test.com",
        "password": "todelete123",
        "full_name": "User To Delete",
        "role": "seller"
    }
    create_response = client.post("/api/v1/users/", json=user_data, headers=admin_token)
    user_id = create_response.json()["id"]
    
    # Test deleting the user
    response = client.delete(f"/api/v1/users/{user_id}", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == "todelete@test.com"
    
    # Verify the user was deleted
    get_response = client.get(f"/api/v1/users/{user_id}", headers=admin_token)
    assert get_response.status_code == 404

def test_delete_user_not_found(client: TestClient, admin_token: Dict[str, str]):
    # Test deleting a nonexistent user
    response = client.delete("/api/v1/users/999", headers=admin_token)  # This ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "not_found"

def test_delete_self(client: TestClient, admin_token: Dict[str, str]):
    # Test deleting your own user (should fail)
    response = client.delete("/api/v1/users/1", headers=admin_token)  # Admin ID is 1
    assert response.status_code == 409  # Conflict
    data = response.json()
    assert "detail" in data
    assert "error_code" in data
    assert data["error_code"] == "conflict"
