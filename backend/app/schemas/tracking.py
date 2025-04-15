from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TrackingEvent(BaseModel):
    data: str = Field(..., description="Date of the event")
    hora: str = Field(..., description="Time of the event")
    local: str = Field(..., description="Location of the event")
    status: str = Field(..., description="Status description")
    subStatus: Optional[str] = Field(None, description="Additional status details")


class TrackingResponse(BaseModel):
    codigo: str = Field(..., description="Tracking code")
    eventos: List[TrackingEvent] = Field(default_factory=list, description="List of tracking events")
    entregue: bool = Field(..., description="Whether the package has been delivered")
    servico: Optional[str] = Field(None, description="Service type (e.g., SEDEX, PAC)")
    error: Optional[str] = Field(None, description="Error message if tracking failed")


class TrackingRequest(BaseModel):
    tracking_code: str = Field(..., description="Tracking code to look up")


class MultiTrackingRequest(BaseModel):
    tracking_codes: List[str] = Field(..., description="List of tracking codes to look up")


class ApiStatus(BaseModel):
    status: str = Field(..., description="API status (online, offline, unknown)")
    message: Optional[str] = Field(None, description="Status message")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp of the status check")
    response_time: Optional[int] = Field(None, description="API response time in milliseconds")


class TrackingHistoryItem(BaseModel):
    id: int
    tracking_code: str
    timestamp: datetime
    status: str
    success: bool
    details: Optional[str] = None

    class Config:
        orm_mode = True


class TrackingHistoryResponse(BaseModel):
    items: List[TrackingHistoryItem]
    total: int
