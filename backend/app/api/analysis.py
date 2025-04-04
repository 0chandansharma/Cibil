from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.api import deps
from app.db.models import Document, DocumentStatus, User, Analysis, ExtractedData, OCRResult
from app.schemas.analysis import (
    CibilInput, CibilScore, TableData, ChatMessage, ChatResponse
)
from app.services import analysis_service, ai_service

router = APIRouter()

@router.get("/{document_id}", response_model=Dict[str, Any])
def get_analysis_results(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get analysis results for a document
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    if document.status != DocumentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has not been processed yet",
        )
    
    # Get analysis, extracted data, and OCR results
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    ocr_result = db.query(OCRResult).filter(OCRResult.document_id == document_id).first()
    
    if not analysis or not extracted_data or not ocr_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis results not found",
        )
    
    return {
        "analysis": {
            "cibilScore": analysis.cibil_score,
            "summary": analysis.summary,
        },
        "extractedData": extracted_data.json_data,
        "tableData": extracted_data.table_data,
        "ocrText": ocr_result.text,
        "confidence": ocr_result.confidence,
    }

@router.get("/{document_id}/cibil", response_model=CibilScore)
def get_cibil_score(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get CIBIL score for a document
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get analysis and extracted data
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    
    if not analysis or not extracted_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CIBIL data not found",
        )
    
    # Extract financial data
    financial_data = extracted_data.json_data
    
    # If no financial data is available, provide default values
    if not financial_data or not isinstance(financial_data, dict):
        financial_data = {
            "income": 0,
            "expenses": 0,
            "assets": 0,
            "liabilities": 0,
        }
    
    return {
        "score": int(analysis.cibil_score) if analysis.cibil_score else 0,
        "extractedData": financial_data,
    }

@router.put("/{document_id}/cibil", response_model=CibilScore)
def update_cibil_data(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
    cibil_input: CibilInput,
) -> Any:
    """
    Update CIBIL data and recalculate score
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get analysis and extracted data
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    
    if not analysis or not extracted_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis data not found",
        )
    
    # Update extracted data with new values
    financial_data = {
        "income": cibil_input.income,
        "expenses": cibil_input.expenses,
        "assets": cibil_input.assets,
        "liabilities": cibil_input.liabilities,
    }
    
    # Update or create json_data
    if not extracted_data.json_data:
        extracted_data.json_data = {}
    
    extracted_data.json_data.update(financial_data)
    
    # Calculate new CIBIL score
    new_score = analysis_service.calculate_cibil_score(financial_data)
    analysis.cibil_score = new_score
    
    # Save changes
    db.add(extracted_data)
    db.add(analysis)
    db.commit()
    
    return {
        "score": int(new_score),
        "extractedData": financial_data,
    }

@router.get("/{document_id}/summary", response_model=Dict[str, Any])
def get_document_summary(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get document summary
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get analysis and extracted data
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    
    if not analysis or not extracted_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found",
        )
    
    # Get financial highlights from extracted data
    financial_highlights = extracted_data.json_data or {}
    
    # Create a summary response
    summary_data = {
        "title": document.title,
        "date": document.created_at.strftime("%Y-%m-%d"),
        "overview": analysis.summary,
        "keyFindings": analysis_service.extract_key_findings(analysis.summary),
        "financialHighlights": {
            "revenue": financial_highlights.get("income", 0),
            "expenses": financial_highlights.get("expenses", 0),
            "profit": financial_highlights.get("income", 0) - financial_highlights.get("expenses", 0),
            "assets": financial_highlights.get("assets", 0),
            "liabilities": financial_highlights.get("liabilities", 0),
            "equity": financial_highlights.get("assets", 0) - financial_highlights.get("liabilities", 0),
        }
    }
    
    return summary_data

@router.get("/{document_id}/tables", response_model=List[TableData])
def get_extracted_tables(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get tables extracted from document
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get extracted data
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    
    if not extracted_data or not extracted_data.table_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tables found in document",
        )
    
    # Return tables
    tables = extracted_data.table_data.get("tables", [])
    
    # If tables is not a list or is empty, return mock data
    if not isinstance(tables, list) or not tables:
        # Mock data for demonstration
        tables = [
            {
                "id": 1,
                "title": "Income Statement",
                "headers": ["Item", "2022", "2021", "Change %"],
                "rows": [
                    ["Revenue", "5,000,000", "4,300,000", "16.3%"],
                    ["Cost of Goods Sold", "3,000,000", "2,700,000", "11.1%"],
                    ["Gross Profit", "2,000,000", "1,600,000", "25.0%"],
                    ["Operating Expenses", "1,000,000", "900,000", "11.1%"],
                    ["Net Profit", "1,000,000", "700,000", "42.9%"],
                ],
            },
            {
                "id": 2,
                "title": "Balance Sheet",
                "headers": ["Item", "2022", "2021", "Change %"],
                "rows": [
                    ["Current Assets", "3,000,000", "2,500,000", "20.0%"],
                    ["Non-Current Assets", "5,000,000", "4,800,000", "4.2%"],
                    ["Total Assets", "8,000,000", "7,300,000", "9.6%"],
                    ["Current Liabilities", "1,200,000", "1,100,000", "9.1%"],
                    ["Non-Current Liabilities", "1,800,000", "2,000,000", "-10.0%"],
                    ["Total Liabilities", "3,000,000", "3,100,000", "-3.2%"],
                    ["Equity", "5,000,000", "4,200,000", "19.0%"],
                ],
            },
        ]
    
    return tables

@router.get("/{document_id}/ocr", response_model=Dict[str, Any])
def get_ocr_text(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get raw OCR text from document
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get OCR result
    ocr_result = db.query(OCRResult).filter(OCRResult.document_id == document_id).first()
    
    if not ocr_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OCR result not found",
        )
    
    return {
        "text": ocr_result.text,
        "confidence": ocr_result.confidence,
    }

@router.post("/{document_id}/chat", response_model=ChatResponse)
async def chat_with_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
    message: ChatMessage,
) -> Any:
    """
    Chat with document using AI
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Get OCR result and extracted data
    ocr_result = db.query(OCRResult).filter(OCRResult.document_id == document_id).first()
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    
    if not ocr_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document content not found",
        )
    
    try:
        # Get AI response
        response = await ai_service.get_chat_response(
            document_text=ocr_result.text,
            extracted_data=extracted_data.json_data if extracted_data and extracted_data.json_data else {},
            user_message=message.message
        )
        
        return {"message": response}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}",
        )

@router.get("/{document_id}/download")
def download_analysis_report(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
    format: str = "pdf",
) -> Any:
    """
    Download analysis report
    """
    # Check if document exists and belongs to current user
    document = db.query(Document).filter(
        Document.id == document_id, Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    # Check if document has been processed
    if document.status != DocumentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has not been processed yet",
        )
    
    try:
        # Generate report
        report_content = analysis_service.generate_report(db, document_id, format)
        
        # Set content type based on format
        content_type = "application/pdf" if format == "pdf" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        # Return report as downloadable file
        return Response(
            content=report_content,
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename=analysis-report-{document_id}.{format}"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating report: {str(e)}",
        )