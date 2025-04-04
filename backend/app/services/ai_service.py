import json
from typing import Dict, Any, List
import aiohttp
from app.core.config import settings

async def get_chat_response(document_text: str, extracted_data: Dict[str, Any], user_message: str) -> str:
    """
    Get AI chat response based on document content and user message
    """
    # In a real implementation, this would call an AI API like OpenAI
    # For this implementation, we'll return mock responses
    
    # Simplified response generation based on keywords in the user message
    user_message_lower = user_message.lower()
    
    if "revenue" in user_message_lower or "income" in user_message_lower:
        return "Based on the financial statements, the company's revenue increased by 16.3% compared to the previous year, reaching $5,000,000 in 2022."
    
    elif "profit" in user_message_lower or "margin" in user_message_lower:
        return "The company's net profit margin is 20%, which is higher than the industry average of 15%. The net profit for 2022 was $1,000,000, a 42.9% increase from 2021."
    
    elif "ratio" in user_message_lower or "liquidity" in user_message_lower:
        return "The current ratio is 2.5, indicating good short-term financial health. This means the company has 2.5 times more current assets than current liabilities."
    
    elif "debt" in user_message_lower or "liabilities" in user_message_lower:
        return "The debt-to-equity ratio is 0.6, which is lower than last year's 0.8, showing improved financial stability. Total liabilities amount to $3,000,000."
    
    elif "asset" in user_message_lower or "roa" in user_message_lower:
        return "The return on assets (ROA) is 12.5%, which is a positive indicator of efficient asset utilization. Total assets amount to $8,000,000."
    
    elif "expense" in user_message_lower or "cost" in user_message_lower:
        return "According to the income statement, operating expenses increased by 11.1% compared to the previous year, reaching $1,000,000 in 2022."
    
    elif "cash flow" in user_message_lower:
        return "The company's cash flow from operations is positive, indicating healthy business operations. Detailed cash flow information is available in the statement of cash flows."
    
    elif "summary" in user_message_lower or "overview" in user_message_lower:
        return "The financial statements show a company with strong growth and improving financial health. Revenue and profit are increasing, while debt ratios are decreasing. The company has a solid asset base and good liquidity."
    
    else:
        return "Based on the financial statements, the company shows positive financial performance in 2022. Is there a specific aspect of the financial data you'd like me to analyze further?"

async def generate_document_summary(document_text: str, extracted_data: Dict[str, Any]) -> str:
    """
    Generate a comprehensive summary of the document using AI
    """
    # In a real implementation, this would call an AI API
    # For this implementation, we'll return a mock summary
    
    summary = """
    This document contains the financial statements for ABC Corp for the fiscal year 2022. 
    It includes income statement, balance sheet, and cash flow statement.
    
    The company's financial performance shows improvement compared to the previous year, 
    with a 16.3% increase in revenue and a 42.9% increase in net profit. 
    The balance sheet indicates a healthy financial position with a current ratio of 2.5 
    and a debt-to-equity ratio of 0.6, which is lower than the previous year's 0.8.
    
    Key financial metrics show positive trends, with return on assets at 12.5% and 
    a net profit margin of 20%, up from 16.3% in the previous year.
    """
    
    return summary