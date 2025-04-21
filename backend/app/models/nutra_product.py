from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum
from datetime import datetime

class ProductType(str, enum.Enum):
    CAPSULAS = "cápsulas"
    GOTAS = "gotas"
    COMPRIMIDOS = "comprimidos"
    PO = "pó"
    GEL = "gel"
    OUTRO = "outro"

class NutraProduct(Base):
    __tablename__ = "nutra_products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    variations = relationship("ProductVariation", back_populates="product")

    def __repr__(self):
        return f"<NutraProduct {self.name}>"

class ProductVariation(Base):
    __tablename__ = "product_variations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("nutra_products.id"), nullable=False)
    type = Column(Enum(ProductType), nullable=False)
    cost = Column(Float, nullable=False)
    sale_price = Column(Float, nullable=False)
    current_stock = Column(Integer, default=0)
    minimum_stock = Column(Integer, default=10)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("NutraProduct", back_populates="variations")
    stock_history = relationship("StockHistory", back_populates="variation")

    def __repr__(self):
        return f"<ProductVariation {self.product_id} ({self.type})>"

class Kit(Base):
    __tablename__ = "nutra_kits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    kit_products = relationship("KitProduct", back_populates="kit")
    sales = relationship("KitSale", back_populates="kit")

    def __repr__(self):
        return f"<Kit {self.name}>"

class KitProduct(Base):
    __tablename__ = "nutra_kit_products"

    id = Column(Integer, primary_key=True, index=True)
    kit_id = Column(Integer, ForeignKey("nutra_kits.id"), nullable=False)
    variation_id = Column(Integer, ForeignKey("product_variations.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    # Relationships
    kit = relationship("Kit", back_populates="kit_products")
    variation = relationship("ProductVariation")

    def __repr__(self):
        return f"<KitProduct {self.kit_id}:{self.variation_id} x{self.quantity}>"

class Distributor(Base):
    __tablename__ = "nutra_distributors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = relationship("DistributorOrder", back_populates="distributor")

    def __repr__(self):
        return f"<Distributor {self.name}>"

class OrderStatus(str, enum.Enum):
    PENDENTE = "pendente"
    CANCELADO = "cancelado"
    COMPLETO = "completo"

class DistributorOrder(Base):
    __tablename__ = "nutra_distributor_orders"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("nutra_distributors.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expected_delivery_date = Column(DateTime, nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDENTE)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    distributor = relationship("Distributor", back_populates="orders")
    user = relationship("User")
    order_items = relationship("DistributorOrderItem", back_populates="order")

    def __repr__(self):
        return f"<DistributorOrder {self.id} for {self.distributor_id}>"

class DistributorOrderItem(Base):
    __tablename__ = "nutra_distributor_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("nutra_distributor_orders.id"), nullable=False)
    variation_id = Column(Integer, ForeignKey("product_variations.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    # Relationships
    order = relationship("DistributorOrder", back_populates="order_items")
    variation = relationship("ProductVariation")

    def __repr__(self):
        return f"<DistributorOrderItem {self.order_id}:{self.variation_id} x{self.quantity}>"

class StockChangeReason(str, enum.Enum):
    MANUAL = "manual"
    KIT_SALE = "kit_sale"
    ORDER_RECEIVED = "order_received"
    ADJUSTMENT = "adjustment"
    DAMAGED = "damaged"
    EXPIRED = "expired"

class StockHistory(Base):
    __tablename__ = "nutra_stock_history"

    id = Column(Integer, primary_key=True, index=True)
    variation_id = Column(Integer, ForeignKey("product_variations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    change_amount = Column(Integer, nullable=False)  # Positive for additions, negative for deductions
    reason = Column(Enum(StockChangeReason), nullable=False)
    reference_type = Column(String, nullable=True)  # 'kit_sale', 'order', etc.
    reference_id = Column(Integer, nullable=True)  # ID of the related entity
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    variation = relationship("ProductVariation", back_populates="stock_history")
    user = relationship("User")

    def __repr__(self):
        return f"<StockHistory {self.variation_id} {self.change_amount}>"

class KitSale(Base):
    __tablename__ = "nutra_kit_sales"

    id = Column(Integer, primary_key=True, index=True)
    kit_id = Column(Integer, ForeignKey("nutra_kits.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    sale_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    kit = relationship("Kit", back_populates="sales")
    user = relationship("User")

    def __repr__(self):
        return f"<KitSale {self.kit_id} x{self.quantity}>"
