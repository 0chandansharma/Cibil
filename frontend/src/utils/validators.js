import * as Yup from 'yup';

// Login validation schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

// Registration validation schema
export const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// Password reset validation schema
export const resetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

// Client form validation schema
export const clientSchema = Yup.object().shape({
  name: Yup.string()
    .required('Client name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(
      /^[0-9]{10}$/,
      'Phone number must be 10 digits'
    )
    .required('Phone number is required'),
  address: Yup.string(),
});

// Document upload validation schema
export const documentUploadSchema = Yup.object().shape({
  title: Yup.string()
    .required('Document title is required'),
  file: Yup.mixed()
    .required('File is required')
    .test(
      'fileFormat',
      'Unsupported file format. Only PDF and image files are allowed.',
      (value) => {
        if (!value) return false;
        const supportedFormats = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        return supportedFormats.includes(value.type);
      }
    )
    .test(
      'fileSize',
      'File size is too large. Maximum size is 10MB.',
      (value) => {
        if (!value) return false;
        return value.size <= 10 * 1024 * 1024; // 10MB
      }
    ),
});

// CIBIL score input validation schema
export const cibilInputSchema = Yup.object().shape({
  income: Yup.number()
    .positive('Income must be positive')
    .required('Income is required'),
  expenses: Yup.number()
    .positive('Expenses must be positive')
    .required('Expenses are required'),
  assets: Yup.number()
    .positive('Assets must be positive')
    .required('Assets are required'),
  liabilities: Yup.number()
    .positive('Liabilities must be positive')
    .required('Liabilities are required'),
});