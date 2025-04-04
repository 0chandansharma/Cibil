import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import analysisService from '../../../services/analysisService';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const Summary = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await analysisService.getDocumentSummary(documentId);
        setSummary(response || {
          title: 'Financial Statement Analysis',
          date: '2023-05-01',
          overview: 'This document contains the financial statements for ABC Corp for the fiscal year 2022. It includes income statement, balance sheet, and cash flow statement.',
          keyFindings: [
            'Total revenue increased by 15% compared to the previous year.',
            'Net profit margin improved from 8% to 12%.',
            'Current ratio is 2.5, indicating good short-term financial health.',
            'Debt-to-equity ratio decreased from 0.8 to 0.6.',
          ],
          financialHighlights: {
            revenue: 5000000,
            expenses: 4000000,
            profit: 1000000,
            assets: 8000000,
            liabilities: 3000000,
            equity: 5000000,
          },
        });
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, [documentId]);
  
  const handleDownloadSummary = async () => {
    try {
      const blob = await analysisService.downloadAnalysisReport(documentId, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `summary-${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading summary:', error);
    }
  };
  
  if (loading && !summary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!summary) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No summary available for this document.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Document Summary</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadSummary}
        >
          Download
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {summary.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Date: {formatDate(summary.date)}
        </Typography>
        <Typography variant="body1" paragraph>
          {summary.overview}
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Key Findings
            </Typography>
            <List dense>
              {summary.keyFindings.map((finding, index) => (
                <ListItem key={index}>
                  <ListItemText primary={finding} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Financial Highlights
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.financialHighlights.revenue)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Expenses
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.financialHighlights.expenses)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Profit
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(summary.financialHighlights.profit)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Assets
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.financialHighlights.assets)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Liabilities
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.financialHighlights.liabilities)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Equity
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.financialHighlights.equity)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

Summary.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Summary;