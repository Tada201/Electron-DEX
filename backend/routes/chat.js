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
const lmstudioProvider = require('../providers/lmstudio');

const { sanitizeInput, formatErrorForUser, validateConfig } = require('../utils/helpers');

const providers = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  mistral: mistralProvider,
  groq: groqProvider,
  xai: xaiProvider,
  lmstudio: lmstudioProvider,
};

// Stream message to LLM (new streaming endpoint)
router.get('/stream', async (req, res) => {
  const {
    message,
    provider = 'openai',
    model = 'gpt-4o',
    config = '{}'
  } = req.query;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    // Parse config
    const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;

    // Validate input
    if (!message || typeof message !== 'string') {
      res.write(`data: ${JSON.stringify({ error: 'Invalid input', message: 'Message is required and must be a string' })}\n\n`);
      return res.end();
    }

    // Sanitize input
    const cleanMessage = sanitizeInput(message);
    if (!cleanMessage) {
      res.write(`data: ${JSON.stringify({ error: 'Invalid input', message: 'Message cannot be empty' })}\n\n`);
      return res.end();
    }

    // Validate provider
    if (!providers[provider]) {
      res.write(`data: ${JSON.stringify({
        error: 'Invalid provider',
        message: `Provider '${provider}' is not supported`,
        availableProviders: Object.keys(providers)
      })}\n\n`);
      return res.end();
    }

    // Validate configuration
    const configValidation = validateConfig(parsedConfig);
    if (!configValidation.isValid) {
      res.write(`data: ${JSON.stringify({
        error: 'Invalid configuration',
        message: 'Configuration validation failed',
        errors: configValidation.errors
      })}\n\n`);
      return res.end();
    }

    // Generate conversation ID
    const conversationId = uuidv4();
    const startTime = Date.now();

    // Check if provider supports streaming
    if (providers[provider].supportsStreaming && providers[provider].supportsStreaming()) {
      // Use native streaming for providers that support it
      await providers[provider].streamMessage(model, cleanMessage, {
        ...parsedConfig,
        conversationId,
        userId: req.ip,
      }, (chunk) => {
        // Check if client is still connected before sending
        if (!res.closed) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      }, () => {
        // Check if client is still connected before sending completion
        if (!res.closed) {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        }
      });
    } else {
      // Simulate streaming for non-streaming providers
      try {
        const response = await providers[provider].sendMessage(model, cleanMessage, {
          ...parsedConfig,
          conversationId,
          userId: req.ip,
        });
        
        // Split response into tokens (words for simulation)
        const tokens = response.content.split(/(\s+)/).filter(token => token.trim() !== '');
        
        // Send tokens with delay to simulate streaming
        for (let i = 0; i < tokens.length; i++) {
          // Check if client is still connected
          if (res.closed) {
            break;
          }
          
          // Send token
          res.write(`data: ${JSON.stringify({
            content: tokens[i],
            provider,
            model,
            conversationId,
            usage: response.usage,
            finishReason: response.finishReason,
          })}\n\n`);
          
          // Small delay between tokens (adjust as needed)
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        // Send completion signal if client is still connected
        if (!res.closed) {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        }
      } catch (providerError) {
        // Handle provider-specific errors
        if (!res.closed) {
          res.write(`data: ${JSON.stringify({
            error: formatErrorForUser(providerError),
            provider,
            model,
            timestamp: new Date().toISOString()
          })}\n\n`);
          res.end();
        }
      }
    }
  } catch (error) {
    console.error('❌ Stream error:', error);
    // Only send error if client is still connected
    if (!res.closed) {
      res.write(`data: ${JSON.stringify({
        error: formatErrorForUser(error),
        provider: req.query.provider || 'unknown',
        model: req.query.model || 'unknown',
        timestamp: new Date().toISOString()
      })}\n\n`);
      res.end();
    }
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
