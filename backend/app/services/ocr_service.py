# backend/app/services/ocr_service.py
import os
import json
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import tempfile
import numpy as np
from typing import Dict, Any, List
from app.core.config import settings

def extract_text(file_path: str) -> Dict[str, Any]:
    """
    Extract text from document using OCR
    """
    file_ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_ext == '.pdf':
            # Convert PDF to images
            with tempfile.TemporaryDirectory() as path:
                images = convert_from_path(file_path, output_folder=path)
                text = ""
                confidence_sum = 0
                
                for i, img in enumerate(images):
                    # Process each page
                    page_text = pytesseract.image_to_string(img)
                    text += f"\n--- Page {i+1} ---\n{page_text}"
                    
                    # Get confidence data
                    page_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                    confs = page_data['conf']
                    # Filter out -1 confidence values
                    confs = [c for c in confs if c != -1]
                    if confs:
                        confidence_sum += sum(confs) / len(confs)
                
                # Calculate average confidence
                avg_confidence = confidence_sum / len(images) if images else 0
                
                return {
                    "text": text,
                    "confidence": float(avg_confidence) / 100,  # Convert to 0-1 scale
                }
        elif file_ext in ['.jpg', '.jpeg', '.png']:
            # Process image directly
            img = Image.open(file_path)
            text = pytesseract.image_to_string(img)
            
            # Get confidence data
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            confs = data['conf']
            # Filter out -1 confidence values
            confs = [c for c in confs if c != -1]
            avg_confidence = sum(confs) / len(confs) if confs else 0
            
            return {
                "text": text,
                "confidence": float(avg_confidence) / 100,  # Convert to 0-1 scale
            }
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
    
    except Exception as e:
        print(f"Error in OCR processing: {str(e)}")
        # Return empty result on error
        return {
            "text": "",
            "confidence": 0.0,
        }

def extract_structured_data(file_path: str, text: str) -> Dict[str, Any]:
    """
    Extract structured financial data from OCR text
    """
    # This is a simplified implementation
    # A more robust solution would use NLP or regex patterns to extract data
    
    # Extract financial terms and numbers
    financial_data = {}
    
    # Look for income/revenue
    income_terms = ["income", "revenue", "sales", "turnover"]
    for term in income_terms:
        if term in text.lower():
            # Find numbers near these terms (simplified approach)
            # In a real implementation, you'd use more sophisticated NLP
            index = text.lower().find(term)
            snippet = text[max(0, index-50):min(len(text), index+50)]
            # Try to find a number in this snippet
            import re
            numbers = re.findall(r'[\₹\$\€\£]?\s*\d+(?:[,\.]\d+)*', snippet)
            if numbers:
                # Convert the first found number to float (remove non-numeric chars)
                try:
                    value = float(re.sub(r'[^\d.]', '', numbers[0]))
                    financial_data["income"] = value
                    break
                except:
                    pass
    
    # Similar logic for expenses, assets, liabilities
    expense_terms = ["expense", "cost", "expenditure"]
    for term in expense_terms:
        if term in text.lower():
            index = text.lower().find(term)
            snippet = text[max(0, index-50):min(len(text), index+50)]
            import re
            numbers = re.findall(r'[\₹\$\€\£]?\s*\d+(?:[,\.]\d+)*', snippet)
            if numbers:
                try:
                    value = float(re.sub(r'[^\d.]', '', numbers[0]))
                    financial_data["expenses"] = value
                    break
                except:
                    pass
    
    # If data is missing, provide defaults
    if "income" not in financial_data:
        financial_data["income"] = 500000
    if "expenses" not in financial_data:
        financial_data["expenses"] = 300000
    if "assets" not in financial_data:
        financial_data["assets"] = 2000000
    if "liabilities" not in financial_data:
        financial_data["liabilities"] = 1000000
    
    return financial_data
# Add this to backend/app/services/ocr_service.py
async def process_bank_statement(file_path: str) -> Dict[str, Any]:
    """
    Process bank statement PDF using OCR API
    """
    try:
        # Read the file
        with open(file_path, "rb") as file:
            files = {"file": file}
            
            # Make request to your OCR API
            # Replace this with your actual API endpoint
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    settings.OCR_API_URL + "/process-bank-statement",
                    data=files,
                    headers={"Authorization": f"Bearer {settings.OCR_API_KEY}"}
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"OCR API error: {error_text}")
                    
                    # Parse and return the result
                    result = await response.json()
                    return result
    except Exception as e:
        print(f"Error in OCR processing: {str(e)}")
        raise e
        
def extract_tables(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract tables from document
    """
    # In a real implementation, you would use libraries like tabula-py for PDFs
    # or OpenCV for images to detect and extract tables
    
    # For now, we'll return mock tables based on file type
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        # Mock income statement and balance sheet
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
    else:
        # For image files, provide a simpler table
        tables = [
            {
                "id": 1,
                "title": "Financial Summary",
                "headers": ["Item", "Amount", "Previous", "Change"],
                "rows": [
                    ["Revenue", "5,000,000", "4,300,000", "+16.3%"],
                    ["Expenses", "4,000,000", "3,600,000", "+11.1%"],
                    ["Profit", "1,000,000", "700,000", "+42.9%"],
                ],
            }
        ]
    
    return tables