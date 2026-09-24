import express from 'express';
import { searchPrompt, getSearchHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

import { parseShoppingPrompt } from '../services/aiService.js';

const router = express.Router();

router.post('/search', protect, searchPrompt);
router.get('/history', protect, getSearchHistory);
router.get('/debug', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    // Let's do a direct test of Groq API here
    const { default: Groq } = await import('groq-sdk');
    if (!apiKey) {
      return res.json({ success: false, error: 'GROQ_API_KEY environment variable is missing' });
    }

    const groq = new Groq({ apiKey });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Respond with "success"' }],
      model: 'llama-3.3-70b-versatile'
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    return res.json({
      success: true,
      apiKeyPresent: !!apiKey,
      apiKeySnippet: apiKey.substring(0, 10) + '...',
      responseText
    });
  } catch (err) {
    return res.json({
      success: false,
      apiKeyPresent: !!process.env.GROQ_API_KEY,
      error: err.message,
      stack: err.stack
    });
  }
});

export default router;
