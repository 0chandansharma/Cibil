import { useSelector, useDispatch } from 'react-redux';
import { login, logout, register, resetPassword, clearError } from '../store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, error } = useSelector((state) => state.auth);
  
  const handleLogin = async (credentials) => {
    return dispatch(login(credentials)).unwrap();
  };
  
  const handleLogout = async () => {
    return dispatch(logout()).unwrap();
  };
  
  const handleRegister = async (userData) => {
    return dispatch(register(userData)).unwrap();
  };
  
  const handleResetPassword = async (email) => {
    return dispatch(resetPassword(email)).unwrap();
  };
  
  const handleClearError = () => {
    dispatch(clearError());
  };
  
  return {
    user,
    isAuthenticated,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    resetPassword: handleResetPassword,
    clearError: handleClearError,
  };
};

export default useAuth;