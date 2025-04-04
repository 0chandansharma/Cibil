// frontend/src/components/common/StoreDebug.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper } from '@mui/material';

const StoreDebug = () => {
  const auth = useSelector(state => state.auth);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <Paper sx={{ position: 'fixed', bottom: 10, right: 10, p: 2, zIndex: 9999, maxWidth: 400, opacity: 0.9 }}>
      <Typography variant="h6">Auth State Debug</Typography>
      <Box component="pre" sx={{ overflow: 'auto', maxHeight: 300 }}>
        {JSON.stringify(auth, null, 2)}
      </Box>
    </Paper>
  );
};

export default StoreDebug;