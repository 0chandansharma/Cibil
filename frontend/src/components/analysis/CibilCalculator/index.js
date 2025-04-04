import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Slider,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { cibilInputSchema } from '../../../utils/validators';
import { formatCurrency } from '../../../utils/formatters';
import analysisService from '../../../services/analysisService';

const CibilCalculator = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [cibilData, setCibilData] = useState(null);
  const [cibilScore, setCibilScore] = useState(null);
  
  useEffect(() => {
    const fetchCibilData = async () => {
      try {
        setLoading(true);
        const response = await analysisService.getCibilScore(documentId);
        setCibilData(response.extractedData || {
          income: 500000,
          expenses: 300000,
          assets: 2000000,
          liabilities: 1000000,
        });
        setCibilScore(response.score || 750);
      } catch (error) {
        console.error('Error fetching CIBIL data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCibilData();
  }, [documentId]);
  
  const formik = useFormik({
    initialValues: {
      income: '',
      expenses: '',
      assets: '',
      liabilities: '',
    },
    validationSchema: cibilInputSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await analysisService.updateCibilData(documentId, values);
        setCibilScore(response.score);
      } catch (error) {
        console.error('Error updating CIBIL data:', error);
      } finally {
        setLoading(false);
      }
    },
    enableReinitialize: true,
  });
  
  useEffect(() => {
    if (cibilData) {
      formik.setValues({
        income: cibilData.income || '',
        expenses: cibilData.expenses || '',
        assets: cibilData.assets || '',
        liabilities: cibilData.liabilities || '',
      });
    }
  }, [cibilData]);
  
  const getCibilScoreColor = (score) => {
    if (score >= 750) return '#4caf50'; // Good
    if (score >= 650) return '#ff9800'; // Fair
    return '#f44336'; // Poor
  };
  
  const getScoreCategory = (score) => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  };
  
  if (loading && !cibilData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CIBIL Score Calculator
      </Typography>
      
      {cibilScore && (
        <Box sx={{ mb: 4 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.default',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Calculated CIBIL Score
            </Typography>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: 150,
                  height: 150,
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={(cibilScore / 900) * 100}
                  size={150}
                  thickness={5}
                  sx={{
                    color: getCibilScoreColor(cibilScore),
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    {cibilScore}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="h6" color={getCibilScoreColor(cibilScore)}>
              {getScoreCategory(cibilScore)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Score range: 300-900
            </Typography>
          </Paper>
        </Box>
      )}
      
      <Typography variant="subtitle1" gutterBottom>
        Financial Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review and update the extracted financial information to calculate the CIBIL score.
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="income"
              name="income"
              label="Annual Income"
              value={formik.values.income}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.income && Boolean(formik.errors.income)}
              helperText={formik.touched.income && formik.errors.income}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="expenses"
              name="expenses"
              label="Annual Expenses"
              value={formik.values.expenses}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.expenses && Boolean(formik.errors.expenses)}
              helperText={formik.touched.expenses && formik.errors.expenses}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="assets"
              name="assets"
              label="Total Assets"
              value={formik.values.assets}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.assets && Boolean(formik.errors.assets)}
              helperText={formik.touched.assets && formik.errors.assets}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="liabilities"
              name="liabilities"
              label="Total Liabilities"
              value={formik.values.liabilities}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.liabilities && Boolean(formik.errors.liabilities)}
              helperText={formik.touched.liabilities && formik.errors.liabilities}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !formik.dirty || !formik.isValid}
            >
              {loading ? <CircularProgress size={24} /> : 'Calculate CIBIL Score'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      {cibilData && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Financial Ratios
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Debt-to-Income Ratio
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Measures your monthly debt payments as a percentage of your monthly income.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">0%</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {((cibilData.expenses / cibilData.income) * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2">100%</Typography>
                </Box>
                <Slider
                  value={(cibilData.expenses / cibilData.income) * 100}
                  disabled
                  sx={{
                    '& .MuiSlider-thumb': {
                      display: 'none',
                    },
                  }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Debt-to-Asset Ratio
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Measures your total liabilities as a percentage of your total assets.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">0%</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {((cibilData.liabilities / cibilData.assets) * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2">100%</Typography>
                </Box>
                <Slider
                  value={(cibilData.liabilities / cibilData.assets) * 100}
                  disabled
                  sx={{
                    '& .MuiSlider-thumb': {
                      display: 'none',
                    },
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

CibilCalculator.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CibilCalculator;