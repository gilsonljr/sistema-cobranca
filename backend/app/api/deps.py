from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import UserRole
from app.services.user import user_service
from app.core.errors import AuthenticationError, ValidationError, AuthorizationError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = AuthenticationError(
        detail="Could not validate credentials"
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = user_service.get_user(db, user_id)
    if user is None:
        raise credentials_exception

    return user

def get_current_active_user(
    current_user = Depends(get_current_user)
):
    if not current_user.is_active:
        raise ValidationError(detail="Inactive user")
    return current_user

def get_current_admin(
    current_user = Depends(get_current_active_user)
):
    if current_user.role != UserRole.ADMIN:
        raise AuthorizationError(
            detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_supervisor(
    current_user = Depends(get_current_active_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        raise AuthorizationError(
            detail="The user doesn't have enough privileges"
        )
    return current_user