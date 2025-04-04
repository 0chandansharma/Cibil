import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models import User, Document, DocumentStatus, Analysis, ExtractedData, OCRResult
from app.core.security import get_password_hash, create_access_token

class TestAnalysisAPI:
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
    def test_document_with_analysis(self, db: Session, user_token):
        # Create a test document
        document = Document(
            title="Test Document",
            file_path="/path/to/test.pdf",
            file_type="application/pdf",
            status=DocumentStatus.COMPLETED,
            user_id=user_token["user"].id,
        )
        db.add(document)
        db.commit()
        
        # Create analysis, extracted data, and OCR result
        analysis = Analysis(
            document_id=document.id,
            cibil_score=750.0,
            summary="Test summary",
        )
        db.add(analysis)
        
        extracted_data = ExtractedData(
            document_id=document.id,
            table_data={"tables": [
                {
                    "id": 1,
                    "title": "Test Table",
                    "headers": ["Col1", "Col2"],
                    "rows": [["A", "B"], ["C", "D"]],
                }
            ]},
            json_data={
                "income": 5000000,
                "expenses": 4000000,
                "assets": 8000000,
                "liabilities": 3000000,
            },
        )
        db.add(extracted_data)
        
        ocr_result = OCRResult(
            document_id=document.id,
            text="Test OCR text",
            confidence=0.95,
        )
        db.add(ocr_result)
        db.commit()
        
        return document
    
    def test_get_analysis_results(self, client: TestClient, user_token, test_document_with_analysis):
        # Get analysis results
        response = client.get(
            f"/api/analysis/{test_document_with_analysis.id}",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "analysis" in response.json()
        assert "extractedData" in response.json()
        assert "tableData" in response.json()
        assert "ocrText" in response.json()
        assert "confidence" in response.json()
        assert response.json()["analysis"]["cibilScore"] == 750.0
    
    def test_get_analysis_results_not_found(self, client: TestClient, user_token):
        # Get analysis results for non-existent document
        response = client.get(
            "/api/analysis/999",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 404
    
    def test_get_cibil_score(self, client: TestClient, user_token, test_document_with_analysis):
        # Get CIBIL score
        response = client.get(
            f"/api/analysis/{test_document_with_analysis.id}/cibil",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "score" in response.json()
        assert "extractedData" in response.json()
        assert response.json()["score"] == 750
        assert response.json()["extractedData"]["income"] == 5000000
    
    def test_update_cibil_data(self, client: TestClient, user_token, test_document_with_analysis):
        # Update CIBIL data
        response = client.put(
            f"/api/analysis/{test_document_with_analysis.id}/cibil",
            json={
                "income": 6000000,
                "expenses": 4500000,
                "assets": 9000000,
                "liabilities": 3500000,
            },
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "score" in response.json()
        assert "extractedData" in response.json()
        assert response.json()["extractedData"]["income"] == 6000000
    
    def test_get_document_summary(self, client: TestClient, user_token, test_document_with_analysis):
        # Get document summary
        response = client.get(
            f"/api/analysis/{test_document_with_analysis.id}/summary",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "title" in response.json()
        assert "overview" in response.json()
        assert "keyFindings" in response.json()
        assert "financialHighlights" in response.json()
    
    def test_get_extracted_tables(self, client: TestClient, user_token, test_document_with_analysis):
        # Get extracted tables
        response = client.get(
            f"/api/analysis/{test_document_with_analysis.id}/tables",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert len(response.json()) > 0
        assert "id" in response.json()[0]
        assert "title" in response.json()[0]
        assert "headers" in response.json()[0]
        assert "rows" in response.json()[0]
    
    def test_get_ocr_text(self, client: TestClient, user_token, test_document_with_analysis):
        # Get OCR text
        response = client.get(
            f"/api/analysis/{test_document_with_analysis.id}/ocr",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "text" in response.json()
        assert "confidence" in response.json()
        assert response.json()["text"] == "Test OCR text"
        assert response.json()["confidence"] == 0.95
    
    @patch('app.services.ai_service.get_chat_response')
    async def test_chat_with_document(self, mock_chat, client: TestClient, user_token, test_document_with_analysis):
        # Mock chat response
        mock_chat.return_value = "This is a test response from the AI."
        
        # Chat with document
        response = client.post(
            f"/api/analysis/{test_document_with_analysis.id}/chat",
            json={"message": "What is the revenue?"},
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert "message" in response.json()
        assert response.json()["message"] == "This is a test response from the AI."
    
    @patch('app.services.analysis_service.generate_report')
    def test_download_analysis_report(self, mock_report, client: TestClient, user_token, test_document_with_analysis):
        # Mock report generation
        mock_report.return_value = b"%PDF-1.5\nTest PDF content"
        
        # Download report
        response = client.get(
            f"/api/analysis/{test_document_with_analysis.id}/download",
            headers={"Authorization": f"Bearer {user_token['token']}"},
        )
        
        # Check response
        assert response.status_code == 200
        assert response.headers["Content-Type"] == "application/pdf"
        assert response.headers["Content-Disposition"].startswith("attachment; filename=analysis-report")
        assert response.content.startswith(b"%PDF-1.5")