from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.nutra_product import ProductType, OrderStatus, StockChangeReason

# Base schemas
class NutraBase(BaseModel):
    class Config:
        from_attributes = True

# Product schemas
class ProductBase(NutraBase):
    name: str
    type: ProductType
    cost: float
    sale_price: float
    minimum_stock: int
    description: Optional[str] = None

class ProductCreate(ProductBase):
    current_stock: int = 0
    active: bool = True

class ProductUpdate(NutraBase):
    name: Optional[str] = None
    type: Optional[ProductType] = None
    cost: Optional[float] = None
    sale_price: Optional[float] = None
    minimum_stock: Optional[int] = None
    description: Optional[str] = None
    active: Optional[bool] = None

class ProductInDB(ProductBase):
    id: int
    current_stock: int
    active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class Product(ProductInDB):
    pass

# Kit schemas
class KitBase(NutraBase):
    name: str
    description: Optional[str] = None

class KitCreate(KitBase):
    active: bool = True
    products: List[Dict[str, Any]]  # List of {product_id, quantity}

class KitUpdate(NutraBase):
    name: Optional[str] = None
    description: Optional[str] = None
    active: Optional[bool] = None
    products: Optional[List[Dict[str, Any]]] = None

class KitProductBase(NutraBase):
    kit_id: int
    product_id: int
    quantity: int

class KitProduct(KitProductBase):
    id: int

class KitInDB(KitBase):
    id: int
    active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    kit_products: List[KitProduct] = []

class Kit(KitInDB):
    products: List[Product] = []

# Distributor schemas
class DistributorBase(NutraBase):
    name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class DistributorCreate(DistributorBase):
    active: bool = True

class DistributorUpdate(NutraBase):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    active: Optional[bool] = None

class DistributorInDB(DistributorBase):
    id: int
    active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class Distributor(DistributorInDB):
    pass

# Order schemas
class OrderItemBase(NutraBase):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    product: Optional[Product] = None

class OrderBase(NutraBase):
    distributor_id: int
    expected_delivery_date: Optional[datetime] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(NutraBase):
    distributor_id: Optional[int] = None
    expected_delivery_date: Optional[datetime] = None
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None
    items: Optional[List[OrderItemCreate]] = None

class OrderInDB(OrderBase):
    id: int
    user_id: int
    status: OrderStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItem] = []

class Order(OrderInDB):
    distributor: Optional[Distributor] = None

# Stock history schemas
class StockHistoryBase(NutraBase):
    product_id: int
    change_amount: int
    reason: StockChangeReason
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    notes: Optional[str] = None

class StockHistoryCreate(StockHistoryBase):
    user_id: int

class StockHistory(StockHistoryBase):
    id: int
    user_id: int
    created_at: datetime
    product: Optional[Product] = None

# Kit sale schemas
class KitSaleBase(NutraBase):
    kit_id: int
    quantity: int = 1
    notes: Optional[str] = None

class KitSaleCreate(KitSaleBase):
    user_id: int
    sale_date: Optional[datetime] = None

class KitSale(KitSaleBase):
    id: int
    user_id: int
    sale_date: datetime
    created_at: datetime
    kit: Optional[Kit] = None

# Dashboard and analytics schemas
class ProductStockStatus(NutraBase):
    id: int
    name: str
    type: ProductType
    current_stock: int
    minimum_stock: int
    status: str  # "ok", "low", "out"
    percentage: float  # Stock as percentage of minimum

class SalesAnalytics(NutraBase):
    total_sales: int
    total_revenue: float
    products_sold: Dict[str, int]  # Product name -> quantity
    kits_sold: Dict[str, int]  # Kit name -> quantity

class InventorySummary(NutraBase):
    total_products: int
    low_stock_count: int
    out_of_stock_count: int
    total_inventory_value: float
    low_stock_items: List[ProductStockStatus] = []
