from typing import Optional
from pydantic import BaseModel, Field


class SettingBase(BaseModel):
    key: str
    value: str


class SettingCreate(SettingBase):
    pass


class SettingUpdate(BaseModel):
    value: str


class Setting(SettingBase):
    id: int

    class Config:
        orm_mode = True


class CorreiosSettings(BaseModel):
    apiUrl: str = Field(..., description="Correios API URL")
    apiKey: str = Field(..., description="Correios API key")
    useMock: bool = Field(..., description="Whether to use mock data")
