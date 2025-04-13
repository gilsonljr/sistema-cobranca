from sqlalchemy import Boolean, Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    COLLECTOR = "collector"
    SELLER = "seller"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    assigned_orders = relationship("Order", back_populates="collector")
    created_orders = relationship("Order", back_populates="seller")
    
    def __repr__(self):
        return f"<User {self.email}>" 