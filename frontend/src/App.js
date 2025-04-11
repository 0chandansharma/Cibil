import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import Notification from './components/common/Notification';
import ErrorBoundary from './components/common/ErrorBoundary';
import StoreDebug from './components/common/StoreDebug';
function App() {
  const { isLoading } = useSelector((state) => state.ui);

  return (
    <ErrorBoundary>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {isLoading && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {/* <StoreDebug />  */}
          <Notification />
          <AppRoutes />
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

export default App;