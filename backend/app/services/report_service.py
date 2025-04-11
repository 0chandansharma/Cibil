# backend/app/services/report_service.py
import io
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from app.db.models import Document, Analysis, ExtractedData, OCRResult
from app.services import analysis_service

def generate_pdf_report(db: Session, document_id: int) -> bytes:
    """
    Generate a PDF report for a document analysis
    """
    # Get document and analysis data
    document = db.query(Document).filter(Document.id == document_id).first()
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    extracted_data = db.query(ExtractedData).filter(ExtractedData.document_id == document_id).first()
    ocr_result = db.query(OCRResult).filter(OCRResult.document_id == document_id).first()
    
    if not document or not analysis or not extracted_data:
        raise ValueError("Document or analysis data not found")
    
    # Create a buffer for the PDF
    buffer = io.BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Add title
    title_style = styles["Title"]
    story.append(Paragraph(f"Financial Analysis Report: {document.title}", title_style))
    story.append(Spacer(1, 12))
    
    # Add date
    date_style = styles["Normal"]
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", date_style))
    story.append(Spacer(1, 12))
    
    # Add summary
    heading_style = styles["Heading1"]
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Spacer(1, 6))
    
    normal_style = styles["Normal"]
    story.append(Paragraph(analysis.summary, normal_style))
    story.append(Spacer(1, 12))
    
    # Add CIBIL score
    story.append(Paragraph("CIBIL Score Analysis", heading_style))
    story.append(Spacer(1, 6))
    
    score_text = f"CIBIL Score: {int(analysis.cibil_score)}"
    story.append(Paragraph(score_text, styles["Heading2"]))
    story.append(Spacer(1, 6))
    
    # Add score interpretation
    if analysis.cibil_score >= 750:
        interpretation = "Excellent: The financial health is excellent with low risk."
    elif analysis.cibil_score >= 700:
        interpretation = "Good: The financial health is good with moderate-low risk."
    elif analysis.cibil_score >= 650:
        interpretation = "Fair: The financial health is fair with moderate risk."
    elif analysis.cibil_score >= 600:
        interpretation = "Poor: The financial health is concerning with high risk."
    else:
        interpretation = "Very Poor: The financial health is poor with very high risk."
    
    story.append(Paragraph(f"Interpretation: {interpretation}", normal_style))
    story.append(Spacer(1, 12))
    
    # Add financial data table
    story.append(Paragraph("Financial Data", heading_style))
    story.append(Spacer(1, 6))
    
    financial_data = extracted_data.json_data
    data = [
        ["Item", "Amount (₹)"],
        ["Income", f"{financial_data.get('income', 0):,.2f}"],
        ["Expenses", f"{financial_data.get('expenses', 0):,.2f}"],
        ["Assets", f"{financial_data.get('assets', 0):,.2f}"],
        ["Liabilities", f"{financial_data.get('liabilities', 0):,.2f}"],
    ]
    
    # Calculate net worth and debt ratio
    income = financial_data.get('income', 0)
    expenses = financial_data.get('expenses', 0)
    assets = financial_data.get('assets', 0)
    liabilities = financial_data.get('liabilities', 0)
    
    profit = income - expenses
    net_worth = assets - liabilities
    debt_ratio = liabilities / assets if assets > 0 else 0
    
    data.append(["Profit", f"{profit:,.2f}"])
    data.append(["Net Worth", f"{net_worth:,.2f}"])
    data.append(["Debt Ratio", f"{debt_ratio:.2f}"])
    
    financial_table = Table(data)
    financial_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (1, 0), 12),
        ('BACKGROUND', (0, 1), (1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (1, -1), colors.black),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 1), (1, -1), 'Helvetica'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    story.append(financial_table)
    story.append(Spacer(1, 12))
    
    # Add key findings
    story.append(Paragraph("Key Findings", heading_style))
    story.append(Spacer(1, 6))
    
    findings = analysis_service.extract_key_findings(analysis.summary)
    for i, finding in enumerate(findings):
        story.append(Paragraph(f"{i+1}. {finding}", normal_style))
        story.append(Spacer(1, 3))
    
    story.append(Spacer(1, 12))
    
    # Add extracted tables if available
    if extracted_data.table_data and "tables" in extracted_data.table_data:
        story.append(Paragraph("Extracted Tables", heading_style))
        story.append(Spacer(1, 6))
        
        for i, table_data in enumerate(extracted_data.table_data["tables"]):
            story.append(Paragraph(table_data["title"], styles["Heading2"]))
            story.append(Spacer(1, 6))
            
            # Prepare table data
            table_rows = [table_data["headers"]]
            table_rows.extend(table_data["rows"])
            
            table = Table(table_rows)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('ALIGN', (0, 1), (0, -1), 'LEFT'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            
            story.append(table)
            story.append(Spacer(1, 12))
    
    # Build the PDF document
    doc.build(story)
    
    # Get the value from the buffer
    pdf_data = buffer.getvalue()
    buffer.close()
    
    return pdf_data