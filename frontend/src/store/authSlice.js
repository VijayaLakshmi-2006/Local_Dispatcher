import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService.js';
import api from '../services/api.js';

// Thunk to load profile and verify token
export const loadUserProfile = createAsyncThunk(
  'auth/loadProfile',
  async (token, { rejectWithValue }) => {
    try {
      if (!token) return null;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const data = await authService.getProfile();
      if (data.success) {
        return { user: data.user, token };
      }
      return rejectWithValue('Verification failed');
    } catch (error) {
      delete api.defaults.headers.common['Authorization'];
      return rejectWithValue(error.response?.data?.message || 'Failed to load profile');
    }
  }
);

// Thunk to add address
export const addUserAddress = createAsyncThunk(
  'auth/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const data = await authService.addAddress(addressData);
      if (data.success) {
        return data.addresses;
      }
      return rejectWithValue('Failed to add address');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error adding address');
    }
  }
);

// Thunk to update address
export const updateUserAddress = createAsyncThunk(
  'auth/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const data = await authService.updateAddress(addressId, addressData);
      if (data.success) {
        return data.addresses;
      }
      return rejectWithValue('Failed to update address');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating address');
    }
  }
);

// Thunk to delete address
export const deleteUserAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const data = await authService.deleteAddress(addressId);
      if (data.success) {
        return data.addresses;
      }
      return rejectWithValue('Failed to delete address');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting address');
    }
  }
);

const tokenFromStorage = localStorage.getItem('token') || '';

const initialState = {
  user: null,
  token: tokenFromStorage,
  isAuthenticated: false,
  loading: !!tokenFromStorage,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
    },
    logout: (state) => {
      state.token = '';
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserLocationAction: (state, action) => {
      if (state.user) {
        state.user.location = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = '';
          state.isAuthenticated = false;
        }
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = '';
        state.isAuthenticated = false;
        state.error = action.payload;
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      });
  }
});

export const { loginSuccess, logout, clearAuthError, updateUserLocationAction } = authSlice.actions;
export default authSlice.reducer;
