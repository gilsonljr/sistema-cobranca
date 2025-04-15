from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Session
from typing import List
from app.db.base import Base


class TrackingHistory(Base):
    id = Column(Integer, primary_key=True, index=True)
    tracking_code = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)
    status = Column(String, nullable=False)
    success = Column(Boolean, default=True, nullable=False)
    user_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)

    @staticmethod
    def add_history(
        db: Session,
        tracking_code: str,
        status: str,
        success: bool = True,
        user_id: int = None,
        details: str = None
    ) -> "TrackingHistory":
        """
        Add a tracking history entry

        Args:
            db: Database session
            tracking_code: Tracking code
            status: Status message
            success: Whether the tracking was successful
            user_id: ID of the user who performed the tracking
            details: Additional details

        Returns:
            TrackingHistory object
        """
        history = TrackingHistory(
            tracking_code=tracking_code,
            status=status,
            success=success,
            user_id=user_id,
            details=details
        )
        db.add(history)
        db.commit()
        db.refresh(history)
        return history

    @staticmethod
    def get_history(
        db: Session,
        limit: int = 50,
        user_id: int = None
    ) -> List["TrackingHistory"]:
        """
        Get tracking history

        Args:
            db: Database session
            limit: Maximum number of entries to return
            user_id: Filter by user ID

        Returns:
            List of TrackingHistory objects
        """
        query = db.query(TrackingHistory)

        if user_id is not None:
            query = query.filter(TrackingHistory.user_id == user_id)

        return query.order_by(TrackingHistory.timestamp.desc()).limit(limit).all()

    @staticmethod
    def clear_history(db: Session, user_id: int = None) -> int:
        """
        Clear tracking history

        Args:
            db: Database session
            user_id: Filter by user ID

        Returns:
            Number of deleted entries
        """
        query = db.query(TrackingHistory)

        if user_id is not None:
            query = query.filter(TrackingHistory.user_id == user_id)

        count = query.count()
        query.delete()
        db.commit()
        return count
