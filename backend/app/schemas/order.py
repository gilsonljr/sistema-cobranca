from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus

class OrderBase(BaseModel):
    order_number: str
    customer_name: str
    customer_phone: str
    customer_address: str
    total_amount: float
    tracking_code: Optional[str] = None

class OrderCreate(OrderBase):
    seller_id: int

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    paid_amount: Optional[float] = None
    tracking_code: Optional[str] = None
    collector_id: Optional[int] = None
    is_duplicate: Optional[bool] = None

class BillingHistoryBase(BaseModel):
    amount: float
    notes: Optional[str] = None

class BillingHistoryCreate(BillingHistoryBase):
    order_id: int

class BillingHistory(BillingHistoryBase):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class Order(OrderBase):
    id: int
    status: OrderStatus
    paid_amount: float
    created_at: datetime
    updated_at: Optional[datetime]
    seller_id: int
    collector_id: Optional[int]
    is_duplicate: bool
    billing_history: List[BillingHistory] = []

    class Config:
        from_attributes = True

class OrderInDB(Order):
    pass 