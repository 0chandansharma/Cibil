from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api import deps
from app.core.security import get_password_hash
from app.db.models import User, Document, Client
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

@router.get("/dashboard", response_model=dict)
def get_admin_dashboard(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Get admin dashboard data
    """
    total_users = db.query(User).count()
    total_documents = db.query(Document).count()
    processed_documents = db.query(Document).filter(Document.status == "completed").count()
    
    processing_rate = 0
    if total_documents > 0:
        processing_rate = int((processed_documents / total_documents) * 100)
    
    # Get recent activity (simplified for now)
    recent_activity = []
    
    # Get processing statistics (simplified for now)
    processing_stats = {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "datasets": [
            {
                "label": "Documents Processed",
                "data": [12, 19, 15, 25, 22, 30],
                "borderColor": "rgb(53, 162, 235)",
                "backgroundColor": "rgba(53, 162, 235, 0.5)",
            },
            {
                "label": "New Users",
                "data": [5, 7, 4, 6, 2, 8],
                "borderColor": "rgb(255, 99, 132)",
                "backgroundColor": "rgba(255, 99, 132, 0.5)",
            },
        ],
    }
    
    return {
        "totalUsers": total_users,
        "totalDocuments": total_documents,
        "processedDocuments": processed_documents,
        "processingRate": processing_rate,
        "recentActivity": recent_activity,
        "processingStats": processing_stats,
    }

@router.get("/users", response_model=dict)
def get_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
    skip: int = 0,
    limit: int = 100,
    search: str = "",
) -> Any:
    """
    Retrieve users with pagination and search
    """
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%"))
        )
    
    total_count = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return {
        "users": users,
        "totalCount": total_count,
    }

@router.post("/users", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new user
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

@router.get("/users/{user_id}", response_model=UserSchema)
def get_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Get user by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user

@router.put("/users/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update a user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if username or email is taken by another user
    if user_in.username and user_in.username != user.username:
        existing_user = db.query(User).filter(User.username == user_in.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
    
    if user_in.email and user_in.email != user.email:
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    
    # Update user
    for field, value in user_in.dict(exclude_unset=True).items():
        if field == "password" and value:
            setattr(user, "password_hash", get_password_hash(value))
        else:
            setattr(user, field, value)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/users/{user_id}", response_model=UserSchema)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Delete a user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent deleting self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own user account",
        )
    
    db.delete(user)
    db.commit()
    
    return user

@router.get("/stats", response_model=dict)
def get_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
    time_range: str = Query("month", enum=["week", "month", "quarter", "year"]),
) -> Any:
    """
    Get statistics for admin dashboard
    """
    # In a real application, we would filter by time range and get actual stats
    # For this implementation, we'll return mock data
    
    documents_by_type = {
        "labels": ["PDF", "JPEG", "PNG", "Other"],
        "datasets": [
            {
                "label": "Document Types",
                "data": [65, 20, 10, 5],
                "backgroundColor": [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                ],
                "borderColor": [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                ],
                "borderWidth": 1,
            },
        ],
    }
    
    processing_times = {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "datasets": [
            {
                "label": "Average Processing Time (seconds)",
                "data": [12, 19, 15, 10, 8, 5],
                "backgroundColor": "rgba(75, 192, 192, 0.6)",
                "borderColor": "rgba(75, 192, 192, 1)",
                "borderWidth": 1,
            },
        ],
    }
    
    user_activity = {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "datasets": [
            {
                "label": "Document Uploads",
                "data": [12, 19, 15, 25, 22, 30],
                "borderColor": "rgb(53, 162, 235)",
                "backgroundColor": "rgba(53, 162, 235, 0.5)",
            },
            {
                "label": "Document Processing",
                "data": [10, 15, 12, 20, 18, 25],
                "borderColor": "rgb(255, 99, 132)",
                "backgroundColor": "rgba(255, 99, 132, 0.5)",
            },
        ],
    }
    
    return {
        "documentsByType": documents_by_type,
        "processingTimes": processing_times,
        "userActivity": user_activity,
    }