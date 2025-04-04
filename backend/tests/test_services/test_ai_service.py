import pytest
from app.services import ai_service

class TestAIService:
    async def test_get_chat_response(self):
        # Test chat response with various queries
        document_text = """
        ABC Corporation
        Financial Statement 2022
        
        Income Statement
        Revenue: $5,000,000
        Cost of Goods Sold: $3,000,000
        Gross Profit: $2,000,000
        Operating Expenses: $1,000,000
        Net Profit: $1,000,000
        
        Balance Sheet
        Current Assets: $3,000,000
        Non-Current Assets: $5,000,000
        Total Assets: $8,000,000
        Current Liabilities: $1,200,000
        Non-Current Liabilities: $1,800,000
        Total Liabilities: $3,000,000
        Equity: $5,000,000
        """
        
        extracted_data = {
            "income": 5000000,
            "expenses": 4000000,
            "assets": 8000000,
            "liabilities": 3000000,
        }
        
        # Test revenue question
        response = await ai_service.get_chat_response(
            document_text=document_text,
            extracted_data=extracted_data,
            user_message="What is the revenue?"
        )
        assert "revenue" in response.lower()
        assert "5,000,000" in response or "$5,000,000" in response
        
        # Test profit question
        response = await ai_service.get_chat_response(
            document_text=document_text,
            extracted_data=extracted_data,
            user_message="What is the profit margin?"
        )
        assert "profit" in response.lower()
        assert "margin" in response.lower()
        
        # Test ratio question
        response = await ai_service.get_chat_response(
            document_text=document_text,
            extracted_data=extracted_data,
            user_message="What is the current ratio?"
        )
        assert "ratio" in response.lower()
        assert "2.5" in response
        
        # Test debt question
        response = await ai_service.get_chat_response(
            document_text=document_text,
            extracted_data=extracted_data,
            user_message="What are the liabilities?"
        )
        assert "liabilities" in response.lower() or "debt" in response.lower()
        assert "3,000,000" in response or "$3,000,000" in response
        
        # Test generic question
        response = await ai_service.get_chat_response(
            document_text=document_text,
            extracted_data=extracted_data,
            user_message="Tell me about this document"
        )
        assert len(response) > 0
    
    async def test_generate_document_summary(self):
        # Generate document summary
        document_text = """
        ABC Corporation
        Financial Statement 2022
        
        Income Statement
        Revenue: $5,000,000
        Cost of Goods Sold: $3,000,000
        Gross Profit: $2,000,000
        Operating Expenses: $1,000,000
        Net Profit: $1,000,000
        
        Balance Sheet
        Current Assets: $3,000,000
        Non-Current Assets: $5,000,000
        Total Assets: $8,000,000
        Current Liabilities: $1,200,000
        Non-Current Liabilities: $1,800,000
        Total Liabilities: $3,000,000
        Equity: $5,000,000
        """
        
        extracted_data = {
            "income": 5000000,
            "expenses": 4000000,
            "assets": 8000000,
            "liabilities": 3000000,
        }
        
        summary = await ai_service.generate_document_summary(document_text, extracted_data)
        
        # Check summary
        assert summary is not None
        assert len(summary) > 0
        assert "financial statements" in summary.lower()