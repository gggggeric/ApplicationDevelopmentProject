const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Updated to current model name
    });

    // For a single message without history
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ 
      response: text
    });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ 
      error: error.message || 'Error processing your message',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
module.exports = router;