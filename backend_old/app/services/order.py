from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from datetime import datetime

from app.models.order import Order, BillingHistory, OrderStatus
from app.schemas.order import OrderCreate, OrderUpdate, BillingHistoryCreate


class OrderService:
    def get_orders(self, db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all orders with pagination"""
        return db.query(Order).offset(skip).limit(limit).all()
    
    def get_order(self, db: Session, order_id: int) -> Optional[Order]:
        """Get a specific order by ID"""
        return db.query(Order).filter(Order.id == order_id).first()
    
    def get_order_by_number(self, db: Session, order_number: str) -> Optional[Order]:
        """Get a specific order by order number"""
        return db.query(Order).filter(Order.order_number == order_number).first()
    
    def get_orders_by_status(self, db: Session, status: OrderStatus) -> List[Order]:
        """Get orders filtered by status"""
        return db.query(Order).filter(Order.status == status).all()
    
    def get_orders_by_collector(self, db: Session, collector_id: int) -> List[Order]:
        """Get orders assigned to a specific collector"""
        return db.query(Order).filter(Order.collector_id == collector_id).all()
    
    def get_orders_by_seller(self, db: Session, seller_id: int) -> List[Order]:
        """Get orders created by a specific seller"""
        return db.query(Order).filter(Order.seller_id == seller_id).all()
    
    def create_order(self, db: Session, order: OrderCreate, collector_id: Optional[int] = None) -> Order:
        """Create a new order"""
        # Check if this might be a duplicate order
        existing_order = self.get_order_by_number(db, order.order_number)
        is_duplicate = existing_order is not None
        
        # Create the order object
        db_order = Order(
            order_number=order.order_number,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            customer_address=order.customer_address,
            total_amount=order.total_amount,
            tracking_code=order.tracking_code,
            seller_id=order.seller_id,
            collector_id=collector_id,
            is_duplicate=is_duplicate
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    
    def update_order(self, db: Session, order_id: int, order_update: OrderUpdate) -> Optional[Order]:
        """Update an existing order"""
        db_order = self.get_order(db, order_id)
        if not db_order:
            return None
        
        # Update order fields
        update_data = order_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_order, field, value)
        
        # Update the updated_at timestamp
        db_order.updated_at = datetime.utcnow()
        
        # If paid_amount is updated, check if we need to update the status
        if "paid_amount" in update_data:
            if db_order.paid_amount >= db_order.total_amount:
                db_order.status = OrderStatus.PAID
            elif db_order.paid_amount > 0:
                db_order.status = OrderStatus.PARTIALLY_PAID
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    def add_billing_history(self, db: Session, billing: BillingHistoryCreate, created_by: int) -> BillingHistory:
        """Add a billing history entry to an order"""
        # Create the billing history entry
        db_billing = BillingHistory(
            order_id=billing.order_id,
            amount=billing.amount,
            notes=billing.notes,
            created_by=created_by
        )
        
        db.add(db_billing)
        db.commit()
        db.refresh(db_billing)
        
        # Update the order's paid amount
        order = self.get_order(db, billing.order_id)
        if order:
            order.paid_amount += billing.amount
            
            # Update status based on payment
            if order.paid_amount >= order.total_amount:
                order.status = OrderStatus.PAID
            elif order.paid_amount > 0:
                order.status = OrderStatus.PARTIALLY_PAID
                
            db.commit()
        
        return db_billing
    
    def get_duplicate_orders(self, db: Session) -> List[Order]:
        """Get orders marked as duplicates"""
        return db.query(Order).filter(Order.is_duplicate == True).all()
    
    def detect_duplicate_orders(self, db: Session) -> List[Order]:
        """Detect potential duplicate orders based on customer info and order amount"""
        # Find orders with the same customer phone and similar total amount
        duplicates = []
        orders = self.get_orders(db)
        
        for i, order in enumerate(orders):
            for j in range(i + 1, len(orders)):
                other = orders[j]
                
                # Check if orders have the same customer phone
                if order.customer_phone == other.customer_phone:
                    # Check if total amounts are similar (within 5%)
                    amount_diff = abs(order.total_amount - other.total_amount)
                    amount_percent = amount_diff / max(order.total_amount, other.total_amount)
                    
                    if amount_percent <= 0.05:  # 5% threshold
                        # Mark both orders as duplicates
                        if not order.is_duplicate:
                            order.is_duplicate = True
                            duplicates.append(order)
                        
                        if not other.is_duplicate:
                            other.is_duplicate = True
                            duplicates.append(other)
        
        if duplicates:
            db.commit()
        
        return duplicates
    
    def search_orders(self, db: Session, query: str) -> List[Order]:
        """Search orders by various criteria"""
        search = f"%{query}%"
        return db.query(Order).filter(
            or_(
                Order.order_number.ilike(search),
                Order.customer_name.ilike(search),
                Order.customer_phone.ilike(search),
                Order.tracking_code.ilike(search)
            )
        ).all()
    
    def get_orders_by_date_range(self, db: Session, start_date: datetime, end_date: datetime) -> List[Order]:
        """Get orders created within a date range"""
        return db.query(Order).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        ).all()
    
    def get_orders_statistics(self, db: Session):
        """Get statistics about orders"""
        total_orders = db.query(func.count(Order.id)).scalar()
        total_amount = db.query(func.sum(Order.total_amount)).scalar() or 0
        total_paid = db.query(func.sum(Order.paid_amount)).scalar() or 0
        
        # Count orders by status
        status_counts = {}
        for status in OrderStatus:
            count = db.query(func.count(Order.id)).filter(Order.status == status).scalar()
            status_counts[status.value] = count
        
        return {
            "total_orders": total_orders,
            "total_amount": total_amount,
            "total_paid": total_paid,
            "payment_rate": (total_paid / total_amount) if total_amount > 0 else 0,
            "status_counts": status_counts
        }


# Create a singleton instance
order_service = OrderService()
