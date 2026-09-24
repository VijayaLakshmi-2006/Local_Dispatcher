import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../services/orderService.js';

// Fetch all orders associated with user role
export const fetchOrders = createAsyncThunk(
  'orders/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const data = await orderService.getOrders();
      if (data.success) {
        return data.orders;
      }
      return rejectWithValue('Failed to load orders');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching orders');
    }
  }
);

// Fetch order details by ID
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await orderService.getOrderById(orderId);
      if (data.success) {
        return data.order;
      }
      return rejectWithValue('Failed to load order details');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching order details');
    }
  }
);

// Place a new order
export const placeOrder = createAsyncThunk(
  'orders/place',
  async ({ address, paymentMethod }, { rejectWithValue }) => {
    try {
      const data = await orderService.createOrder({ address, paymentMethod });
      if (data.success) {
        return data.order;
      }
      return rejectWithValue('Failed to place order');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error placing order');
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await orderService.cancelOrder(orderId);
      if (data.success) {
        return data.order;
      }
      return rejectWithValue('Failed to cancel order');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cancelling order');
    }
  }
);

// Submit ratings
export const rateOrder = createAsyncThunk(
  'orders/rate',
  async ({ orderId, ratingData }, { rejectWithValue }) => {
    try {
      const data = await orderService.rateOrder(orderId, ratingData);
      if (data.success) {
        return data.order;
      }
      return rejectWithValue('Failed to submit ratings');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error submitting ratings');
    }
  }
);

const initialState = {
  orders: [],
  activeOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearActiveOrder: (state) => {
      state.activeOrder = null;
    },
    updateOrderStatusLocal: (state, action) => {
      const { orderId, orderStatus, deliveryAgent } = action.payload;
      if (state.activeOrder && state.activeOrder._id === orderId) {
        state.activeOrder.orderStatus = orderStatus;
        if (deliveryAgent) {
          state.activeOrder.deliveryAgent = deliveryAgent;
        }
      }
      const existing = state.orders.find(o => o._id === orderId);
      if (existing) {
        existing.orderStatus = orderStatus;
        if (deliveryAgent) {
          existing.deliveryAgent = deliveryAgent;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
        if (state.activeOrder && state.activeOrder._id === action.payload._id) {
          state.activeOrder = action.payload;
        }
      })
      .addCase(rateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
        if (state.activeOrder && state.activeOrder._id === action.payload._id) {
          state.activeOrder = action.payload;
        }
      });
  }
});

export const { clearActiveOrder, updateOrderStatusLocal } = orderSlice.actions;
export default orderSlice.reducer;
