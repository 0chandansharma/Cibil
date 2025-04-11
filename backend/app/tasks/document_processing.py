# backend/app/tasks/document_processing.py
import os
from celery import Task
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.db.models import Document, DocumentStatus, Analysis, ExtractedData, OCRResult
from app.services import ocr_service, analysis_service
from datetime import datetime

class DocumentProcessingTask(Task):
    """Base task for document processing with error handling"""
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        # Get document_id from the first argument
        document_id = args[0]
        
        # Update document status to FAILED in the database
        db = SessionLocal()
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = DocumentStatus.FAILED
                db.add(document)
                db.commit()
        finally:
            db.close()
        
        super().on_failure(exc, task_id, args, kwargs, einfo)

@celery_app.task(base=DocumentProcessingTask, bind=True, name="app.tasks.document_processing.process_document")
def process_document(self, document_id: int):
    """Process a document asynchronously"""
    db = SessionLocal()
    
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise ValueError(f"Document with ID {document_id} not found")
        
        # Update status to processing
        document.status = DocumentStatus.PROCESSING
        db.add(document)
        db.commit()
        
        # Check if file exists
        if not os.path.exists(document.file_path):
            raise FileNotFoundError(f"Document file not found: {document.file_path}")
        
        # Step 1: Extract text using OCR
        ocr_result = ocr_service.extract_text(document.file_path)
        
        # Step 2: Extract structured data
        extracted_data = ocr_service.extract_structured_data(
            document.file_path, ocr_result["text"]
        )
        
        # Step 3: Extract tables
        tables = ocr_service.extract_tables(document.file_path)
        
        # Step 4: Generate summary
        summary = analysis_service.generate_summary(ocr_result["text"], extracted_data)
        
        # Step 5: Calculate CIBIL score
        cibil_score = analysis_service.calculate_cibil_score(extracted_data)
        
        # Save OCR result
        db_ocr_result = OCRResult(
            document_id=document.id,
            text=ocr_result["text"],
            confidence=ocr_result["confidence"],
        )
        db.add(db_ocr_result)
        
        # Save extracted data
        db_extracted_data = ExtractedData(
            document_id=document.id,
            json_data=extracted_data,
            table_data={"tables": tables},
        )
        db.add(db_extracted_data)
        
        # Save analysis
        db_analysis = Analysis(
            document_id=document.id,
            summary=summary,
            cibil_score=cibil_score,
        )
        db.add(db_analysis)
        
        # Update document status
        document.status = DocumentStatus.COMPLETED
        document.processed_at = datetime.utcnow()
        db.add(document)
        
        db.commit()
        
        return {
            "documentId": document_id,
            "status": "completed",
            "cibilScore": cibil_score,
        }
    
    except Exception as e:
        # Update document status to failed
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = DocumentStatus.FAILED
                db.add(document)
                db.commit()
        except:
            pass
        
        # Re-raise the exception
        raise
    
    finally:
        db.close()