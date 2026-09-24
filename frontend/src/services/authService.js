import api from './api.js';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  googleLogin: async (googleData) => {
    const response = await api.post('/api/auth/google', googleData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  addAddress: async (addressData) => {
    const response = await api.post('/api/auth/address', addressData);
    return response.data;
  },
  
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/api/auth/address/${addressId}`, addressData);
    return response.data;
  },
  
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/api/auth/address/${addressId}`);
    return response.data;
  }
};

export default authService;
