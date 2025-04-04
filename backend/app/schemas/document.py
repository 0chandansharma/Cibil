from pydantic import BaseModel
from app.db.models import DocumentStatus
from typing import Optional, Union
from datetime import datetime

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    client_id: Optional[int] = None

class DocumentCreate(DocumentBase):
    file_path: str
    file_type: str

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DocumentStatus] = None
    client_id: Optional[int] = None

class DocumentInDBBase(DocumentBase):
    id: int
    file_path: str
    file_type: str
    status: DocumentStatus
    user_id: int
    created_at: Union[str, datetime]
    processed_at: Optional[Union[str, datetime]] = None

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }

class Document(DocumentInDBBase):
    pass

class DocumentWithClientName(Document):
    client_name: Optional[str] = None