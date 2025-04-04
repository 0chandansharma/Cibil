import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.session import Base
from app.db.models import User, Client, Document, Analysis, ExtractedData, OCRResult, UserRole
from app.core.security import get_password_hash

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db():
    # Create the database engine
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        
    # Drop all tables after the test
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user(db):
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
    db.refresh(user)
    return user

@pytest.fixture
def test_client(db, test_user):
    # Create a test client
    client = Client(
        name="Test Client",
        email="client@example.com",
        phone="1234567890",
        ca_id=test_user.id,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@pytest.fixture
def test_document(db, test_user, test_client):
    # Create a test document
    document = Document(
        title="Test Document",
        file_path="/path/to/test.pdf",
        file_type="application/pdf",
        status="uploaded",
        client_id=test_client.id,
        user_id=test_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@pytest.fixture
def test_analysis(db, test_document):
    # Create test analysis
    analysis = Analysis(
        document_id=test_document.id,
        cibil_score=750.0,
        summary="Test summary",
    )
    db.add(analysis)
    
    extracted_data = ExtractedData(
        document_id=test_document.id,
        table_data={"tables": []},
        json_data={"income": 5000000},
    )
    db.add(extracted_data)
    
    ocr_result = OCRResult(
        document_id=test_document.id,
        text="Test OCR text",
        confidence=0.95,
    )
    db.add(ocr_result)
    
    db.commit()
    return analysis