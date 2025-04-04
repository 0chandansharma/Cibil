from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class AnalysisBase(BaseModel):
    document_id: int
    cibil_score: Optional[float] = None
    summary: Optional[str] = None

class AnalysisCreate(AnalysisBase):
    pass

class AnalysisUpdate(BaseModel):
    cibil_score: Optional[float] = None
    summary: Optional[str] = None

class AnalysisInDBBase(AnalysisBase):
    id: int
    created_at: str

    class Config:
        orm_mode = True

class Analysis(AnalysisInDBBase):
    pass

class ExtractedDataBase(BaseModel):
    document_id: int
    table_data: Optional[Dict[str, Any]] = None
    json_data: Optional[Dict[str, Any]] = None

class ExtractedDataCreate(ExtractedDataBase):
    pass

class ExtractedDataUpdate(BaseModel):
    table_data: Optional[Dict[str, Any]] = None
    json_data: Optional[Dict[str, Any]] = None

class ExtractedDataInDBBase(ExtractedDataBase):
    id: int
    created_at: str

    class Config:
        orm_mode = True

class ExtractedData(ExtractedDataInDBBase):
    pass

class OCRResultBase(BaseModel):
    document_id: int
    text: Optional[str] = None
    confidence: Optional[float] = None

class OCRResultCreate(OCRResultBase):
    pass

class OCRResultUpdate(BaseModel):
    text: Optional[str] = None
    confidence: Optional[float] = None

class OCRResultInDBBase(OCRResultBase):
    id: int
    created_at: str

    class Config:
        orm_mode = True

class OCRResult(OCRResultInDBBase):
    pass

class CibilInput(BaseModel):
    income: float
    expenses: float
    assets: float
    liabilities: float

class CibilScore(BaseModel):
    score: int
    extractedData: Dict[str, Any]

class TableData(BaseModel):
    id: int
    title: str
    headers: List[str]
    rows: List[List[str]]

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str