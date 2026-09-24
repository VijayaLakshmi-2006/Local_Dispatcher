import api from './api.js';

export const productService = {
  getProducts: async (filters = {}) => {
    const { category, search } = filters;
    let url = '/api/products?';
    if (category && category !== 'All') url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    const response = await api.get(url);
    return response.data;
  },

  getProductById: async (productId) => {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/api/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/api/products/${productId}`);
    return response.data;
  }
};

export default productService;
