import api from './api.js';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders/create', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.put('/api/orders/cancel', { orderId });
    return response.data;
  },

  rateOrder: async (orderId, ratingData) => {
    const response = await api.post(`/api/orders/${orderId}/rate`, ratingData);
    return response.data;
  },

  getDispatchLog: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}/dispatch-log`);
    return response.data;
  },

  // Dispatcher APIs
  trackOrder: async (orderId) => {
    const response = await api.get(`/api/dispatch/track/${orderId}`);
    return response.data;
  },

  updateAgentLocation: async (locationData) => {
    const response = await api.put('/api/dispatch/update-location', locationData);
    return response.data;
  },

  assignAgent: async (assignmentData) => {
    const response = await api.post('/api/dispatch/assign', assignmentData);
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/api/dispatch/agents');
    return response.data;
  }
};

export default orderService;
