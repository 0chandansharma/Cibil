import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { setLoading } from './uiSlice';

// Async thunks
// frontend/src/store/slices/authSlice.js
// Fix in frontend/src/store/slices/authSlice.js
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.login(credentials);
      
      // Store the token and basic user info
      return {
        id: 1, // This would come from decoding the token or user info endpoint
        username: credentials.username,
        email: credentials.username.includes('@') ? credentials.username : `${credentials.username}@example.com`,
        role: credentials.username.includes('admin') ? 'admin' : 'ca',
        token: response.access_token
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await authService.logout();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.resetPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;