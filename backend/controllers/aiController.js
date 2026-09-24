import { parseShoppingPrompt } from '../services/aiService.js';
import AISearch from '../models/AISearch.js';

// @desc    Process natural language shopping prompt
// @route   POST /api/ai/search
// @access  Private
export const searchPrompt = async (req, res) => {
  const { prompt } = req.body;

  try {
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide a search prompt' });
    }

    // Parse the prompt using the AI service (or local fallback)
    const result = await parseShoppingPrompt(prompt);

    // Save AI search log in database
    await AISearch.create({
      user: req.user._id,
      prompt,
      aiResponse: result
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI Search Controller Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during AI search processing' });
  }
};

// @desc    Get AI search history logs
// @route   GET /api/ai/history
// @access  Private
export const getSearchHistory = async (req, res) => {
  try {
    const history = await AISearch.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    return res.json({ success: true, count: history.length, history });
  } catch (error) {
    console.error('AI History Controller Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching search history' });
  }
};
