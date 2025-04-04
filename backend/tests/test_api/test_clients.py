import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models import User, Client, Document, DocumentStatus
from app.core.security import get_password_hash, create_access_token

class TestClientsAPI:
    @pytest.fixture
    def user_token(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role="ca",
            is_active=True,
        )
        db.add(user)
        db.commit()
        
        # Create access token
        token = create_access_token(user.id)
        
        return {"user": user, "token": token}
    
    @pytest.fixture
    def test_client(self, db: Session, user_token):
        # Create a test client
        client = Client(
            name="Test Client",
            email="client@example.com",
            phone="1234567890",
            address="123 Test St",
            ca_id=user_token["user"].id,
        )
        db.add(client)
        db.commit()
        
        return client
    
    @pytest.fixture
    def test_document(self, db: Session, user_token, test_client):
        # Create a test document
        document = Document(
            title="Test Document",
            file_path="/path/to/test.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            client_id=test_client.id,
            user_id=user_token["user"].id,
        )
        db.add(document)
        db.commit()
        
        return document
    
    def test_get_clients(self, client: TestClient, user_token, test_client):
        # Get clients
        response = client.get(
            "/api/clients",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == test_client.id
        assert response.json()[0]["name"] == test_client.name
        assert "documents_count" in response.json()[0]
    
    def test_create_client(self, client: TestClient, user_token):
        # Create client
        response = client.post(
            "/api/clients",
            json={
                "name": "New Client",
                "email": "new@example.com",
                "phone": "9876543210",
                "address": "456 New St",
            },
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["name"] == "New Client"
        assert response.json()["email"] == "new@example.com"
        assert response.json()["phone"] == "9876543210"
        assert response.json()["address"] == "456 New St"
    
    def test_create_client_duplicate_email(self, client: TestClient, user_token, test_client):
        # Create client with existing email
        response = client.post(
            "/api/clients",
            json={
                "name": "Duplicate Client",
                "email": test_client.email,  # Same email as test_client
                "phone": "9876543210",
            },
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 400
    
    def test_get_client_by_id(self, client: TestClient, user_token, test_client):
        # Get client by ID
        response = client.get(
            f"/api/clients/{test_client.id}",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["id"] == test_client.id
        assert response.json()["name"] == test_client.name
        assert "documents_count" in response.json()
    
    def test_get_client_by_id_not_found(self, client: TestClient, user_token):
        # Get non-existent client
        response = client.get(
            "/api/clients/999",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 404
    
    def test_update_client(self, client: TestClient, user_token, test_client):
        # Update client
        response = client.put(
            f"/api/clients/{test_client.id}",
            json={
                "name": "Updated Client",
                "phone": "5555555555",
            },
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["id"] == test_client.id
        assert response.json()["name"] == "Updated Client"
        assert response.json()["phone"] == "5555555555"
        assert response.json()["email"] == test_client.email  # Email should not change
    
    def test_delete_client(self, client: TestClient, user_token, test_client):
        # Delete client
        response = client.delete(
            f"/api/clients/{test_client.id}",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["id"] == test_client.id
        
        # Check if client was deleted
        response = client.get(
            f"/api/clients/{test_client.id}",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        assert response.status_code == 404
    
    def test_get_client_documents(self, client: TestClient, user_token, test_client, test_document):
        # Get client documents
        response = client.get(
            f"/api/clients/{test_client.id}/documents",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == test_document.id
        assert response.json()[0]["title"] == test_document.title
        assert response.json()[0]["client_name"] == test_client.name
    
    def test_search_clients(self, client: TestClient, user_token, test_client):
        # Search clients
        response = client.get(
            "/api/clients/search?q=Test",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == test_client.id
        assert response.json()[0]["name"] == test_client.name
        
        # Search with no results
        response = client.get(
            "/api/clients/search?q=NonExistent",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        assert response.status_code == 200
        assert len(response.json()) == 0