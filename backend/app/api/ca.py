# Add this to your backend/app/api/ca.py file
# If this file doesn't exist, create it and include it in your main.py router setup

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.db.models import User, Document, Client

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_ca_dashboard(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get CA dashboard data
    """
    # Get total clients for the current CA
    total_clients = db.query(Client).filter(Client.ca_id == current_user.id).count()
    
    # Get total and processed documents
    total_documents = db.query(Document).filter(Document.user_id == current_user.id).count()
    processed_documents = db.query(Document).filter(
        Document.user_id == current_user.id, 
        Document.status == "completed"
    ).count()
    
    # Get recent documents
    recent_documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).limit(5).all()
    
    # Get recent clients
    recent_clients = db.query(Client).filter(
        Client.ca_id == current_user.id
    ).order_by(Client.created_at.desc()).limit(5).all()
    
    # Format document data for response
    formatted_documents = []
    for doc in recent_documents:
        client_name = None
        if doc.client_id:
            client = db.query(Client).filter(Client.id == doc.client_id).first()
            if client:
                client_name = client.name
                
        formatted_documents.append({
            "id": doc.id,
            "title": doc.title,
            "status": doc.status,
            "createdAt": doc.created_at.isoformat(),
            "clientName": client_name
        })
    
    # Format client data for response
    formatted_clients = []
    for client in recent_clients:
        doc_count = db.query(Document).filter(
            Document.client_id == client.id
        ).count()
        
        formatted_clients.append({
            "id": client.id,
            "name": client.name,
            "email": client.email,
            "documentsCount": doc_count
        })
    
    return {
        "totalClients": total_clients,
        "totalDocuments": total_documents,
        "processedDocuments": processed_documents,
        "recentDocuments": formatted_documents,
        "recentClients": formatted_clients
    }