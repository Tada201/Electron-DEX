// eDEX Chatbot - Chat Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Database models
const { db } = require('../utils/database');

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

// Create new chat
router.post('/new', async (req, res) => {
  try {
    const { title = 'New Chat', userId = 'default' } = req.body;
    
    // Create new chat in database
    const chat = await db.Chat.create({
      title,
      userId,
      meta: {
        createdAt: new Date().toISOString()
      }
    });
    
    res.json({
      success: true,
      chat: {
        id: chat.id,
        title: chat.title,
        userId: chat.userId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Chat creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat'
    });
  }
});

// Get chat by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find chat in database
    const chat = await db.Chat.findByPk(id, {
      include: [{
        model: db.Message,
        as: 'messages',
        order: [['createdAt', 'ASC']]
      }]
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      chat: {
        id: chat.id,
        title: chat.title,
        messages: chat.messages || [],
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Chat retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat'
    });
  }
});

// Get all chats
router.get('/', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    // Find all chats for user
    const chats = await db.Chat.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: 50
    });
    
    res.json({
      success: true,
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Chats retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chats'
    });
  }
});

// Update chat title
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    // Update chat in database
    const [updated] = await db.Chat.update(
      { title },
      { where: { id } }
    );
    
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Chat updated successfully'
    });
  } catch (error) {
    console.error('❌ Chat update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chat'
    });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete chat and associated messages
    await db.Message.destroy({ where: { chatId: id } });
    const deleted = await db.Chat.destroy({ where: { id } });
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('❌ Chat deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat'
    });
  }
});

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

    // Save user message to database
    await db.Message.create({
      chatId: conversationId,
      role: 'user',
      content: cleanMessage,
      provider,
      model,
      meta: {
        sentAt: new Date().toISOString()
      }
    });

    // Send message to provider
    const startTime = Date.now();
    const response = await providers[provider].sendMessage(model, cleanMessage, {
      ...config,
      conversationId,
      userId: req.ip, // Simple user identification
    });

    const duration = Date.now() - startTime;

    console.log(`✅ Response received in ${duration}ms from ${provider}/${model}`);

    // Save AI response to database
    await db.Message.create({
      chatId: conversationId,
      role: 'assistant',
      content: response.content,
      provider,
      model,
      tokens: response.usage?.totalTokens || null,
      meta: {
        receivedAt: new Date().toISOString(),
        responseTime: duration
      }
    });

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

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const { userId = 'default', limit = 50, offset = 0 } = req.query;
    
    // Find all chats for user
    const chats = await db.Chat.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history'
    });
  }
});

// Clear chat history
router.delete('/history', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    // Delete all chats and messages for user
    await db.Message.destroy({
      where: {
        '$chat.userId$': userId
      },
      include: [{
        model: db.Chat,
        as: 'chat'
      }]
    });
    
    await db.Chat.destroy({ where: { userId } });
    
    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    console.error('❌ Chat history clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history'
    });
  }
});

// OpenAI-compatible chat completion endpoint
router.post('/completions', async (req, res) => {
  try {
    const {
      model = 'gpt-4o',
      messages = [],
      stream = false,
      temperature = 0.7,
      max_tokens = 2048,
      provider = 'openai'
    } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: {
          message: 'Messages are required and must be an array',
          type: 'invalid_request_error',
          param: 'messages',
          code: 'messages_required'
        }
      });
    }

    // Get the last user message
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    if (!lastUserMessage) {
      return res.status(400).json({
        error: {
          message: 'At least one user message is required',
          type: 'invalid_request_error',
          param: 'messages',
          code: 'user_message_required'
        }
      });
    }

    // Validate provider
    if (!providers[provider]) {
      return res.status(400).json({
        error: {
          message: `Provider '${provider}' is not supported`,
          type: 'invalid_request_error',
          param: 'provider',
          code: 'provider_not_supported'
        }
      });
    }

    // Create or find chat
    let chatId = req.body.chat_id;
    if (!chatId) {
      const chatTitle = messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : '');
      const chat = await db.Chat.create({
        title: chatTitle,
        userId: 'default',
        meta: {
          createdAt: new Date().toISOString(),
          model,
          provider
        }
      });
      chatId = chat.id;
    }

    // Save user messages to database
    for (const message of messages) {
      if (message.role === 'user' || message.role === 'assistant' || message.role === 'system') {
        await db.Message.create({
          chatId,
          role: message.role,
          content: message.content,
          provider: message.provider || provider,
          model: message.model || model,
          meta: {
            sentAt: new Date().toISOString()
          }
        });
      }
    }

    // Send message to provider
    const startTime = Date.now();
    const response = await providers[provider].sendMessage(model, lastUserMessage.content, {
      temperature,
      max_tokens,
      conversationId: chatId,
      userId: req.ip,
      history: messages
    });

    const duration = Date.now() - startTime;

    // Save AI response to database
    const aiMessage = await db.Message.create({
      chatId,
      role: 'assistant',
      content: response.content,
      provider,
      model,
      tokens: response.usage?.totalTokens || null,
      meta: {
        receivedAt: new Date().toISOString(),
        responseTime: duration
      }
    });

    // Update chat title if it's the first message
    if (messages.length === 1) {
      await db.Chat.update(
        { title: lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : '') },
        { where: { id: chatId } }
      );
    }

    // Return response in OpenAI format
    const completionResponse = {
      id: `chatcmpl-${aiMessage.id}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.content
        },
        finish_reason: 'stop'
      }],
      usage: response.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };

    res.json(completionResponse);
  } catch (error) {
    console.error('❌ Chat completion error:', error);
    
    const userError = formatErrorForUser(error);
    const statusCode = error.status || 500;
    
    res.status(statusCode).json({
      error: {
        message: userError,
        type: 'api_error',
        param: null,
        code: 'chat_completion_failed'
      }
    });
  }
});

module.exports = router;