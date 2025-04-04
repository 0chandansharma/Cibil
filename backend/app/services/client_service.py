from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.db.models import Client, Document, User

def get_client_with_document_count(db: Session, client_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    """
    Get client with document count
    """
    client = db.query(Client).filter(Client.id == client_id, Client.ca_id == user_id).first()
    
    if not client:
        return None
    
    # Get document count
    document_count = db.query(func.count(Document.id)).filter(Document.client_id == client_id).scalar()
    
    # Convert client to dict and add document count
    client_dict = {
        "id": client.id,
        "name": client.name,
        "email": client.email,
        "phone": client.phone,
        "address": client.address,
        "ca_id": client.ca_id,
        "created_at": client.created_at,
        "updated_at": client.updated_at,
        "documents_count": document_count,
    }
    
    return client_dict

def get_clients_with_document_count(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get clients with document count
    """
    clients = db.query(Client).filter(Client.ca_id == user_id).order_by(Client.name).offset(skip).limit(limit).all()
    
    result = []
    for client in clients:
        # Get document count for each client
        document_count = db.query(func.count(Document.id)).filter(Document.client_id == client.id).scalar()
        
        # Convert client to dict and add document count
        client_dict = {
            "id": client.id,
            "name": client.name,
            "email": client.email,
            "phone": client.phone,
            "address": client.address,
            "ca_id": client.ca_id,
            "created_at": client.created_at,
            "updated_at": client.updated_at,
            "documents_count": document_count,
        }
        
        result.append(client_dict)
    
    return result

def search_clients(db: Session, user_id: int, search_term: str) -> List[Dict[str, Any]]:
    """
    Search clients by name, email, or phone
    """
    clients = db.query(Client).filter(
        Client.ca_id == user_id,
        (Client.name.ilike(f"%{search_term}%")) | 
        (Client.email.ilike(f"%{search_term}%")) | 
        (Client.phone.ilike(f"%{search_term}%"))
    ).all()
    
    result = []
    for client in clients:
        # Get document count for each client
        document_count = db.query(func.count(Document.id)).filter(Document.client_id == client.id).scalar()
        
        # Convert client to dict and add document count
        client_dict = {
            "id": client.id,
            "name": client.name,
            "email": client.email,
            "phone": client.phone,
            "address": client.address,
            "ca_id": client.ca_id,
            "created_at": client.created_at,
            "updated_at": client.updated_at,
            "documents_count": document_count,
        }
        
        result.append(client_dict)
    
    return result

def get_client_documents(db: Session, client_id: int, user_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get documents for a specific client
    """
    # Check if client exists and belongs to user
    client = db.query(Client).filter(Client.id == client_id, Client.ca_id == user_id).first()
    
    if not client:
        return []
    
    # Get documents
    documents = db.query(Document).filter(
        Document.client_id == client_id, Document.user_id == user_id
    ).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert documents to dicts and add client name
    result = []
    for doc in documents:
        doc_dict = {
            "id": doc.id,
            "title": doc.title,
            "description": doc.description,
            "file_path": doc.file_path,
            "file_type": doc.file_type,
            "status": doc.status,
            "client_id": doc.client_id,
            "user_id": doc.user_id,
            "created_at": doc.created_at,
            "processed_at": doc.processed_at,
            "client_name": client.name,
        }
        
        result.append(doc_dict)
    
    return result