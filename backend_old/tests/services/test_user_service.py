import pytest
from sqlalchemy.orm import Session
from app.services.user import user_service
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate

def test_get_user(db: Session):
    # Get the admin user (ID 1)
    user = user_service.get_user(db, user_id=1)
    assert user is not None
    assert user.email == "admin@test.com"
    assert user.role == UserRole.ADMIN

def test_get_user_by_email(db: Session):
    # Get the admin user by email
    user = user_service.get_user_by_email(db, email="admin@test.com")
    assert user is not None
    assert user.id == 1
    assert user.role == UserRole.ADMIN

def test_get_users(db: Session):
    # Get all users
    users = user_service.get_users(db)
    assert len(users) == 4  # We have 4 test users

def test_create_user(db: Session):
    # Create a new user
    user_in = UserCreate(
        email="newuser@test.com",
        password="newuser123",
        full_name="New User",
        role=UserRole.SELLER
    )
    user = user_service.create_user(db, user=user_in)
    assert user is not None
    assert user.email == "newuser@test.com"
    assert user.full_name == "New User"
    assert user.role == UserRole.SELLER
    assert user.is_active is True
    
    # Verify the user was added to the database
    db_user = user_service.get_user_by_email(db, email="newuser@test.com")
    assert db_user is not None
    assert db_user.id == user.id

def test_update_user(db: Session):
    # Update the supervisor user
    user_update = UserUpdate(full_name="Updated Supervisor")
    updated_user = user_service.update_user(db, user_id=2, user_update=user_update)
    assert updated_user is not None
    assert updated_user.full_name == "Updated Supervisor"
    assert updated_user.email == "supervisor@test.com"  # Email should not change

def test_authenticate_user_success(db: Session):
    # Authenticate with correct credentials
    user = user_service.authenticate(db, email="admin@test.com", password="admin123")
    assert user is not None
    assert user.email == "admin@test.com"

def test_authenticate_user_wrong_password(db: Session):
    # Authenticate with wrong password
    user = user_service.authenticate(db, email="admin@test.com", password="wrongpassword")
    assert user is None

def test_authenticate_user_nonexistent(db: Session):
    # Authenticate with nonexistent user
    user = user_service.authenticate(db, email="nonexistent@test.com", password="password")
    assert user is None

def test_get_collectors(db: Session):
    # Get all collectors
    collectors = user_service.get_collectors(db)
    assert len(collectors) == 1
    assert collectors[0].email == "collector@test.com"
    assert collectors[0].role == UserRole.COLLECTOR

def test_get_sellers(db: Session):
    # Get all sellers
    sellers = user_service.get_sellers(db)
    assert len(sellers) == 1
    assert sellers[0].email == "seller@test.com"
    assert sellers[0].role == UserRole.SELLER

def test_delete_user(db: Session):
    # Create a user to delete
    user_in = UserCreate(
        email="todelete@test.com",
        password="todelete123",
        full_name="To Delete",
        role=UserRole.SELLER
    )
    user = user_service.create_user(db, user=user_in)
    user_id = user.id
    
    # Delete the user
    deleted_user = user_service.delete_user(db, user_id=user_id)
    assert deleted_user is not None
    assert deleted_user.id == user_id
    
    # Verify the user was deleted
    db_user = user_service.get_user(db, user_id=user_id)
    assert db_user is None
