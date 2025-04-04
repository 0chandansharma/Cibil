import pytest
import os
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from app.db.models import User, Document, DocumentStatus, Analysis, ExtractedData, OCRResult
from app.core.security import get_password_hash
from app.services import document_service

class TestDocumentService:
    @pytest.fixture
    def setup_test_data(self, db: Session):
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
        
        # Create a test document
        document = Document(
            title="Test Document",
            file_path="/path/to/test.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            user_id=user.id,
        )
        db.add(document)
        db.commit()
        
        return {"user": user, "document": document}
    
    @patch('app.services.ocr_service.extract_text')
    @patch('app.services.ocr_service.extract_structured_data')
    @patch('app.services.ocr_service.extract_tables')
    @patch('app.services.analysis_service.generate_summary')
    @patch('app.services.analysis_service.calculate_cibil_score')
    @patch('os.path.exists')
    async def test_process_document(
        self, 
        mock_exists, 
        mock_calculate_cibil, 
        mock_generate_summary,
        mock_extract_tables,
        mock_extract_structured_data,
        mock_extract_text,
        db: Session,
        setup_test_data
    ):
        # Mock return values
        mock_exists.return_value = True
        mock_extract_text.return_value = {"text": "Test OCR text", "confidence": 0.95}
        mock_extract_structured_data.return_value = {"income": 5000000, "expenses": 4000000}
        mock_extract_tables.return_value = [{"id": 1, "title": "Test Table", "headers": [], "rows": []}]
        mock_generate_summary.return_value = "Test summary"
        mock_calculate_cibil.return_value = 750.0
        
        document = setup_test_data["document"]
        
        # Process the document
        result = await document_service.process_document(db, document)
        
        # Check if the document status was updated
        db_document = db.query(Document).filter(Document.id == document.id).first()
        assert db_document.status == DocumentStatus.PROCESSING  # Status is set to PROCESSING in the controller
        
        # Check if analysis, extracted data, and OCR result were created
        analysis = db.query(Analysis).filter(Analysis.document_id == document.id).first()
        extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document.id).first()
        ocr_result = db.query(OCRResult).filter(OCRResult.document_id == document.id).first()
        
        assert analysis is not None
        assert analysis.cibil_score == 750.0
        assert analysis.summary == "Test summary"
        
        assert extracted_data is not None
        assert extracted_data.json_data == {"income": 5000000, "expenses": 4000000}
        assert extracted_data.table_data == {"tables": [{"id": 1, "title": "Test Table", "headers": [], "rows": []}]}
        
        assert ocr_result is not None
        assert ocr_result.text == "Test OCR text"
        assert ocr_result.confidence == 0.95
        
        # Check the result
        assert "ocr" in result
        assert "extractedData" in result
        assert "tables" in result
        assert "summary" in result
        assert "cibilScore" in result
    
    @patch('os.path.exists')
    async def test_process_document_file_not_found(self, mock_exists, db: Session, setup_test_data):
        # Mock return values
        mock_exists.return_value = False
        
        document = setup_test_data["document"]
        
        # Process the document should raise FileNotFoundError
        with pytest.raises(FileNotFoundError):
            await document_service.process_document(db, document)
    
    def test_get_analysis_results(self, db: Session, setup_test_data):
        document = setup_test_data["document"]
        
        # Create analysis, extracted data, and OCR result
        analysis = Analysis(
            document_id=document.id,
            cibil_score=750.0,
            summary="Test summary",
        )
        db.add(analysis)
        
        extracted_data = ExtractedData(
            document_id=document.id,
            table_data={"tables": []},
            json_data={"income": 5000000},
        )
        db.add(extracted_data)
        
        ocr_result = OCRResult(
            document_id=document.id,
            text="Test OCR text",
            confidence=0.95,
        )
        db.add(ocr_result)
        db.commit()
        
        # Get analysis results
        results = document_service.get_analysis_results(db, document.id)
        
        # Check results
        assert "analysis" in results
        assert results["analysis"]["cibilScore"] == 750.0
        assert results["analysis"]["summary"] == "Test summary"
        
        assert "extractedData" in results
        assert results["extractedData"] == {"income": 5000000}
        
        assert "tableData" in results
        assert results["tableData"] == {"tables": []}
        
        assert "ocrText" in results
        assert "confidence" in results
        assert results["confidence"] == 0.95
    
    def test_get_analysis_results_not_found(self, db: Session, setup_test_data):
        document = setup_test_data["document"]
        
        # Get analysis results for document without analysis
        results = document_service.get_analysis_results(db, document.id)
        
        # Results should be empty
        assert results == {}