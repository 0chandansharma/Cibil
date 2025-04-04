import React, { useState } from 'react';
import {
  Box,
  Typography,
  Link,
  Alert,
  Container,
  Avatar,
} from '@mui/material';
import { LockResetOutlined as LockResetOutlinedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import TextField from '../../../components/common/Input/TextField';
import PrimaryButton from '../../../components/common/Button/PrimaryButton';
import useAuth from '../../../hooks/useAuth';
import { resetPasswordSchema } from '../../../utils/validators';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, error, clearError } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      try {
        await resetPassword(values.email);
        setSuccess(true);
        formik.resetForm();
      } catch (err) {console.error('Password reset error:', err);
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  },
});

return (
  <Container component="main" maxWidth="xs">
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'info.main' }}>
        <LockResetOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Reset Password
      </Typography>
      
      {showAlert && error && (
        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
          Password reset instructions have been sent to your email.
        </Alert>
      )}
      
      <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && formik.errors.email}
        />
        <PrimaryButton
          type="submit"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
          disabled={formik.isSubmitting}
        >
          Send Reset Instructions
        </PrimaryButton>
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/login" variant="body2">
            Back to Login
          </Link>
        </Box>
      </Box>
    </Box>
  </Container>
);
};

export default ForgotPassword;