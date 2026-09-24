import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// Thunk to fetch active cart
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/cart');
      if (response.data.success) {
        return response.data.cart;
      }
      return rejectWithValue('Failed to load cart');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching cart');
    }
  }
);

// Thunk to add single item
export const addSingleItem = createAsyncThunk(
  'cart/addSingle',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/cart/add', { productId, quantity });
      if (response.data.success) {
        return response.data.cart;
      }
      return rejectWithValue('Failed to add item');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error adding item');
    }
  }
);

// Thunk to add bulk items (e.g. from AI shopping recipes list)
export const addBulkItems = createAsyncThunk(
  'cart/addBulk',
  async (items, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/cart/add', { items });
      if (response.data.success) {
        return response.data.cart;
      }
      return rejectWithValue('Failed to add items');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error adding items');
    }
  }
);

// Thunk to update item quantity
export const updateCartQty = createAsyncThunk(
  'cart/updateQty',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/cart/update', { productId, quantity });
      if (response.data.success) {
        return response.data.cart;
      }
      return rejectWithValue('Failed to update quantity');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating quantity');
    }
  }
);

// Thunk to remove item from cart
export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete('/api/cart/remove', { data: { productId } });
      if (response.data.success) {
        return response.data.cart;
      }
      return rejectWithValue('Failed to remove item');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error removing item');
    }
  }
);

const initialState = {
  items: [],
  totalPrice: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const handleCartFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
      state.totalPrice = action.payload?.totalPrice || 0;
    };

    const handleCartPending = (state) => {
      state.loading = true;
      state.error = null;
    };

    const handleCartRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchCart.pending, handleCartPending)
      .addCase(fetchCart.fulfilled, handleCartFulfilled)
      .addCase(fetchCart.rejected, handleCartRejected)
      .addCase(addSingleItem.pending, handleCartPending)
      .addCase(addSingleItem.fulfilled, handleCartFulfilled)
      .addCase(addSingleItem.rejected, handleCartRejected)
      .addCase(addBulkItems.pending, handleCartPending)
      .addCase(addBulkItems.fulfilled, handleCartFulfilled)
      .addCase(addBulkItems.rejected, handleCartRejected)
      .addCase(updateCartQty.pending, handleCartPending)
      .addCase(updateCartQty.fulfilled, handleCartFulfilled)
      .addCase(updateCartQty.rejected, handleCartRejected)
      .addCase(removeCartItem.pending, handleCartPending)
      .addCase(removeCartItem.fulfilled, handleCartFulfilled)
      .addCase(removeCartItem.rejected, handleCartRejected);
  }
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
