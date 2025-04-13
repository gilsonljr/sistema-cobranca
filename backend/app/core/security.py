from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_token(data: dict, token_type: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token with the specified type and expiration"""
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        if token_type == "access":
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        else:  # refresh token
            expire = datetime.utcnow() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)

    # Add claims to token
    to_encode.update({
        "exp": expire,
        "type": token_type,
        "iat": datetime.utcnow()
    })

    # Encode the token
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token"""
    return create_token(data, "access", expires_delta)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a refresh token"""
    return create_token(data, "refresh", expires_delta)

def create_tokens(data: dict) -> Dict[str, str]:
    """Create both access and refresh tokens"""
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

def verify_token(token: str, token_type: Optional[str] = None) -> Optional[dict]:
    """Verify a JWT token and optionally check its type"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        # If token_type is specified, verify the token type
        if token_type and payload.get("type") != token_type:
            return None

        return payload
    except JWTError:
        return None

def generate_password_reset_token(email: str) -> str:
    """Generate a token for password reset"""
    delta = timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.utcnow()
    expires = now + delta
    encoded_jwt = jwt.encode(
        {"exp": expires, "nbf": now, "sub": email, "type": "reset"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify a password reset token and return the email if valid"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "reset":
            return None
        return payload["sub"]
    except JWTError:
        return None