const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const authenticate = require('../middleware/auth');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Maximum number of historical messages to use as context
const MAX_HISTORY = 10;

router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    // Get user's recent chat history
    const history = await ChatHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY)
      .lean();

    // Format history for Gemini (reverse chronological order)
    const chatHistory = history.reverse().map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Get response from Gemini
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    // Save both messages to database
    const [userMessage, aiMessage] = await Promise.all([
      ChatHistory.create({
        user: userId,
        content: message,
        role: 'user'
      }),
      ChatHistory.create({
        user: userId,
        content: text,
        role: 'model'
      })
    ]);

    res.json({ 
      response: text,
      history: [
        ...history.map(h => ({ content: h.content, role: h.role })),
        { content: message, role: 'user' },
        { content: text, role: 'model' }
      ].slice(-MAX_HISTORY * 2) // Return last MAX_HISTORY * 2 messages
    });

  } catch (error) {
    console.error('Error:', error);
    const status = error.response?.status || 500;
    res.status(status).json({ 
      error: error.message || 'Error processing your message',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

router.get('/chat/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const history = await ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.json(history.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

module.exports = router;