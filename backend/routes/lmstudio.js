// eDEX Chatbot - LM Studio Routes
const express = require('express');
const router = express.Router();
const lmstudioProvider = require('../providers/lmstudio');
const { formatErrorForUser } = require('../utils/helpers');

// Get available models from LM Studio
router.get('/models', async (req, res) => {
  try {
    console.log('📥 Fetching LM Studio models');
    
    // Test connection first
    const testResult = await lmstudioProvider.testConnection();
    
    if (!testResult.success) {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to LM Studio',
        message: testResult.error || 'Please ensure LM Studio is running with API server enabled'
      });
    }

    // If connection successful, get models
    const models = lmstudioProvider.getAvailableModels();
    
    res.json({
      success: true,
      models: models,
      count: models.length
    });
  } catch (error) {
    console.error('❌ Error fetching LM Studio models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      message: formatErrorForUser(error)
    });
  }
});

// Proxy chat completions to LM Studio
router.post('/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens } = req.body;
    
    console.log(`📤 LM Studio chat request: ${model}`);
    
    if (!model) {
      return res.status(400).json({
        error: 'Missing model',
        message: 'Model parameter is required'
      });
    }
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid messages',
        message: 'Messages must be an array'
      });
    }
    
    const apiKey = process.env.LMSTUDIO_API_KEY || 'lm-studio';
    
    // Forward request to LM Studio
    const response = await lmstudioProvider.sendMessage(model, messages[messages.length - 1].content, {
      temperature,
      maxTokens: max_tokens
    });
    
    console.log(`✅ LM Studio response received for model: ${model}`);
    
    res.json({
      success: true,
      response: response.content,
      usage: response.usage,
      provider: 'lmstudio',
      model: model
    });
    
  } catch (error) {
    console.error('❌ LM Studio chat error:', error);
    
    const userError = formatErrorForUser(error);
    const statusCode = error.status || 500;
    
    res.status(statusCode).json({
      success: false,
      error: userError,
      provider: 'lmstudio',
      message: error.message
    });
  }
});

module.exports = router;