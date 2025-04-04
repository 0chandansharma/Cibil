import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models import User, UserRole
from app.core.security import get_password_hash, create_access_token

class TestAdminAPI:
    @pytest.fixture
    def admin_token(self, db: Session):
        # Create an admin user
        admin = User(
            username="admin",
            email="admin@example.com",
            password_hash=get_password_hash("adminpass"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        
        # Create access token
        token = create_access_token(admin.id)
        
        return {"user": admin, "token": token}
    
    @pytest.fixture
    def ca_token(self, db: Session):
        # Create a CA user
        ca = User(
            username="causer",
            email="ca@example.com",
            password_hash=get_password_hash("capass"),
            role=UserRole.CA,
            is_active=True,
        )
        db.add(ca)
        db.commit()
        
        # Create access token
        token = create_access_token(ca.id)
        
        return {"user": ca, "token": token}
    
    def test_get_admin_dashboard(self, client: TestClient, admin_token):
        # Get admin dashboard
        response = client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "totalUsers" in response.json()
        assert "totalDocuments" in response.json()
        assert "processedDocuments" in response.json()
        assert "processingRate" in response.json()
        assert "processingStats" in response.json()
    
    def test_get_admin_dashboard_unauthorized(self, client: TestClient, ca_token):
        # Try to access admin dashboard as CA user
        response = client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {ca_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 403
    
    def test_get_users(self, client: TestClient, admin_token, ca_token):
        # Get users
        response = client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "users" in response.json()
        assert "totalCount" in response.json()
        assert response.json()["totalCount"] == 2  # admin and ca users
        
        # Check search
        response = client.get(
            "/api/admin/users?search=ca",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        assert response.status_code == 200
        assert response.json()["totalCount"] == 1
        assert response.json()["users"][0]["username"] == "causer"
    
    def test_create_user(self, client: TestClient, admin_token):
        # Create user
        response = client.post(
            "/api/admin/users",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "Password123!",
                "role": "ca",
                "first_name": "New",
                "last_name": "User",
            },
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["username"] == "newuser"
        assert response.json()["email"] == "new@example.com"
        assert response.json()["role"] == "ca"
        assert response.json()["first_name"] == "New"
        assert response.json()["last_name"] == "User"
        
        # Try to create user with existing username
        response = client.post(
            "/api/admin/users",
            json={
                "username": "newuser",  # Same username
                "email": "different@example.com",
                "password": "Password123!",
                "role": "ca",
            },
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        assert response.status_code == 400
    
    def test_get_user_by_id(self, client: TestClient, admin_token, ca_token):
        # Get user by ID
        response = client.get(
            f"/api/admin/users/{ca_token['user'].id}",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["id"] == ca_token["user"].id
        assert response.json()["username"] == ca_token["user"].username
    
    def test_update_user(self, client: TestClient, admin_token, ca_token):
        # Update user
        response = client.put(
            f"/api/admin/users/{ca_token['user'].id}",
            json={
                "first_name": "Updated",
                "last_name": "User",
            },
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["id"] == ca_token["user"].id
        assert response.json()["first_name"] == "Updated"
        assert response.json()["last_name"] == "User"
    
    def test_delete_user(self, client: TestClient, admin_token, ca_token):
        # Delete user
        response = client.delete(
            f"/api/admin/users/{ca_token['user'].id}",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["id"] == ca_token["user"].id
        
        # Check if user was deleted
        response = client.get(
            f"/api/admin/users/{ca_token['user'].id}",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        assert response.status_code == 404
    
    def test_get_stats(self, client: TestClient, admin_token):
        # Get stats
        response = client.get(
            "/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "documentsByType" in response.json()
        assert "processingTimes" in response.json()
        assert "userActivity" in response.json()
        
        # Check with time range
        response = client.get(
            "/api/admin/stats?time_range=week",
            headers={"Authorization": f"Bearer {admin_token['token']}"},
        )
        assert response.status_code == 200