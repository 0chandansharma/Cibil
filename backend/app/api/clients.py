from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.api import deps
from app.db.models import Client, Document, User
from app.schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate, ClientWithDocumentCount
from app.schemas.document import DocumentWithClientName

router = APIRouter()

@router.get("", response_model=List[ClientWithDocumentCount])
def get_clients(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
    search: str = "",
) -> Any:
    """
    Retrieve clients with pagination and search
    """
    query = db.query(Client).filter(Client.ca_id == current_user.id)
    
    if search:
        query = query.filter(
            (Client.name.ilike(f"%{search}%")) |
            (Client.email.ilike(f"%{search}%")) |
            (Client.phone.ilike(f"%{search}%"))
        )
    
    clients = query.order_by(Client.name).offset(skip).limit(limit).all()
    
    # Add document count to each client
    result = []
    for client in clients:
        client_dict = ClientSchema.from_orm(client).dict()
        document_count = db.query(func.count(Document.id)).filter(Document.client_id == client.id).scalar()
        client_dict["documents_count"] = document_count
        result.append(client_dict)
    
    return result

@router.post("", response_model=ClientSchema)
def create_client(
    *,
    db: Session = Depends(deps.get_db),
    client_in: ClientCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new client
    """
    # Check if client with this email already exists for this CA
    if client_in.email:
        client = db.query(Client).filter(
            Client.email == client_in.email, Client.ca_id == current_user.id
        ).first()
        if client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client with this email already exists",
            )
    
    # Create new client
    db_client = Client(
        name=client_in.name,
        email=client_in.email,
        phone=client_in.phone,
        address=client_in.address,
        ca_id=current_user.id,
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    return db_client

@router.get("/{client_id}", response_model=ClientWithDocumentCount)
def get_client(
    *,
    db: Session = Depends(deps.get_db),
    client_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get client by ID
    """
    client = db.query(Client).filter(
        Client.id == client_id, Client.ca_id == current_user.id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    # Add document count to client
    client_dict = ClientSchema.from_orm(client).dict()
    document_count = db.query(func.count(Document.id)).filter(Document.client_id == client.id).scalar()
    client_dict["documents_count"] = document_count
    
    return client_dict

@router.put("/{client_id}", response_model=ClientSchema)
def update_client(
    *,
    db: Session = Depends(deps.get_db),
    client_id: int,
    client_in: ClientUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a client
    """
    client = db.query(Client).filter(
        Client.id == client_id, Client.ca_id == current_user.id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    # Check if email is taken by another client
    if client_in.email and client_in.email != client.email:
        existing_client = db.query(Client).filter(
            Client.email == client_in.email, Client.ca_id == current_user.id, Client.id != client_id
        ).first()
        if existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered for another client",
            )
    
    # Update client
    for field, value in client_in.dict(exclude_unset=True).items():
        setattr(client, field, value)
    
    db.add(client)
    db.commit()
    db.refresh(client)
    
    return client

@router.delete("/{client_id}", response_model=ClientSchema)
def delete_client(
    *,
    db: Session = Depends(deps.get_db),
    client_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a client
    """
    client = db.query(Client).filter(
        Client.id == client_id, Client.ca_id == current_user.id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    db.delete(client)
    db.commit()
    
    return client

@router.get("/{client_id}/documents", response_model=List[DocumentWithClientName])
def get_client_documents(
    *,
    db: Session = Depends(deps.get_db),
    client_id: int,
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get documents for a specific client
    """
    # Check if client exists and belongs to current user
    client = db.query(Client).filter(
        Client.id == client_id, Client.ca_id == current_user.id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    # Get documents
    documents = db.query(Document).filter(
        Document.client_id == client_id, Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add client_name to each document
    result = []
    for doc in documents:
        doc_dict = DocumentWithClientName.from_orm(doc).dict()
        doc_dict["client_name"] = client.name
        result.append(doc_dict)
    
    return result

@router.get("/search", response_model=List[ClientWithDocumentCount])
def search_clients(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    q: str = Query(..., min_length=1),
) -> Any:
    """
    Search for clients
    """
    clients = db.query(Client).filter(
        Client.ca_id == current_user.id,
        (Client.name.ilike(f"%{q}%")) | 
        (Client.email.ilike(f"%{q}%")) | 
        (Client.phone.ilike(f"%{q}%"))
    ).all()
    
    # Add document count to each client
    result = []
    for client in clients:
        client_dict = ClientSchema.from_orm(client).dict()
        document_count = db.query(func.count(Document.id)).filter(Document.client_id == client.id).scalar()
        client_dict["documents_count"] = document_count
        result.append(client_dict)
    
    return result