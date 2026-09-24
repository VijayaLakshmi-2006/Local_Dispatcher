import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService.js';

// Fetch products with query filters
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await productService.getProducts(filters);
      if (data.success) {
        return data.products;
      }
      return rejectWithValue('Failed to load products');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching products');
    }
  }
);

// Fetch product details
export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await productService.getProductById(productId);
      if (data.success) {
        return data.product;
      }
      return rejectWithValue('Product not found');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching product details');
    }
  }
);

// Add product (Admin only)
export const addProduct = createAsyncThunk(
  'products/add',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.createProduct(productData);
      if (data.success) {
        return data.product;
      }
      return rejectWithValue('Failed to create product');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating product');
    }
  }
);

// Update product (Admin only)
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const data = await productService.updateProduct(productId, productData);
      if (data.success) {
        return data.product;
      }
      return rejectWithValue('Failed to update product');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating product');
    }
  }
);

// Delete product (Admin only)
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await productService.deleteProduct(productId);
      if (data.success) {
        return productId;
      }
      return rejectWithValue('Failed to delete product');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting product');
    }
  }
);

const initialState = {
  products: [],
  singleProduct: null,
  loading: false,
  error: null,
  filters: {
    category: 'All',
    search: '',
    sortBy: 'default',
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },
    setSortingFilter: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    clearProductFilters: (state) => {
      state.filters = { category: 'All', search: '', sortBy: 'default' };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.singleProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index > -1) {
          state.products[index] = action.payload;
        }
      });
  }
});

export const { setCategoryFilter, setSearchFilter, setSortingFilter, clearProductFilters } = productSlice.actions;
export default productSlice.reducer;
