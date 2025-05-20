from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

class TimestampSchema(BaseSchema):
    created_at: datetime
    updated_at: Optional[datetime] = None 