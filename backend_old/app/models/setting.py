from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import Session
from app.db.base import Base


class Setting(Base):
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)

    @staticmethod
    def get_setting(db: Session, key: str, default_value: str = "") -> str:
        """
        Get a setting value by key

        Args:
            db: Database session
            key: Setting key
            default_value: Default value if setting doesn't exist

        Returns:
            Setting value
        """
        setting = db.query(Setting).filter(Setting.key == key).first()
        if not setting:
            return default_value
        return setting.value

    @staticmethod
    def set_setting(db: Session, key: str, value: str) -> "Setting":
        """
        Set a setting value

        Args:
            db: Database session
            key: Setting key
            value: Setting value

        Returns:
            Setting object
        """
        setting = db.query(Setting).filter(Setting.key == key).first()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            db.add(setting)
        db.commit()
        db.refresh(setting)
        return setting
