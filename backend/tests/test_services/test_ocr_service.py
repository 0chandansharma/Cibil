import pytest
import os
from unittest.mock import patch, mock_open
from app.services import ocr_service

class TestOCRService:
    @patch('os.path.splitext')
    @patch('builtins.open', new_callable=mock_open, read_data=b'test data')
    async def test_extract_text_pdf(self, mock_file, mock_splitext):
        # Mock return values
        mock_splitext.return_value = ('test', '.pdf')
        
        # Extract text
        result = await ocr_service.extract_text('/path/to/test.pdf')
        
        # Check result
        assert "text" in result
        assert "confidence" in result
        assert result["confidence"] > 0
        assert "Financial Statement" in result["text"]
    
    @patch('os.path.splitext')
    @patch('builtins.open', new_callable=mock_open, read_data=b'test data')
    async def test_extract_text_image(self, mock_file, mock_splitext):
        # Mock return values
        mock_splitext.return_value = ('test', '.jpg')
        
        # Extract text
        result = await ocr_service.extract_text('/path/to/test.jpg')
        
        # Check result
        assert "text" in result
        assert "confidence" in result
        assert result["confidence"] > 0
        assert "Financial Statement" in result["text"]
    
    @patch('os.path.splitext')
    @patch('builtins.open', new_callable=mock_open, read_data=b'test data')
    async def test_extract_text_unsupported_format(self, mock_file, mock_splitext):
        # Mock return values
        mock_splitext.return_value = ('test', '.txt')
        
        # Extract text should raise ValueError
        with pytest.raises(ValueError):
            await ocr_service.extract_text('/path/to/test.txt')
    
    async def test_extract_structured_data(self):
        # Extract structured data
        result = await ocr_service.extract_structured_data('/path/to/test.pdf', 'Test text')
        
        # Check result
        assert "income" in result
        assert "expenses" in result
        assert "assets" in result
        assert "liabilities" in result
        assert "revenue" in result
        assert "profit" in result
        assert "ratios" in result
    
    async def test_extract_tables(self):
        # Extract tables
        result = await ocr_service.extract_tables('/path/to/test.pdf')
        
        # Check result
        assert len(result) > 0
        assert "id" in result[0]
        assert "title" in result[0]
        assert "headers" in result[0]
        assert "rows" in result[0]
        assert len(result[0]["rows"]) > 0