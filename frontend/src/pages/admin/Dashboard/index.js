import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import {
  People as PeopleIcon,
  Description as DocumentIcon,
  AssessmentOutlined as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import StatsCard from '../../../components/common/Card/StatsCard';
import InfoCard from '../../../components/common/Card/InfoCard';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../../services/api';
import { formatDate } from '../../../utils/formatters';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    processedDocuments: 0,
    processingRate: 0,
    recentActivity: [],
    processingStats: {
      labels: [],
      datasets: [],
    },
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
    
    // For demo purposes, set some sample data
    setDashboardData({
      totalUsers: 24,
      totalDocuments: 156,
      processedDocuments: 142,
      processingRate: 91,
      recentActivity: [
        { id: 1, user: 'John Doe', action: 'processed a document', timestamp: '2023-05-15T10:30:00Z' },
        { id: 2, user: 'Jane Smith', action: 'added a new client', timestamp: '2023-05-15T09:45:00Z' },
        { id: 3, user: 'Mike Johnson', action: 'registered a new account', timestamp: '2023-05-14T16:20:00Z' },
        { id: 4, user: 'Sarah Williams', action: 'updated client details', timestamp: '2023-05-14T14:10:00Z' },
      ],
      processingStats: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Documents Processed',
            data: [12, 19, 15, 25, 22, 30],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: 'New Users',
            data: [5, 7, 4, 6, 2, 8],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      },
    });
  }, []);
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Activity',
      },
    },
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={dashboardData.totalUsers}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Documents"
            value={dashboardData.totalDocuments}
            icon={<DocumentIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Processed Documents"
            value={dashboardData.processedDocuments}
            icon={<AssessmentIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Processing Rate"
            value={`${dashboardData.processingRate}%`}
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Processing Statistics
            </Typography>
            <Line options={chartOptions} data={dashboardData.processingStats} />
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <InfoCard
            title="Recent Activity"
            content={
              <Box>
                {dashboardData.recentActivity.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {activity.user} {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(activity.timestamp, 'MMM DD, YYYY HH:mm')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;