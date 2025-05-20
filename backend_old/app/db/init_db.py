import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.models.order import Order, OrderStatus, BillingHistory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # Create admin user if it doesn't exist
    admin = db.query(User).filter(User.email == "admin@sistema.com").first()
    if not admin:
        logger.info("Creating admin user")
        admin = User(
            email="admin@sistema.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        logger.info(f"Admin user created with id: {admin.id}")
    else:
        logger.info("Admin user already exists")
    
    # Create supervisor user if it doesn't exist
    supervisor = db.query(User).filter(User.email == "supervisor@sistema.com").first()
    if not supervisor:
        logger.info("Creating supervisor user")
        supervisor = User(
            email="supervisor@sistema.com",
            hashed_password=get_password_hash("supervisor123"),
            full_name="Supervisor",
            role=UserRole.SUPERVISOR,
            is_active=True
        )
        db.add(supervisor)
        db.commit()
        db.refresh(supervisor)
        logger.info(f"Supervisor user created with id: {supervisor.id}")
    else:
        logger.info("Supervisor user already exists")
    
    # Create collector user if it doesn't exist
    collector = db.query(User).filter(User.email == "operador@sistema.com").first()
    if not collector:
        logger.info("Creating operator user")
        collector = User(
            email="operador@sistema.com",
            hashed_password=get_password_hash("operador123"),
            full_name="Operador",
            role=UserRole.COLLECTOR,
            is_active=True
        )
        db.add(collector)
        db.commit()
        db.refresh(collector)
        logger.info(f"Operator user created with id: {collector.id}")
    else:
        logger.info("Operator user already exists")
    
    # Create seller user if it doesn't exist
    seller = db.query(User).filter(User.email == "vendedor@sistema.com").first()
    if not seller:
        logger.info("Creating seller user")
        seller = User(
            email="vendedor@sistema.com",
            hashed_password=get_password_hash("vendedor123"),
            full_name="Vendedor",
            role=UserRole.SELLER,
            is_active=True
        )
        db.add(seller)
        db.commit()
        db.refresh(seller)
        logger.info(f"Seller user created with id: {seller.id}")
    else:
        logger.info("Seller user already exists")
    
    # Create sample orders if there are none
    orders_count = db.query(Order).count()
    if orders_count == 0 and seller and collector:
        logger.info("Creating sample orders")
        
        # Sample order 1
        order1 = Order(
            order_number="ORD-001",
            customer_name="João Silva",
            customer_phone="11987654321",
            customer_address="Rua A, 123, São Paulo, SP",
            total_amount=150.00,
            paid_amount=150.00,
            status=OrderStatus.PAID,
            tracking_code="BR123456789",
            seller_id=seller.id,
            collector_id=collector.id,
            is_duplicate=False
        )
        db.add(order1)
        
        # Sample order 2
        order2 = Order(
            order_number="ORD-002",
            customer_name="Maria Oliveira",
            customer_phone="11912345678",
            customer_address="Rua B, 456, São Paulo, SP",
            total_amount=200.00,
            paid_amount=100.00,
            status=OrderStatus.PARTIALLY_PAID,
            tracking_code="BR987654321",
            seller_id=seller.id,
            collector_id=collector.id,
            is_duplicate=False
        )
        db.add(order2)
        
        # Sample order 3 (duplicate of order 2)
        order3 = Order(
            order_number="ORD-003",
            customer_name="Maria Oliveira",
            customer_phone="11912345678",
            customer_address="Rua B, 456, São Paulo, SP",
            total_amount=200.00,
            paid_amount=0.00,
            status=OrderStatus.PENDING,
            seller_id=seller.id,
            collector_id=collector.id,
            is_duplicate=True
        )
        db.add(order3)
        
        # Sample order 4
        order4 = Order(
            order_number="ORD-004",
            customer_name="Carlos Pereira",
            customer_phone="11955554444",
            customer_address="Rua C, 789, São Paulo, SP",
            total_amount=300.00,
            paid_amount=0.00,
            status=OrderStatus.PENDING,
            seller_id=seller.id,
            collector_id=collector.id,
            is_duplicate=False
        )
        db.add(order4)
        
        db.commit()
        
        # Add billing history for paid orders
        billing1 = BillingHistory(
            order_id=order1.id,
            amount=150.00,
            notes="Pagamento completo",
            created_by=collector.id
        )
        db.add(billing1)
        
        billing2 = BillingHistory(
            order_id=order2.id,
            amount=100.00,
            notes="Pagamento parcial",
            created_by=collector.id
        )
        db.add(billing2)
        
        db.commit()
        logger.info("Sample orders created")
    else:
        logger.info(f"Database already has {orders_count} orders")


def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
