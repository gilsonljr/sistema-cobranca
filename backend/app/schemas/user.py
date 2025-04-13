from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class User(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str

class TokenPayload(BaseModel):
    sub: int
    type: Optional[str] = None

class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)