import pytest
from unittest.mock import patch
from app.services import analysis_service
from unittest.mock import MagicMock
class TestAnalysisService:
    async def test_generate_summary(self):
        # Generate summary
        text = "Test document text"
        extracted_data = {"income": 5000000, "expenses": 4000000}
        
        summary = await analysis_service.generate_summary(text, extracted_data)
        
        # Check summary
        assert summary is not None
        assert len(summary) > 0
        assert "financial statements" in summary.lower()
    
    def test_calculate_cibil_score(self):
        # Calculate CIBIL score with valid data
        financial_data = {
            "income": 5000000,
            "expenses": 3000000,
            "assets": 8000000,
            "liabilities": 3000000,
        }
        
        score = analysis_service.calculate_cibil_score(financial_data)
        
        # Check score
        assert score >= 300
        assert score <= 900
    
    def test_calculate_cibil_score_with_zero_values(self):
        # Calculate CIBIL score with zero income and assets
        financial_data = {
            "income": 0,
            "expenses": 3000000,
            "assets": 0,
            "liabilities": 3000000,
        }
        
        score = analysis_service.calculate_cibil_score(financial_data)
        
        # Should return default score
        assert score == 600
    
    def test_calculate_cibil_score_with_missing_values(self):
        # Calculate CIBIL score with missing values
        financial_data = {}
        
        score = analysis_service.calculate_cibil_score(financial_data)
        
        # Should return default score
        assert score == 600
    
    def test_extract_key_findings(self):
        # Extract key findings
        summary = """
        This document contains the financial statements for ABC Corp for the fiscal year 2022. 
        It includes income statement, balance sheet, and cash flow statement.
        
        The company's financial performance shows improvement compared to the previous year, 
        with a 16.3% increase in revenue and a 42.9% increase in net profit. 
        The balance sheet indicates a healthy financial position with a current ratio of 2.5 
        and a debt-to-equity ratio of 0.6, which is lower than the previous year's 0.8.
        """
        
        findings = analysis_service.extract_key_findings(summary)
        
        # Check findings
        assert len(findings) > 0
        assert isinstance(findings, list)
        assert all(isinstance(finding, str) for finding in findings)
    
    @patch('app.services.analysis_service.Document')
    @patch('app.services.analysis_service.Analysis')
    @patch('app.services.analysis_service.ExtractedData')
    @patch('app.services.analysis_service.OCRResult')
    def test_generate_report_pdf(self, mock_ocr_result_class, mock_extracted_data_class, 
                                mock_analysis_class, mock_document_class, db):
        # Create mock instances
        mock_document = MagicMock()
        mock_document.title = "Test Document"
        
        mock_analysis = MagicMock()
        mock_analysis.cibil_score = 750.0
        mock_analysis.summary = "Test summary"
        
        mock_extracted_data = MagicMock()
        mock_extracted_data.json_data = {"income": 5000000}
        mock_extracted_data.table_data = {"tables": []}
        
        mock_ocr_result = MagicMock()
        mock_ocr_result.text = "Test OCR text"
        
        # Mock the database queries
        db.query().filter().first.side_effect = [
            mock_document, mock_analysis, mock_extracted_data, mock_ocr_result
        ]
        
        # Generate PDF report
        with patch('app.services.analysis_service.db') as mock_db:
            mock_db.query.return_value.filter.return_value.first.side_effect = [
                mock_document, mock_analysis, mock_extracted_data, mock_ocr_result
            ]
            report = analysis_service.generate_report(mock_db, 1, "pdf")
        
        # Check report
        assert report is not None
        assert isinstance(report, bytes)
        assert report.startswith(b'%PDF')
    
    @patch('app.db.models.Document')
    @patch('app.db.models.Analysis')
    @patch('app.db.models.ExtractedData')
    def test_generate_report_excel(self, mock_extracted_data, mock_analysis, mock_document, db):
        # Mock document and analysis
        mock_document.title = "Test Document"
        mock_analysis.cibil_score = 750.0
        mock_analysis.summary = "Test summary"
        mock_extracted_data.json_data = {"income": 5000000}
        mock_extracted_data.table_data = {"tables": []}
        
        # Generate Excel report
        report = analysis_service.generate_report(db, 1, "xlsx")
        
        # Check report
        assert report is not None
        assert isinstance(report, bytes)
        assert report.startswith(b'PK')