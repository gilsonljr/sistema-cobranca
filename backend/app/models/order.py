from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum
from datetime import datetime

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    NEGOTIATING = "negotiating"
    CANCELLED = "cancelled"
    DELIVERED = "delivered"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_address = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    tracking_code = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_duplicate = Column(Boolean, default=False)
    
    # Foreign Keys
    seller_id = Column(Integer, ForeignKey("users.id"))
    collector_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    seller = relationship("User", back_populates="created_orders", foreign_keys=[seller_id])
    collector = relationship("User", back_populates="assigned_orders", foreign_keys=[collector_id])
    billing_history = relationship("BillingHistory", back_populates="order")
    
    def __repr__(self):
        return f"<Order {self.order_number}>"

class BillingHistory(Base):
    __tablename__ = "billing_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    amount = Column(Float, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    order = relationship("Order", back_populates="billing_history")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<BillingHistory {self.id} for Order {self.order_id}>" 