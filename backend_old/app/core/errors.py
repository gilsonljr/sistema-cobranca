from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class AppError(HTTPException):
    """Base class for application errors"""
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: Optional[Dict[str, Any]] = None,
        error_code: str = "error"
    ) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class NotFoundError(AppError):
    """Resource not found error"""
    def __init__(
        self,
        detail: str = "Resource not found",
        headers: Optional[Dict[str, Any]] = None,
        error_code: str = "not_found"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            headers=headers,
            error_code=error_code
        )


class AuthenticationError(AppError):
    """Authentication error"""
    def __init__(
        self,
        detail: str = "Authentication failed",
        headers: Optional[Dict[str, Any]] = None,
        error_code: str = "authentication_error"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers or {"WWW-Authenticate": "Bearer"},
            error_code=error_code
        )


class AuthorizationError(AppError):
    """Authorization error"""
    def __init__(
        self,
        detail: str = "Not enough permissions",
        headers: Optional[Dict[str, Any]] = None,
        error_code: str = "authorization_error"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            headers=headers,
            error_code=error_code
        )


class ValidationError(AppError):
    """Validation error"""
    def __init__(
        self,
        detail: Any = "Validation error",
        headers: Optional[Dict[str, Any]] = None,
        error_code: str = "validation_error"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            headers=headers,
            error_code=error_code
        )


class ConflictError(AppError):
    """Conflict error"""
    def __init__(
        self,
        detail: str = "Resource conflict",
        headers: Optional[Dict[str, Any]] = None,
        error_code: str = "conflict"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            headers=headers,
            error_code=error_code
        )


class ServerError(AppError):
    """Server error"""
    def __init__(
        self,
        detail: str = "Internal server error",
        headers: Optional[Dict[str, Any]] = None,
        error_code: str = "server_error"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            headers=headers,
            error_code=error_code
        )
