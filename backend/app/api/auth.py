from datetime import datetime, timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.db.models import User
from app.schemas.token import Token
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

# app/api/auth.py
@router.post("/auth/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    print(f"Login attempt with username: {form_data.username}")
    
    # Check if user exists by username
    user_by_username = db.query(User).filter(User.username == form_data.username).first()
    print(f"User found by username: {user_by_username is not None}")
    
    # Check if user exists by email
    user_by_email = db.query(User).filter(User.email == form_data.username).first()
    print(f"User found by email: {user_by_email is not None}")
    
    # Try to authenticate
    user = deps.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        print("Authentication failed: Incorrect username or password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Authentication successful for user: {user.username} (id: {user.id}, role: {user.role})")
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/auth/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Register a new user (admin only)
    """
    # Check if user with this username or email exists
    user = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )
    
    # Create new user
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/auth/reset-password")
def reset_password(
    email: str, db: Session = Depends(deps.get_db)
) -> Any:
    """
    Password recovery
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal that the user doesn't exist
        return {"message": "Password reset email sent if account exists"}
    
    # In a real application, send an email with a password reset link
    # For this implementation, we'll just return a success message
    
    return {"message": "Password reset email sent if account exists"}

@router.post("/auth/profile", response_model=UserSchema)
def read_user_profile(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user profile
    """
    return current_user

@router.put("/auth/profile", response_model=UserSchema)
def update_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    user_update: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update current user profile
    """
    # Check if username or email is taken
    if user_update.username and user_update.username != current_user.username:
        user = db.query(User).filter(User.username == user_update.username).first()
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
    
    if user_update.email and user_update.email != current_user.email:
        user = db.query(User).filter(User.email == user_update.email).first()
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    
    # Update user
    for field, value in user_update.dict(exclude_unset=True).items():
        if field == "password" and value:
            setattr(current_user, "password_hash", get_password_hash(value))
        else:
            setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user