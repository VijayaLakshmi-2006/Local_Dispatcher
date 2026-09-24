import api from './api.js';

export const aiService = {
  searchPrompt: async (prompt) => {
    const response = await api.post('/api/ai/search', { prompt });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/ai/history');
    return response.data;
  }
};

export default aiService;
