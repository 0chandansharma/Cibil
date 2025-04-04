import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.db.models import User, UserRole

def test_login(client: TestClient, db: Session):
    # Create a test user
    test_user = User(
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.CA,
        is_active=True,
    )
    db.add(test_user)
    db.commit()
    
    # Test login with correct credentials
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    
    # Test login with incorrect password
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    
    # Test login with non-existent user
    response = client.post(
        "/api/auth/login",
        data={"username": "nonexistentuser", "password": "password123"},
    )
    assert response.status_code == 401