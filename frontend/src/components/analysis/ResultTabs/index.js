import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  Chat as ChatIcon,
  Download as DownloadIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import CibilCalculator from '../CibilCalculator';
import Summary from '../Summary';
import TableView from '../TableView';
import ChatInterface from '../ChatInterface';
import BankStatementAnalysis from '../BankStatementAnalysis';
import analysisService from '../../../services/analysisService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `analysis-tab-${index}`,
    'aria-controls': `analysis-tabpanel-${index}`,
  };
}

const ResultTabs = ({ documentId, analysisResults, isLoading }) => {
  const [value, setValue] = useState(0);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [documentType, setDocumentType] = useState('financial'); // 'financial' or 'bank'

  useEffect(() => {
    // Determine document type based on analysis results
    // This is a simplified approach - in a real app, you'd have a more robust way to detect document type
    const detectDocumentType = async () => {
      try {
        // Try to fetch bank statement analysis
        const bankData = await analysisService.getBankStatementAnalysis(documentId);
        if (bankData && bankData.transactions && bankData.transactions.length > 0) {
          setDocumentType('bank');
        }
      } catch (error) {
        // If error, it's probably not a bank statement
        console.log('Not a bank statement, defaulting to financial document');
        setDocumentType('financial');
      }
    };

    if (documentId && analysisResults) {
      detectDocumentType();
    }
  }, [documentId, analysisResults]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDownload = async (format = 'pdf') => {
    try {
      setDownloadLoading(true);
      const blob = await analysisService.downloadAnalysisReport(documentId, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis-${documentId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading analysis report:', error);
    } finally {
      setDownloadLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading analysis results...
        </Typography>
      </Box>
    );
  }

  if (!analysisResults) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          No analysis results available
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Please process the document to view analysis results.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="analysis tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {/* Show different tabs based on document type */}
          {documentType === 'financial' && (
            <>
              <Tab 
                icon={<BarChartIcon />} 
                label="CIBIL Score" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<DescriptionIcon />} 
                label="Summary" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<TableChartIcon />} 
                label="Tables" 
                {...a11yProps(2)} 
              />
              <Tab 
                icon={<ChatIcon />} 
                label="Chat" 
                {...a11yProps(3)} 
              />
            </>
          )}
          {documentType === 'bank' && (
            <>
              <Tab 
                icon={<AccountBalanceIcon />} 
                label="Bank Statement" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<TableChartIcon />} 
                label="Transactions" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<BarChartIcon />} 
                label="Analytics" 
                {...a11yProps(2)} 
              />
              <Tab 
                icon={<ChatIcon />} 
                label="Chat" 
                {...a11yProps(3)} 
              />
            </>
          )}
        </Tabs>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => handleDownload()}
          disabled={downloadLoading}
          sx={{ mr: 2 }}
          size="small"
        >
          {downloadLoading ? <CircularProgress size={20} /> : 'Download'}
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {documentType === 'financial' ? (
          // Financial document tabs
          <>
            <TabPanel value={value} index={0}>
              <CibilCalculator documentId={documentId} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Summary documentId={documentId} />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <TableView documentId={documentId} />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <ChatInterface documentId={documentId} />
            </TabPanel>
          </>
        ) : (
          // Bank statement tabs
          <>
            <TabPanel value={value} index={0}>
              <BankStatementAnalysis documentId={documentId} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <TableView documentId={documentId} />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <Summary documentId={documentId} />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <ChatInterface documentId={documentId} />
            </TabPanel>
          </>
        )}
      </Box>
    </Box>
  );
};

ResultTabs.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  analysisResults: PropTypes.object,
  isLoading: PropTypes.bool,
};

ResultTabs.defaultProps = {
  isLoading: false,
};

export default ResultTabs;