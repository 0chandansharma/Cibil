from typing import Optional
from pydantic import BaseModel, EmailStr

class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(ClientBase):
    name: Optional[str] = None

class ClientInDBBase(ClientBase):
    id: int
    ca_id: int
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True

class Client(ClientInDBBase):
    pass

class ClientWithDocumentCount(Client):
    documents_count: int