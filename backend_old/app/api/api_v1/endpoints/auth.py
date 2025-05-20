from fastapi import APIRouter, Depends, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, create_tokens, verify_token
from app.core.security import generate_password_reset_token, verify_password_reset_token, get_password_hash
from app.db.session import get_db
from app.schemas.user import User, UserCreate, Token, TokenPayload, PasswordReset
from app.services.user import user_service
from app.api.deps import get_current_admin, get_current_active_user
from app.core.errors import AuthenticationError, ConflictError, ValidationError, NotFoundError

router = APIRouter()

@router.post("/login", response_model=Token, summary="User login", description="Login with username/email and password to get access and refresh tokens")
async def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Login user and return access and refresh tokens.

    - **username**: Email address of the user
    - **password**: Password of the user

    Returns access and refresh tokens that can be used for authentication.
    """
    user = user_service.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise AuthenticationError(
            detail="Incorrect email or password"
        )

    # Create both access and refresh tokens
    tokens = create_tokens(data={"sub": user.id})
    return tokens

@router.post("/register", response_model=User)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_admin)
):
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise ConflictError(
            detail="The user with this email already exists in the system."
        )
    user = user_service.create_user(db=db, user=user_in)
    return user

@router.post("/refresh", response_model=Token, summary="Refresh token", description="Get a new access token using a refresh token")
def refresh_token(db: Session = Depends(get_db), refresh_token: str = Body(..., description="The refresh token obtained during login")):
    """Refresh access token using refresh token.

    - **refresh_token**: The refresh token obtained during login

    Returns new access and refresh tokens.
    """
    try:
        # Verify the refresh token
        payload = verify_token(refresh_token, token_type="refresh")
        if payload is None:
            raise AuthenticationError(detail="Invalid refresh token")

        # Get user ID from token
        user_id = payload.get("sub")
        if user_id is None:
            raise AuthenticationError(detail="Invalid refresh token")

        # Get user from database
        user = user_service.get_user(db, user_id)
        if user is None or not user.is_active:
            raise AuthenticationError(detail="User not found or inactive")

        # Create new tokens
        tokens = create_tokens(data={"sub": user.id})
        return tokens
    except Exception:
        raise AuthenticationError(detail="Could not validate refresh token")

@router.post("/password-reset/request", summary="Request password reset", description="Request a password reset token for a user account")
def request_password_reset(email: str = Body(..., description="Email address of the user account"), db: Session = Depends(get_db)):
    """Request password reset for a user.

    - **email**: Email address of the user account

    Returns a success message. If the email exists in the system, a password reset token will be generated.
    In a production environment, this token would be sent to the user's email.
    """
    user = user_service.get_user_by_email(db, email=email)
    if user:
        # Generate password reset token
        reset_token = generate_password_reset_token(email)

        # In a real application, you would send an email with the reset token
        # For now, we'll just return the token in the response (for development only)
        return {"message": "Password reset token generated", "token": reset_token}

    # Always return a success message even if the email doesn't exist
    # This prevents user enumeration attacks
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/password-reset/confirm", summary="Confirm password reset", description="Reset a user's password using a reset token")
def reset_password(db: Session = Depends(get_db), reset_data: PasswordReset = Body(..., description="Password reset data including token and new password")):
    """Reset password using reset token.

    - **token**: The password reset token received via email
    - **new_password**: The new password for the account

    Returns a success message if the password was reset successfully.
    """
    # Verify the reset token
    email = verify_password_reset_token(reset_data.token)
    if not email:
        raise AuthenticationError(detail="Invalid or expired token")

    # Get user by email
    user = user_service.get_user_by_email(db, email=email)
    if not user:
        raise NotFoundError(detail="User not found")

    # Update password
    user_update = {"password": reset_data.new_password}
    user = user_service.update_user(db, user_id=user.id, user_update=user_update)

    return {"message": "Password updated successfully"}