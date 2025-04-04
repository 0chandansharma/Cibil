import os
import uuid
from datetime import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session, joinedload
from app.api import deps
from app.core.config import settings
from app.db.models import Document, DocumentStatus, User, Client
from app.schemas.document import Document as DocumentSchema, DocumentCreate, DocumentUpdate, DocumentWithClientName
from app.services import document_service

router = APIRouter()

@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    file: UploadFile = File(...),
    title: str = Form(None),
    client_id: Optional[int] = Form(None),
) -> Any:
    """
    Upload a new document
    """
    # Validate file size
    file_size = 0
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024)}MB",
        )
    
    # Validate file type
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and image files (JPG, JPEG, PNG) are allowed",
        )
    
    # Validate client if provided
    if client_id:
        client = db.query(Client).filter(Client.id == client_id, Client.ca_id == current_user.id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found",
            )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}",
        )
    
    # Create document record
    document_in = DocumentCreate(
        title=title or file.filename,
        file_path=file_path,
        file_type=file.content_type,
        client_id=client_id,
    )
    
    # Add document to database
    document = Document(
        title=document_in.title,
        description=document_in.description,
        file_path=document_in.file_path,
        file_type=document_in.file_type,
        status=DocumentStatus.UPLOADED,
        client_id=document_in.client_id,
        user_id=current_user.id,
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document

@router.get("", response_model=List[DocumentWithClientName])
def get_documents(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    client_id: Optional[int] = None,
) -> Any:
    """
    Retrieve documents with optional filters
    """
    query = db.query(Document).filter(Document.user_id == current_user.id)
    
    if status:
        query = query.filter(Document.status == status)
    
    if client_id:
        query = query.filter(Document.client_id == client_id)
    
    # Include client relationship for client name
    query = query.options(joinedload(Document.client))
    
    documents = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add client_name to each document
    result = []
    for doc in documents:
        doc_dict = DocumentSchema.from_orm(doc).dict()
        doc_dict["client_name"] = doc.client.name if doc.client else None
        result.append(doc_dict)
    
    return result

@router.get("/{document_id}", response_model=DocumentWithClientName)
def get_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get document by ID
    """
    document = db.query(Document).options(joinedload(Document.client)).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Add client_name to document
    doc_dict = DocumentSchema.from_orm(document).dict()
    doc_dict["client_name"] = document.client.name if document.client else None
    
    return doc_dict

@router.post("/{document_id}/process", response_model=dict)
async def process_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Process a document
    """
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    if document.status == DocumentStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document is already being processed",
        )
    
    if document.status == DocumentStatus.COMPLETED:
        # Return existing analysis results
        analysis_result = document_service.get_analysis_results(db, document_id)
        return {
            "documentId": document_id,
            "status": "completed",
            "message": "Document has already been processed",
            "results": analysis_result,
        }
    
    # Update status to processing
    document.status = DocumentStatus.PROCESSING
    db.add(document)
    db.commit()
    
    try:
        # Process document asynchronously
        # In a real application, this would be done in a background task
        analysis_result = await document_service.process_document(db, document)
        
        # Update document status
        document.status = DocumentStatus.COMPLETED
        document.processed_at = datetime.utcnow()
        db.add(document)
        db.commit()
        
        return {
            "documentId": document_id,
            "status": "completed",
            "message": "Document processed successfully",
            "results": analysis_result,
        }
    except Exception as e:
        # Update document status to failed
        document.status = DocumentStatus.FAILED
        db.add(document)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}",
        )

@router.get("/{document_id}/status", response_model=dict)
def get_document_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get document processing status
    """
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    return {
        "documentId": document_id,
        "status": document.status,
        "processedAt": document.processed_at,
    }

@router.delete("/{document_id}", response_model=dict)
def delete_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Delete a document
    """
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Delete file
    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Error deleting file: {str(e)}")
    
    # Delete document from database
    db.delete(document)
    db.commit()
    
    return {
        "documentId": document_id,
        "message": "Document deleted successfully",
    }