import pytest
import io
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models import User, Document, DocumentStatus
from app.core.security import get_password_hash, create_access_token

class TestDocumentsAPI:
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
    def test_document(self, db: Session, user_token):
        # Create a test document
        document = Document(
            title="Test Document",
            file_path="/path/to/test.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            user_id=user_token["user"].id,
        )
        db.add(document)
        db.commit()
        
        return document
    
    @patch('os.path.getsize')
    @patch('builtins.open')
    def test_upload_document(self, mock_open, mock_getsize, client: TestClient, user_token):
        # Mock file size
        mock_getsize.return_value = 1024  # 1KB
        
        # Create test file
        test_file = io.BytesIO(b"test file content")
        test_file.name = "test.pdf"
        
        # Upload document
        response = client.post(
            "/api/documents/upload",
            files={"file": ("test.pdf", test_file, "application/pdf")},
            data={"title": "Test Document"},
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["title"] == "Test Document"
        assert response.json()["status"] == "uploaded"
    
    def test_get_documents(self, client: TestClient, user_token, test_document):
        # Get documents
        response = client.get(
            "/api/documents",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == test_document.id
        assert response.json()[0]["title"] == test_document.title
    
    def test_get_document_by_id(self, client: TestClient, user_token, test_document):
        # Get document by ID
        response = client.get(
            f"/api/documents/{test_document.id}",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["id"] == test_document.id
        assert response.json()["title"] == test_document.title
    
    def test_get_document_by_id_not_found(self, client: TestClient, user_token):
        # Get non-existent document
        response = client.get(
            "/api/documents/999",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 404
    
    @patch('app.services.document_service.process_document')
    def test_process_document(self, mock_process, client: TestClient, user_token, test_document, db: Session):
        # Mock process_document
        mock_process.return_value = {
            "ocr": {"text": "Test OCR text", "confidence": 0.95},
            "extractedData": {"income": 5000000},
            "tables": [],
            "summary": "Test summary",
            "cibilScore": 750.0,
        }
        
        # Process document
        response = client.post(
            f"/api/documents/{test_document.id}/process",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["documentId"] == test_document.id
        assert response.json()["status"] == "completed"
        assert "results" in response.json()
    
    def test_process_document_not_found(self, client: TestClient, user_token):
        # Process non-existent document
        response = client.post(
            "/api/documents/999/process",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 404
    
    def test_get_document_status(self, client: TestClient, user_token, test_document):
        # Get document status
        response = client.get(
            f"/api/documents/{test_document.id}/status",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["documentId"] == test_document.id
        assert response.json()["status"] == test_document.status
    
    @patch('os.path.exists')
    @patch('os.remove')
    def test_delete_document(self, mock_remove, mock_exists, client: TestClient, user_token, test_document):
        # Mock file exists
        mock_exists.return_value = True
        
        # Delete document
        response = client.delete(
            f"/api/documents/{test_document.id}",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.json()["documentId"] == test_document.id
        assert response.json()["message"] == "Document deleted successfully"
        
        # Check if document was deleted from database
        response = client.get(
            f"/api/documents/{test_document.id}",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        assert response.status_code == 404