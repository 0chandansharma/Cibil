import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import analysisService from '../../../services/analysisService';

const TableView = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [activeTableIndex, setActiveTableIndex] = useState(0);
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await analysisService.getExtractedTables(documentId);
        setTables(response || [
          {
            id: 1,
            title: 'Income Statement',
            headers: ['Item', '2022', '2021', 'Change %'],
            rows: [
              ['Revenue', '5,000,000', '4,300,000', '16.3%'],
              ['Cost of Goods Sold', '3,000,000', '2,700,000', '11.1%'],
              ['Gross Profit', '2,000,000', '1,600,000', '25.0%'],
              ['Operating Expenses', '1,000,000', '900,000', '11.1%'],
              ['Net Profit', '1,000,000', '700,000', '42.9%'],
            ],
          },
          {
            id: 2,
            title: 'Balance Sheet',
            headers: ['Item', '2022', '2021', 'Change %'],
            rows: [
              ['Current Assets', '3,000,000', '2,500,000', '20.0%'],
              ['Non-Current Assets', '5,000,000', '4,800,000', '4.2%'],
              ['Total Assets', '8,000,000', '7,300,000', '9.6%'],
              ['Current Liabilities', '1,200,000', '1,100,000', '9.1%'],
              ['Non-Current Liabilities', '1,800,000', '2,000,000', '-10.0%'],
              ['Total Liabilities', '3,000,000', '3,100,000', '-3.2%'],
              ['Equity', '5,000,000', '4,200,000', '19.0%'],
            ],
          },
        ]);
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, [documentId]);
  
  const handleChangeTable = (event, newValue) => {
    setActiveTableIndex(newValue);
  };
  
  const handleDownloadTable = async (tableId) => {
    try {
      // In a real implementation, this would download the specific table
      // For demo purposes, we'll just log the action
      console.log(`Downloading table ${tableId}`);
    } catch (error) {
      console.error('Error downloading table:', error);
    }
  };
  
  const handleDownloadAllTables = async () => {
    try {
      // In a real implementation, this would download all tables
      // For demo purposes, we'll just log the action
      console.log('Downloading all tables');
    } catch (error) {
      console.error('Error downloading tables:', error);
    }
  };
  
  if (loading && tables.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (tables.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No tables found in this document.
        </Typography>
      </Box>
    );
  }
  
  const activeTable = tables[activeTableIndex];
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Extracted Tables</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadAllTables}
        >
          Download All
        </Button>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTableIndex}
          onChange={handleChangeTable}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tables.map((table, index) => (
            <Tab key={table.id} label={table.title} />
          ))}
        </Tabs>
      </Box>
      
      {activeTable && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">{activeTable.title}</Typography>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadTable(activeTable.id)}
            >
              Download
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {activeTable.headers.map((header, index) => (
                    <TableCell key={index} align={index === 0 ? 'left' : 'right'}>
                      <Typography variant="subtitle2">{header}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {activeTable.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} align={cellIndex === 0 ? 'left' : 'right'}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

TableView.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TableView;