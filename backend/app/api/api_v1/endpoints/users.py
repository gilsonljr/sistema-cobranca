from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_active_user, get_current_admin
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.user import User, UserCreate, UserUpdate
from app.services.user import user_service
from app.core.errors import NotFoundError, ConflictError, AuthorizationError

router = APIRouter()

@router.get("/", response_model=List[User])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all users.
    Only admin users can access this endpoint.
    """
    return user_service.get_users(db, skip=skip, limit=limit)

@router.get("/me", response_model=User)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user information.
    """
    return current_user

@router.put("/me", response_model=User)
def update_current_user(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    user_in: UserUpdate
):
    """
    Update current user information.
    """
    return user_service.update_user(db, user_id=current_user.id, user_update=user_in)

@router.post("/", response_model=User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new user.
    Only admin users can create new users.
    """
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise ConflictError(
            detail="The user with this email already exists in the system."
        )
    user = user_service.create_user(db=db, user=user_in)
    return user

@router.get("/{user_id}", response_model=User)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Get a specific user by ID.
    Only admin users can access this endpoint.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise NotFoundError(
            detail="The user with this ID does not exist in the system"
        )
    return user

@router.put("/{user_id}", response_model=User)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_admin)
):
    """
    Update a user.
    Only admin users can update other users.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise NotFoundError(
            detail="The user with this ID does not exist in the system"
        )
    
    # Prevent changing role of admin users
    if user.role == "admin" and user_in.role and user_in.role != "admin":
        raise ConflictError(
            detail="Cannot change the role of an admin user"
        )
    
    return user_service.update_user(db, user_id=user_id, user_update=user_in)

@router.delete("/{user_id}", response_model=User)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(get_current_admin)
):
    """
    Delete a user.
    Only admin users can delete users.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise NotFoundError(
            detail="The user with this ID does not exist in the system"
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise ConflictError(
            detail="You cannot delete your own user account"
        )
    
    # Prevent deleting the last admin user
    if user.role == "admin":
        admin_count = db.query(UserModel).filter(UserModel.role == "admin").count()
        if admin_count <= 1:
            raise ConflictError(
                detail="Cannot delete the last admin user"
            )
    
    return user_service.delete_user(db, user_id=user_id)
