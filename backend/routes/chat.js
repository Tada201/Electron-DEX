// eDEX Chatbot - Chat Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const openaiProvider = require('../providers/openai');
const anthropicProvider = require('../providers/anthropic');
const googleProvider = require('../providers/google');
const mistralProvider = require('../providers/mistral');
const groqProvider = require('../providers/groq');
const xaiProvider = require('../providers/xai');

const { sanitizeInput, formatErrorForUser, validateConfig } = require('../utils/helpers');

// Provider map
const providers = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  mistral: mistralProvider,
  groq: groqProvider,
  xai: xaiProvider,
};

// Send message to LLM
router.post('/send', async (req, res) => {
  try {
    const {
      message,
      provider = 'openai',
      model = 'gpt-4o',
      config = {}
    } = req.body;

    console.log(`📤 Chat request: ${provider}/${model}`);

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Message is required and must be a string'
      });
    }

    // Sanitize input
    const cleanMessage = sanitizeInput(message);
    if (!cleanMessage) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Message cannot be empty'
      });
    }

    // Validate provider
    if (!providers[provider]) {
      return res.status(400).json({
        error: 'Invalid provider',
        message: `Provider '${provider}' is not supported`,
        availableProviders: Object.keys(providers)
      });
    }

    // Validate configuration
    const configValidation = validateConfig(config);
    if (!configValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid configuration',
        message: 'Configuration validation failed',
        errors: configValidation.errors
      });
    }

    // Generate conversation ID
    const conversationId = uuidv4();

    // Send message to provider
    const startTime = Date.now();
    const response = await providers[provider].sendMessage(model, cleanMessage, {
      ...config,
      conversationId,
      userId: req.ip, // Simple user identification
    });

    const duration = Date.now() - startTime;

    console.log(`✅ Response received in ${duration}ms from ${provider}/${model}`);

    // Return successful response
    res.json({
      success: true,
      response: response.content,
      provider,
      model,
      conversationId,
      usage: response.usage || null,
      responseTime: duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    const userError = formatErrorForUser(error);
    const statusCode = error.status || 500;
    
    res.status(statusCode).json({
      success: false,
      error: userError,
      provider: req.body.provider || 'unknown',
      model: req.body.model || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
});

// Get chat history (placeholder for future implementation)
router.get('/history', async (req, res) => {
  res.json({
    message: 'Chat history feature coming soon',
    conversations: []
  });
});

// Clear chat history (placeholder for future implementation)
router.delete('/history', async (req, res) => {
  res.json({
    message: 'Chat history cleared',
    success: true
  });
});

module.exports = router;