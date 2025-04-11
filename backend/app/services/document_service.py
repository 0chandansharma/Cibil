import os
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Document, Analysis, ExtractedData, OCRResult
from app.services import ocr_service, analysis_service

# Update backend/app/services/document_service.py
from app.tasks.document_processing import process_document as process_document_task

async def process_document(db: Session, document: Document) -> Dict[str, Any]:
    """
    Process a document and extract information
    """
    # Check if file exists
    if not os.path.exists(document.file_path):
        raise FileNotFoundError(f"Document file not found: {document.file_path}")
    
    # Update document status to processing
    document.status = DocumentStatus.PROCESSING
    db.add(document)
    db.commit()
    
    # Launch the processing task asynchronously
    process_document_task.delay(document.id)
    
    # Return initial response
    return {
        "documentId": document.id,
        "status": "processing",
        "message": "Document processing started",
    }
    
# async def process_document(db: Session, document: Document) -> Dict[str, Any]:
#     """
#     Process a document and extract information
#     """
#     # Check if file exists
#     if not os.path.exists(document.file_path):
#         raise FileNotFoundError(f"Document file not found: {document.file_path}")
    
#     # Step 1: Extract text using OCR
#     ocr_result = await ocr_service.extract_text(document.file_path)
    
#     # Step 2: Extract structured data
#     extracted_data = await ocr_service.extract_structured_data(
#         document.file_path, ocr_result["text"]
#     )
    
#     # Step 3: Extract tables
#     tables = await ocr_service.extract_tables(document.file_path)
    
#     # Step 4: Generate summary
#     summary = await analysis_service.generate_summary(ocr_result["text"], extracted_data)
    
#     # Step 5: Calculate CIBIL score
#     cibil_score = analysis_service.calculate_cibil_score(extracted_data)
    
#     # Save OCR result
#     db_ocr_result = OCRResult(
#         document_id=document.id,
#         text=ocr_result["text"],
#         confidence=ocr_result["confidence"],
#     )
#     db.add(db_ocr_result)
    
#     # Save extracted data
#     db_extracted_data = ExtractedData(
#         document_id=document.id,
#         json_data=extracted_data,
#         table_data={"tables": tables},
#     )
#     db.add(db_extracted_data)
    
#     # Save analysis
#     db_analysis = Analysis(
#         document_id=document.id,
#         summary=summary,
#         cibil_score=cibil_score,
#     )
#     db.add(db_analysis)
    
#     db.commit()
    
#     return {
#         "ocr": {
#             "text": ocr_result["text"][:500] + "...",  # Truncated for response
#             "confidence": ocr_result["confidence"],
#         },
#         "extractedData": extracted_data,
#         "tables": tables,
#         "summary": summary,
#         "cibilScore": cibil_score,
#     }

def get_analysis_results(db: Session, document_id: int) -> Dict[str, Any]:
    """
    Get analysis results for a document
    """
    # Get analysis, extracted data, and OCR results
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    ocr_result = db.query(OCRResult).filter(OCRResult.document_id == document_id).first()
    
    if not analysis or not extracted_data or not ocr_result:
        return {}
    
    return {
        "analysis": {
            "cibilScore": analysis.cibil_score,
            "summary": analysis.summary,
        },
        "extractedData": extracted_data.json_data,
        "tableData": extracted_data.table_data,
        "ocrText": ocr_result.text[:500] + "...",  # Truncated for response
        "confidence": ocr_result.confidence,
    }