import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.models import User, Client, Document, Analysis, ExtractedData, OCRResult, UserRole, DocumentStatus
from app.core.security import get_password_hash

class TestUserModel:
    def test_create_user(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CA,
            first_name="Test",
            last_name="User",
            is_active=True,
        )
        db.add(user)
        db.commit()
        
        # Query the user
        db_user = db.query(User).filter(User.username == "testuser").first()
        
        # Check if user was created correctly
        assert db_user is not None
        assert db_user.username == "testuser"
        assert db_user.email == "test@example.com"
        assert db_user.role == UserRole.CA
        assert db_user.first_name == "Test"
        assert db_user.last_name == "User"
        assert db_user.is_active == True
    
    def test_user_relationships(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CA,
            is_active=True,
        )
        db.add(user)
        db.commit()
        
        # Create a client for the user
        client = Client(
            name="Test Client",
            email="client@example.com",
            phone="1234567890",
            ca_id=user.id,
        )
        db.add(client)
        
        # Create a document for the user
        document = Document(
            title="Test Document",
            file_path="/path/to/file.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            user_id=user.id,
        )
        db.add(document)
        db.commit()
        
        # Refresh user to load relationships
        db.refresh(user)
        
        # Check relationships
        assert len(user.clients) == 1
        assert user.clients[0].name == "Test Client"
        assert len(user.documents) == 1
        assert user.documents[0].title == "Test Document"

class TestClientModel:
    def test_create_client(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CA,
            is_active=True,
        )
        db.add(user)
        db.commit()
        
        # Create a test client
        client = Client(
            name="Test Client",
            email="client@example.com",
            phone="1234567890",
            address="123 Test St, Test City",
            ca_id=user.id,
        )
        db.add(client)
        db.commit()
        
        # Query the client
        db_client = db.query(Client).filter(Client.name == "Test Client").first()
        
        # Check if client was created correctly
        assert db_client is not None
        assert db_client.name == "Test Client"
        assert db_client.email == "client@example.com"
        assert db_client.phone == "1234567890"
        assert db_client.address == "123 Test St, Test City"
        assert db_client.ca_id == user.id
    
    def test_client_relationships(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CA,
            is_active=True,
        )
        db.add(user)
        db.commit()
        
        # Create a test client
        client = Client(
            name="Test Client",
            email="client@example.com",
            phone="1234567890",
            ca_id=user.id,
        )
        db.add(client)
        db.commit()
        
        # Create a document for the client
        document = Document(
            title="Test Document",
            file_path="/path/to/file.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            client_id=client.id,
            user_id=user.id,
        )
        db.add(document)
        db.commit()
        
        # Refresh client to load relationships
        db.refresh(client)
        
        # Check relationships
        assert client.ca.id == user.id
        assert len(client.documents) == 1
        assert client.documents[0].title == "Test Document"

class TestDocumentModel:
    def test_create_document(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CA,
            is_active=True,
        )
        db.add(user)
        db.commit()
        
        # Create a test document
        document = Document(
            title="Test Document",
            description="A test document",
            file_path="/path/to/file.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            user_id=user.id,
        )
        db.add(document)
        db.commit()
        
        # Query the document
        db_document = db.query(Document).filter(Document.title == "Test Document").first()
        
        # Check if document was created correctly
        assert db_document is not None
        assert db_document.title == "Test Document"
        assert db_document.description == "A test document"
        assert db_document.file_path == "/path/to/file.pdf"
        assert db_document.file_type == "application/pdf"
        assert db_document.status == DocumentStatus.UPLOADED
        assert db_document.user_id == user.id
    
    def test_document_relationships(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CA,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)  # Refresh to ensure we have the ID
        
        # Create a test client with the user ID
        client = Client(
            name="Test Client",
            email="client@example.com",
            phone="1234567890",
            ca_id=user.id,
        )
        db.add(client)
        db.commit()
        db.refresh(client)  # Refresh to ensure we have the client ID
        
        # Create a test document
        document = Document(
            title="Test Document",
            file_path="/path/to/file.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            client_id=client.id,
            user_id=user.id,
        )
        db.add(document)
        db.commit()  # Commit to get the document ID
        db.refresh(document)  # Refresh to ensure we have the document ID
        
        # Now create analysis, extracted data, and OCR result
        analysis = Analysis(
            document_id=document.id,  # Now document.id should be available
            cibil_score=750.0,
            summary="Test summary",
        )
        db.add(analysis)
        
        extracted_data = ExtractedData(
            document_id=document.id,  # Now document.id should be available
            table_data={"tables": []},
            json_data={"income": 5000000},
        )
        db.add(extracted_data)
        
        ocr_result = OCRResult(
            document_id=document.id,  # Now document.id should be available
            text="Test OCR text",
            confidence=0.95,
        )
        db.add(ocr_result)
        
        # Final commit
        db.commit()
        
        # Refresh to load relationships
        db.refresh(document)
        
        # Check relationships
        assert document.user.id == user.id
        assert document.client.id == client.id
        assert document.analysis.cibil_score == 750.0
        assert document.extracted_data.json_data["income"] == 5000000
        assert document.ocr_result.text == "Test OCR text"

class TestAnalysisModel:
    def test_create_analysis(self, db: Session):
        # Create a test user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.CA,
            is_active=True,
        )
        db.add(user)
        db.commit()
        
        # Create a test document
        document = Document(
            title="Test Document",
            file_path="/path/to/file.pdf",
            file_type="application/pdf",
            status=DocumentStatus.UPLOADED,
            user_id=user.id,
        )
        db.add(document)
        db.commit()
        
        # Create a test analysis
        analysis = Analysis(
            document_id=document.id,
            cibil_score=750.0,
            summary="Test summary",
        )
        db.add(analysis)
        db.commit()
        
        # Query the analysis
        db_analysis = db.query(Analysis).filter(Analysis.document_id == document.id).first()
        
        # Check if analysis was created correctly
        assert db_analysis is not None
        assert db_analysis.document_id == document.id
        assert db_analysis.cibil_score == 750.0
        assert db_analysis.summary == "Test summary"