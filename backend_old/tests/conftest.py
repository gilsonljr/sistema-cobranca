import os
import sys
import pytest
from typing import Generator, Dict, Any
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.test_config import test_settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.models.order import Order, OrderStatus

# Create test database engine
SQLALCHEMY_DATABASE_URL = test_settings.SQLALCHEMY_DATABASE_URI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database and tables
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="function")
def db() -> Generator:
    """
    Create a fresh database for each test.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Create test data
    create_test_data(session)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db) -> Generator:
    """
    Create a test client with the test database.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def admin_token(client) -> Dict[str, str]:
    """
    Get an admin token for testing.
    """
    login_data = {
        "username": "admin@test.com",
        "password": "admin123",
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}

@pytest.fixture(scope="function")
def supervisor_token(client) -> Dict[str, str]:
    """
    Get a supervisor token for testing.
    """
    login_data = {
        "username": "supervisor@test.com",
        "password": "supervisor123",
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}

@pytest.fixture(scope="function")
def collector_token(client) -> Dict[str, str]:
    """
    Get a collector token for testing.
    """
    login_data = {
        "username": "collector@test.com",
        "password": "collector123",
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}

@pytest.fixture(scope="function")
def seller_token(client) -> Dict[str, str]:
    """
    Get a seller token for testing.
    """
    login_data = {
        "username": "seller@test.com",
        "password": "seller123",
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}

def create_test_data(db):
    """
    Create test data for the database.
    """
    # Create test users
    admin = User(
        email="admin@test.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Test Admin",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin)
    
    supervisor = User(
        email="supervisor@test.com",
        hashed_password=get_password_hash("supervisor123"),
        full_name="Test Supervisor",
        role=UserRole.SUPERVISOR,
        is_active=True
    )
    db.add(supervisor)
    
    collector = User(
        email="collector@test.com",
        hashed_password=get_password_hash("collector123"),
        full_name="Test Collector",
        role=UserRole.COLLECTOR,
        is_active=True
    )
    db.add(collector)
    
    seller = User(
        email="seller@test.com",
        hashed_password=get_password_hash("seller123"),
        full_name="Test Seller",
        role=UserRole.SELLER,
        is_active=True
    )
    db.add(seller)
    
    # Create test orders
    order1 = Order(
        order_number="TEST-001",
        customer_name="Test Customer 1",
        customer_phone="1234567890",
        customer_address="Test Address 1, 123, Test Neighborhood, Test City, TS, 12345-678",
        total_amount=100.0,
        paid_amount=100.0,
        status=OrderStatus.PAID,
        tracking_code="TEST123456789",
        seller_id=seller.id,
        collector_id=collector.id,
        is_duplicate=False
    )
    db.add(order1)
    
    order2 = Order(
        order_number="TEST-002",
        customer_name="Test Customer 2",
        customer_phone="0987654321",
        customer_address="Test Address 2, 456, Test Neighborhood, Test City, TS, 12345-678",
        total_amount=200.0,
        paid_amount=100.0,
        status=OrderStatus.PARTIALLY_PAID,
        tracking_code="TEST987654321",
        seller_id=seller.id,
        collector_id=collector.id,
        is_duplicate=False
    )
    db.add(order2)
    
    order3 = Order(
        order_number="TEST-003",
        customer_name="Test Customer 3",
        customer_phone="1122334455",
        customer_address="Test Address 3, 789, Test Neighborhood, Test City, TS, 12345-678",
        total_amount=300.0,
        paid_amount=0.0,
        status=OrderStatus.PENDING,
        tracking_code=None,
        seller_id=seller.id,
        collector_id=collector.id,
        is_duplicate=False
    )
    db.add(order3)
    
    # Create duplicate order
    order4 = Order(
        order_number="TEST-004",
        customer_name="Test Customer 2",
        customer_phone="0987654321",
        customer_address="Test Address 2, 456, Test Neighborhood, Test City, TS, 12345-678",
        total_amount=200.0,
        paid_amount=0.0,
        status=OrderStatus.PENDING,
        tracking_code=None,
        seller_id=seller.id,
        collector_id=collector.id,
        is_duplicate=True
    )
    db.add(order4)
    
    db.commit()
