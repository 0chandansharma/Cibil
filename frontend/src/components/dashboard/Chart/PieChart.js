import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import PropTypes from 'prop-types';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const PieChart = ({ title, data, height }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: height || 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ width: '80%', height: '80%' }}>
          <Pie options={options} data={data} />
        </Box>
      </Box>
    </Paper>
  );
};

PieChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  height: PropTypes.number,
};

export default PieChart;