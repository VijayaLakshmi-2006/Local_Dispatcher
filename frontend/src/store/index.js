import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import cartReducer from './cartSlice.js';
import orderReducer from './orderSlice.js';
import aiReducer from './aiSlice.js';
import productReducer from './productSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer,
    ai: aiReducer,
    products: productReducer,
  },
});

export default store;
