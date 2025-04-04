import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, Paper } from '@mui/material';
import {
  People as PeopleIcon,
  Description as DocumentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../../components/common/Card/StatsCard';
import InfoCard from '../../../components/common/Card/InfoCard';
import DataTable from '../../../components/common/Table/DataTable';
import api from '../../../services/api';
import { formatDate } from '../../../utils/formatters';

const CADashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    totalDocuments: 0,
    processedDocuments: 0,
    recentDocuments: [],
    recentClients: [],
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/ca/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
    
    // For demo purposes, set some sample data
    setDashboardData({
      totalClients: 18,
      totalDocuments: 76,
      processedDocuments: 68,
      recentDocuments: [
        { id: 1, title: 'Financial Statement 2022', status: 'completed', createdAt: '2023-05-15T10:30:00Z', clientName: 'ABC Corp' },
        { id: 2, title: 'Balance Sheet Q1', status: 'processing', createdAt: '2023-05-15T09:45:00Z', clientName: 'XYZ Ltd' },
        { id: 3, title: 'Income Statement 2022', status: 'completed', createdAt: '2023-05-14T16:20:00Z', clientName: 'ABC Corp' },
        { id: 4, title: 'Tax Return 2022', status: 'completed', createdAt: '2023-05-14T14:10:00Z', clientName: '123 Industries' },
      ],
      recentClients: [
        { id: 1, name: 'ABC Corp', email: 'contact@abccorp.com', documentsCount: 12 },
        { id: 2, name: 'XYZ Ltd', email: 'info@xyzltd.com', documentsCount: 8 },
        { id: 3, name: '123 Industries', email: 'admin@123industries.com', documentsCount: 5 },
      ],
    });
  }, []);
  
  const handleQuickAnalysis = () => {
    navigate('/workspace/quick-analysis');
  };
  
  const handleClientAnalysis = (clientId) => {
    navigate(`/workspace/client-analysis/${clientId}`);
  };
  
  const handleViewDocument = (documentId) => {
    // Navigate to document view
  };
  
  const documentColumns = [
    { id: 'title', label: 'Title', minWidth: 180 },
    { id: 'clientName', label: 'Client', minWidth: 120 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Box
          sx={{
            display: 'inline-block',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor:
              value === 'completed'
                ? 'success.light'
                : value === 'processing'
                ? 'info.light'
                : 'warning.light',
            color:
              value === 'completed'
                ? 'success.dark'
                : value === 'processing'
                ? 'info.dark'
                : 'warning.dark',
            textTransform: 'capitalize',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created At',
      minWidth: 120,
      format: (value) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      align: 'right',
      format: (_, row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleViewDocument(row.id)}
        >
          View
        </Button>
      ),
    },
  ];
  
  const clientColumns = [
    { id: 'name', label: 'Name', minWidth: 180 },
    { id: 'email', label: 'Email', minWidth: 180 },
    { id: 'documentsCount', label: 'Documents', minWidth: 100 },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      align: 'right',
      format: (_, row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleClientAnalysis(row.id)}
        >
          Analyze
        </Button>
      ),
    },
  ];
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">CA Dashboard</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleQuickAnalysis}
            sx={{ mr: 2 }}
          >
            Quick Analysis
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Clients"
            value={dashboardData.totalClients}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Documents"
            value={dashboardData.totalDocuments}
            icon={<DocumentIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Processed Documents"
            value={dashboardData.processedDocuments}
            icon={<CheckCircleOutlineIcon />}
            color="success"
          />
        </Grid>
        
        {/* Recent Documents */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <DataTable
              columns={documentColumns}
              data={dashboardData.recentDocuments}
              page={0}
              rowsPerPage={5}
              onPageChange={() => {}}
              onRowsPerPageChange={() => {}}
              totalCount={dashboardData.recentDocuments.length}
              emptyMessage="No recent documents"
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                onClick={() => navigate('/ca/documents')}
              >
                View All Documents
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Clients */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Clients
            </Typography>
            <DataTable
              columns={clientColumns}
              data={dashboardData.recentClients}
              page={0}
              rowsPerPage={5}
              onPageChange={() => {}}
              onRowsPerPageChange={() => {}}
              totalCount={dashboardData.recentClients.length}
              emptyMessage="No clients found"
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                onClick={() => navigate('/ca/clients')}
              >
                View All Clients
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CADashboard;