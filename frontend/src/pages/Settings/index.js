import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth';
import PrimaryButton from '../../components/common/Button/PrimaryButton';
import SecondaryButton from '../../components/common/Button/SecondaryButton';

const profileSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  firstName: Yup.string(),
  lastName: Yup.string(),
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const profileFormik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        // In a real implementation, this would update the user profile
        console.log('Profile update values:', values);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('Profile update error:', error);
      }
    },
  });
  
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      try {
        // In a real implementation, this would change the password
        console.log('Password change values:', values);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        passwordFormik.resetForm();
      } catch (error) {
        console.error('Password change error:', error);
      }
    },
  });
  
  const notificationSettings = {
    emailNotifications: true,
    documentProcessed: true,
    newClientAdded: false,
    systemUpdates: true,
  };
  
  const handleNotificationChange = (event) => {
    // In a real implementation, this would update notification settings
    console.log('Notification setting changed:', event.target.name, event.target.checked);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="Profile" />
          <Tab label="Password" />
          <Tab label="Notifications" />
        </Tabs>
      </Paper>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}
      
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Profile Settings
          </Typography>
          <Typography variant="h6" gutterBottom>
            Profile Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={profileFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  value={profileFormik.values.username}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.username && Boolean(profileFormik.errors.username)}
                  helperText={profileFormik.touched.username && profileFormik.errors.username}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                  helperText={profileFormik.touched.email && profileFormik.errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={profileFormik.values.firstName}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                  helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={profileFormik.values.lastName}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                  helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <SecondaryButton
                    onClick={() => profileFormik.resetForm()}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    Save Changes
                  </PrimaryButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={passwordFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="currentPassword"
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <SecondaryButton
                    onClick={() => passwordFormik.resetForm()}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    Change Password
                  </PrimaryButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="body2" color="text.secondary">
                Receive notifications via email
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.documentProcessed}
                    onChange={handleNotificationChange}
                    name="documentProcessed"
                    color="primary"
                  />
                }
                label="Document Processing"
              />
              <Typography variant="body2" color="text.secondary">
                Notify when document processing is complete
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.newClientAdded}
                    onChange={handleNotificationChange}
                    name="newClientAdded"
                    color="primary"
                  />
                }
                label="Client Updates"
              />
              <Typography variant="body2" color="text.secondary">
                Notify when new clients are added
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onChange={handleNotificationChange}
                    name="systemUpdates"
                    color="primary"
                  />
                }
                label="System Updates"
              />
              <Typography variant="body2" color="text.secondary">
                Notify about system updates and new features
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <PrimaryButton>
                  Save Preferences
                </PrimaryButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;