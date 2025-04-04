import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import PropTypes from 'prop-types';
import analysisService from '../../../services/analysisService';
import { formatCurrency, formatDate } from '../../../utils/formatters';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bank-tabpanel-${index}`}
      aria-labelledby={`bank-tab-${index}`}
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

const BankStatementAnalysis = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const data = await analysisService.getBankStatementAnalysis(documentId);
        setAnalysisData(data);
      } catch (err) {
        console.error('Error fetching bank statement analysis:', err);
        setError('Failed to load bank statement analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [documentId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!analysisData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No analysis data available for this document.
        </Typography>
      </Box>
    );
  }

  const { 
    account_info, 
    summary, 
    transactions, 
    categories, 
    recurring_transactions, 
    monthly_summary, 
    large_transactions, 
    insights 
  } = analysisData;

  // Prepare data for charts
  const categoryData = Object.entries(categories.withdrawals || {}).map(([name, data]) => ({
    name,
    value: data.amount,
    count: data.count
  }));

  const monthlyData = monthly_summary.map(month => ({
    name: month.month,
    deposits: month.total_deposits,
    withdrawals: month.total_withdrawals,
    net: month.net_flow
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Bank Statement Analysis
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
            <Typography variant="body1">{account_info?.account_number || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Account Holder</Typography>
            <Typography variant="body1">{account_info?.account_holder || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Statement Period</Typography>
            <Typography variant="body1">
              {account_info?.statement_from || 'N/A'} to {account_info?.statement_to || 'N/A'}
            </Typography>
            </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="bank statement analysis tabs">
          <Tab label="Summary" />
          <Tab label="Transactions" />
          <Tab label="Categories" />
          <Tab label="Monthly Analysis" />
          <Tab label="Insights" />
        </Tabs>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Summary Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Deposits</Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(summary?.total_deposits || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Withdrawals</Typography>
                  <Typography variant="h4" color="error">
                    {formatCurrency(summary?.total_withdrawals || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Net Flow</Typography>
                  <Typography variant="h4" color={summary?.net_flow >= 0 ? "success" : "error"}>
                    {formatCurrency(summary?.net_flow || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Large Transactions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Largest Deposits</Typography>
                  {large_transactions?.deposits && large_transactions.deposits.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {large_transactions.deposits.slice(0, 5).map((tx, index) => (
                            <TableRow key={index}>
                              <TableCell>{tx.date}</TableCell>
                              <TableCell>{formatCurrency(tx.amount)}</TableCell>
                              <TableCell>{tx.narration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No large deposits found</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Largest Withdrawals</Typography>
                  {large_transactions?.withdrawals && large_transactions.withdrawals.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {large_transactions.withdrawals.slice(0, 5).map((tx, index) => (
                            <TableRow key={index}>
                              <TableCell>{tx.date}</TableCell>
                              <TableCell>{formatCurrency(tx.amount)}</TableCell>
                              <TableCell>{tx.narration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No large withdrawals found</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recurring Transactions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recurring Transactions</Typography>
                  {recurring_transactions && recurring_transactions.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Average Amount</TableCell>
                            <TableCell>Occurrences</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recurring_transactions.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Chip 
                                  label={item.type} 
                                  color={item.type === 'deposit' ? 'success' : 'error'} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.frequency}</TableCell>
                              <TableCell>{formatCurrency(item.average_amount)}</TableCell>
                              <TableCell>{item.occurrences}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No recurring transactions identified</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Transactions Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {transactions?.length || 0} of {analysisData.transaction_count || 0} transactions
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell align="right">Withdrawal</TableCell>
                  <TableCell align="right">Deposit</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions && transactions.map((tx, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.narration}</TableCell>
                    <TableCell>{tx.reference}</TableCell>
                    <TableCell align="right">{tx.withdrawal ? formatCurrency(tx.withdrawal) : ''}</TableCell>
                    <TableCell align="right">{tx.deposit ? formatCurrency(tx.deposit) : ''}</TableCell>
                    <TableCell align="right">{tx.balance ? formatCurrency(tx.balance) : ''}</TableCell>
                  </TableRow>
                ))}
                {!transactions || transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No transactions found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Categories Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Spending by Category</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">% of Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryData.map((category, index) => (
                          <TableRow key={index}>
                            <TableCell>{category.name}</TableCell>
                            <TableCell align="right">{formatCurrency(category.value)}</TableCell>
                            <TableCell align="right">{category.count}</TableCell>
                            <TableCell align="right">
                              {((category.value / summary.total_withdrawals) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Monthly Analysis Tab */}
        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Cash Flow</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="deposits" name="Deposits" fill="#4caf50" />
                    <Bar dataKey="withdrawals" name="Withdrawals" fill="#f44336" />
                    <Bar dataKey="net" name="Net Flow" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
          <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Deposits</TableCell>
                    <TableCell align="right">Withdrawals</TableCell>
                    <TableCell align="right">Net Flow</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthly_summary && monthly_summary.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell>{month.month}</TableCell>
                      <TableCell align="right">{formatCurrency(month.total_deposits)}</TableCell>
                      <TableCell align="right">{formatCurrency(month.total_withdrawals)}</TableCell>
                      <TableCell align="right">{formatCurrency(month.net_flow)}</TableCell>
                      <TableCell align="right">{month.transaction_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Insights Tab */}
        <TabPanel value={activeTab} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Financial Insights</Typography>
              <Box sx={{ mt: 2 }}>
                {insights && insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body1">{insight}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No insights available for this statement
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
};

BankStatementAnalysis.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default BankStatementAnalysis;