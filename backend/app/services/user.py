from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from typing import List, Optional
from app.core.security import get_password_hash, verify_password
from sqlalchemy import func

class UserService:
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    def create_user(self, db: Session, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def update_user(self, db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None

        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)
        return db_user

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def get_least_busy_collector(self, db: Session) -> Optional[User]:
        # Get collectors with the least number of pending orders
        return (
            db.query(User)
            .filter(User.role == UserRole.COLLECTOR, User.is_active == True)
            .outerjoin(User.assigned_orders)
            .group_by(User.id)
            .order_by(func.count(User.assigned_orders).asc())
            .first()
        )

    def get_collectors(self, db: Session) -> List[User]:
        return db.query(User).filter(User.role == UserRole.COLLECTOR).all()

    def get_sellers(self, db: Session) -> List[User]:
        return db.query(User).filter(User.role == UserRole.SELLER).all()

    def delete_user(self, db: Session, user_id: int) -> Optional[User]:
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None

        # Store user data before deletion
        user_data = User(
            id=db_user.id,
            email=db_user.email,
            hashed_password=db_user.hashed_password,
            full_name=db_user.full_name,
            role=db_user.role,
            is_active=db_user.is_active
        )

        # Delete the user
        db.delete(db_user)
        db.commit()

        return user_data

user_service = UserService()