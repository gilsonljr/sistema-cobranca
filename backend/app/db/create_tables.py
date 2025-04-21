from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.base import Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Import all models to ensure they are registered with Base
from app.models.order import Order, BillingHistory
from app.models.setting import Setting
from app.models.tracking_history import TrackingHistory
from app.models.nutra_product import (
    NutraProduct, Kit, KitProduct, Distributor,
    DistributorOrder, DistributorOrderItem, StockHistory,
    KitSale, ProductType, OrderStatus, StockChangeReason
)

def create_tables():
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    Base.metadata.create_all(bind=engine)

    # Create a session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.email == "admin@sistema.com").first()
        if not admin:
            print("Creating admin user")
            admin = User(
                email="admin@sistema.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"Admin user created with id: {admin.id}")
        else:
            print("Admin user already exists")

        # Create supervisor user
        supervisor = db.query(User).filter(User.email == "supervisor@sistema.com").first()
        if not supervisor:
            print("Creating supervisor user")
            supervisor = User(
                email="supervisor@sistema.com",
                hashed_password=get_password_hash("supervisor123"),
                full_name="Supervisor",
                role=UserRole.SUPERVISOR,
                is_active=True
            )
            db.add(supervisor)
            db.commit()
            print(f"Supervisor user created with id: {supervisor.id}")
        else:
            print("Supervisor user already exists")

        # Create collector user
        collector = db.query(User).filter(User.email == "operador@sistema.com").first()
        if not collector:
            print("Creating collector user")
            collector = User(
                email="operador@sistema.com",
                hashed_password=get_password_hash("operador123"),
                full_name="Operador",
                role=UserRole.COLLECTOR,
                is_active=True
            )
            db.add(collector)
            db.commit()
            print(f"Collector user created with id: {collector.id}")
        else:
            print("Collector user already exists")

        # Create seller user
        seller = db.query(User).filter(User.email == "vendedor@sistema.com").first()
        if not seller:
            print("Creating seller user")
            seller = User(
                email="vendedor@sistema.com",
                hashed_password=get_password_hash("vendedor123"),
                full_name="Vendedor",
                role=UserRole.SELLER,
                is_active=True
            )
            db.add(seller)
            db.commit()
            print(f"Seller user created with id: {seller.id}")
        else:
            print("Seller user already exists")

    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
