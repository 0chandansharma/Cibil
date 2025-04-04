import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      console.log("Attempting login with:", credentials);
      
      // Create URLSearchParams object for form data
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      console.log("Form data:", formData.toString());
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log("Login response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  // If your backend doesn't have a logout endpoint, implement a client-side logout
  logout: async () => {
    try {
      // If you have a server-side logout endpoint, uncomment this:
      // await api.post('/auth/logout');
      
      // For client-side logout, just return success
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still return success to ensure the user gets logged out on the client side
      return { success: true };
    }
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  resetPassword: async (email) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

export default authService;