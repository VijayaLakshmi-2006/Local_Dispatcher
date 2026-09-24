import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aiService from '../services/aiService.js';

// Thunk to submit prompt
export const submitAIPrompt = createAsyncThunk(
  'ai/submitPrompt',
  async (promptText, { rejectWithValue }) => {
    try {
      const data = await aiService.searchPrompt(promptText);
      if (data.success) {
        return data.data; // Extracts the actual result (dish, people, ingredients)
      }
      return rejectWithValue('Failed to process prompt');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error processing prompt');
    }
  }
);

// Thunk to load history
export const fetchAIHistory = createAsyncThunk(
  'ai/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const data = await aiService.getHistory();
      if (data.success) {
        return data.history;
      }
      return rejectWithValue('Failed to load search history');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error loading history');
    }
  }
);

const initialState = {
  history: [],
  activeResult: null,
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIResults: (state) => {
      state.activeResult = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // submitAIPrompt
      .addCase(submitAIPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.activeResult = null;
      })
      .addCase(submitAIPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.activeResult = action.payload;
      })
      .addCase(submitAIPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchAIHistory
      .addCase(fetchAIHistory.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAIHistory.fulfilled, (state, action) => {
        state.history = action.payload || [];
      })
      .addCase(fetchAIHistory.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearAIResults } = aiSlice.actions;
export default aiSlice.reducer;
