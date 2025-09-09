// eDEX Chatbot - Chat Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Database models
const { db } = require('../utils/database');

// Supabase integration
const { 
  supabase, 
  fetchChats, 
  saveChat, 
  createNewChat, 
  getChatById, 
  deleteChat 
} = require('../utils/supabase');

const openaiProvider = require('../providers/openai');
const anthropicProvider = require('../providers/anthropic');
const googleProvider = require('../providers/google');
const mistralProvider = require('../providers/mistral');
const groqProvider = require('../providers/groq');
const xaiProvider = require('../providers/xai');
const toolsProvider = require('../providers/tools');

const { sanitizeInput, formatErrorForUser, validateConfig } = require('../utils/helpers');

// Provider map
const providers = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  mistral: mistralProvider,
  groq: groqProvider,
  xai: xaiProvider,
  tools: toolsProvider
};

// Create new chat
router.post('/new', async (req, res) => {
  try {
    const { title = 'New Chat', userId = 'default' } = req.body;
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      const chat = await createNewChat(title, userId);
      return res.json({
        success: true,
        chat: {
          id: chat.id,
          title: chat.title,
          userId: userId,
          createdAt: chat.created_at,
          updatedAt: chat.updated_at
        }
      });
    } else {
      // Check if database models are available
      if (!db.Chat) {
        return res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          message: 'Database models not initialized. Please try again later.'
        });
      }
      
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
    }
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
    const { userId = 'default' } = req.query;
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      const chat = await getChatById(id, userId);
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
          createdAt: chat.created_at,
          updatedAt: chat.updated_at
        }
      });
    } else {
      // Check if database models are available
      if (!db.Chat || !db.Message) {
        return res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          message: 'Database models not initialized. Please try again later.'
        });
      }
      
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
    }
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
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      const chats = await fetchChats(userId);
      res.json({
        success: true,
        chats: chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.created_at,
          updatedAt: chat.updated_at
        }))
      });
    } else {
      // Check if database models are available
      if (!db.Chat) {
        return res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          message: 'Database models not initialized. Please try again later.'
        });
      }
      
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
    }
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
    const { title, userId = 'default' } = req.body;
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      const { data, error } = await supabase
        .from('chats')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select();
      
      if (error || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Chat not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Chat updated successfully'
      });
    } else {
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
    }
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
    const { userId = 'default' } = req.query;
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      await deleteChat(id, userId);
      
      res.json({
        success: true,
        message: 'Chat deleted successfully'
      });
    } else {
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
    }
  } catch (error) {
    console.error('❌ Chat deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat'
    });
  }
});

// Send message to LLM with streaming support
router.post('/send', async (req, res) => {
  try {
    const {
      message,
      provider = 'openai',
      model = 'gpt-4o',
      config = {},
      stream = false
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
    if (supabase) {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          id: uuidv4(),
          chat_id: conversationId,
          role: 'user',
          content: cleanMessage,
          provider,
          model,
          created_at: new Date().toISOString()
        });
      
      if (messageError) {
        console.error('❌ Failed to save user message:', messageError);
      }
    } else {
      // Check if database models are available
      if (!db.Message) {
        console.warn('⚠️ Database models not available, skipping message save');
      } else {
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
      }
    }

    if (stream) {
      // Streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let fullContent = '';
      let usage = null;
      const startTime = Date.now();

      try {
        // Send message to provider with streaming callback
        await providers[provider].sendMessage(model, cleanMessage, {
          ...config,
          conversationId,
          userId: req.ip,
        }, async (chunk) => {
          if (chunk.type === 'content') {
            fullContent += chunk.content;
            // Send chunk to client
            res.write(`data: ${JSON.stringify({ type: 'content', content: chunk.content })}\n\n`);
          } else if (chunk.type === 'done') {
            usage = chunk.usage;
            // Send completion message
            res.write(`data: ${JSON.stringify({ type: 'done', content: fullContent, usage })}\n\n`);
          }
        });

        const duration = Date.now() - startTime;

        // Save AI response to database
        if (supabase) {
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              id: uuidv4(),
              chat_id: conversationId,
              role: 'assistant',
              content: fullContent,
              provider,
              model,
              tokens: usage?.totalTokens || null,
              created_at: new Date().toISOString()
            });
          
          if (messageError) {
            console.error('❌ Failed to save AI response:', messageError);
          }
        } else {
          // Check if database models are available
          if (!db.Message) {
            console.warn('⚠️ Database models not available, skipping AI message save');
          } else {
            await db.Message.create({
              chatId: conversationId,
              role: 'assistant',
              content: fullContent,
              provider,
              model,
              tokens: usage?.totalTokens || null,
              meta: {
                receivedAt: new Date().toISOString(),
                responseTime: duration
              }
            });
          }
        }

        // End the response
        res.end();
      } catch (error) {
        console.error('❌ Streaming chat error:', error);
        const userError = formatErrorForUser(error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: userError })}\n\n`);
        res.end();
      }
    } else {
      // Non-streaming response (existing behavior)
      const startTime = Date.now();
      const response = await providers[provider].sendMessage(model, cleanMessage, {
        ...config,
        conversationId,
        userId: req.ip,
      });

      const duration = Date.now() - startTime;

      console.log(`✅ Response received in ${duration}ms from ${provider}/${model}`);

      // Save AI response to database
      if (supabase) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            id: uuidv4(),
            chat_id: conversationId,
            role: 'assistant',
            content: response.content,
            provider,
            model,
            tokens: response.usage?.totalTokens || null,
            created_at: new Date().toISOString()
          });
        
        if (messageError) {
          console.error('❌ Failed to save AI response:', messageError);
        }
      } else {
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
      }

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
    }
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
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      const { data, error } = await supabase
        .from('chats')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      res.json({
        success: true,
        chats: data.map(chat => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.created_at,
          updatedAt: chat.updated_at
        }))
      });
    } else {
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
    }
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
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      // Delete all chats and messages for user
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('chat_id', 
          (await supabase
            .from('chats')
            .select('id')
            .eq('user_id', userId)
          ).data.map(chat => chat.id)
        );
      
      if (messagesError) throw messagesError;
      
      const { error: chatsError } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', userId);
      
      if (chatsError) throw chatsError;
      
      res.json({
        success: true,
        message: 'Chat history cleared'
      });
    } else {
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
    }
  } catch (error) {
    console.error('❌ Chat history clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history'
    });
  }
});

// OpenAI-compatible chat completion endpoint with streaming support and tool calling
router.post('/completions', async (req, res) => {
  try {
    const {
      model = 'gpt-4o',
      messages = [],
      stream = false,
      temperature = 0.7,
      max_tokens = 2048,
      provider = 'openai',
      tools = null, // Tool definitions
      tool_choice = 'auto' // Tool choice strategy
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
      if (supabase) {
        const chat = await createNewChat(chatTitle, 'default');
        chatId = chat.id;
      } else {
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
    }

    // Save user messages to database
    for (const message of messages) {
      if (message.role === 'user' || message.role === 'assistant' || message.role === 'system' || message.role === 'tool') {
        if (supabase) {
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              id: uuidv4(),
              chat_id: chatId,
              role: message.role,
              content: message.content,
              provider: message.provider || provider,
              model: message.model || model,
              created_at: new Date().toISOString()
            });
          
          if (messageError) {
            console.error('❌ Failed to save message:', messageError);
          }
        } else {
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
    }

    // If tools are provided, modify the system prompt to include tool calling instructions
    let enhancedMessages = [...messages];
    if (tools && tools.length > 0) {
      // Generate tool calling prompt using the tools provider
      const toolCallingInstruction = toolsProvider.generateToolCallingPrompt(tools);
      
      // Add tool calling instruction to system message or create one
      const systemMessageIndex = enhancedMessages.findIndex(msg => msg.role === 'system');
      if (systemMessageIndex !== -1) {
        enhancedMessages[systemMessageIndex].content += '\n\n' + toolCallingInstruction;
      } else {
        enhancedMessages.unshift({
          role: 'system',
          content: toolCallingInstruction
        });
      }
    }

    if (stream) {
      // Streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let fullContent = '';
      let usage = null;
      const startTime = Date.now();
      let messageId = null;

      try {
        // Create message entry for AI response
        if (supabase) {
          const { data, error: messageError } = await supabase
            .from('messages')
            .insert({
              id: uuidv4(),
              chat_id: chatId,
              role: 'assistant',
              content: '',
              provider,
              model,
              tokens: null,
              created_at: new Date().toISOString()
            })
            .select();
          
          if (messageError) throw messageError;
          messageId = data[0].id;
        } else {
          const aiMessage = await db.Message.create({
            chatId,
            role: 'assistant',
            content: '',
            provider,
            model,
            tokens: null,
            meta: {
              receivedAt: new Date().toISOString(),
              responseTime: 0
            }
          });
          
          messageId = aiMessage.id;
        }

        // Send message to provider with streaming callback
        await providers[provider].sendMessage(model, lastUserMessage.content, {
          temperature,
          max_tokens,
          conversationId: chatId,
          userId: req.ip,
          history: enhancedMessages
        }, async (chunk) => {
          if (chunk.type === 'content') {
            fullContent += chunk.content;
            // Send chunk to client in OpenAI format
            const chunkData = {
              id: `chatcmpl-${messageId}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: model,
              choices: [{
                index: 0,
                delta: {
                  role: 'assistant',
                  content: chunk.content
                },
                finish_reason: null
              }]
            };
            res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
          } else if (chunk.type === 'done') {
            usage = chunk.usage;
            // Send final chunk with finish reason
            const finalChunk = {
              id: `chatcmpl-${messageId}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: model,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: 'stop'
              }]
            };
            res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
            res.write('data: [DONE]\n\n');
          }
        });

        const duration = Date.now() - startTime;

        // Process tool calls if present
        const toolCalls = toolsProvider.processToolCalls(fullContent);
        if (toolCalls) {
          // Execute tools and append results to messages
          for (const toolCall of toolCalls.tool_calls) {
            try {
              const toolResult = await toolsProvider.executeTool(toolCall.name, toolCall.parameters);
              enhancedMessages.push({
                role: 'assistant',
                content: fullContent
              });
              enhancedMessages.push({
                role: 'tool',
                content: JSON.stringify(toolResult),
                name: toolCall.name
              });
              
              // Send tool result to client
              const toolChunk = {
                id: `chatcmpl-${messageId}`,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{
                  index: 0,
                  delta: {
                    role: 'tool',
                    content: JSON.stringify(toolResult)
                  },
                  finish_reason: null
                }]
              };
              res.write(`data: ${JSON.stringify(toolChunk)}\n\n`);
            } catch (toolError) {
              console.error('❌ Tool execution error:', toolError);
              // Send error to client
              const errorChunk = {
                id: `chatcmpl-${messageId}`,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{
                  index: 0,
                  delta: {
                    role: 'tool',
                    content: `Error executing tool: ${toolError.message}`
                  },
                  finish_reason: null
                }]
              };
              res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
            }
          }
          
          // Get final response after tool execution
          const finalResponse = await providers[provider].sendMessage(model, lastUserMessage.content, {
            temperature,
            max_tokens,
            conversationId: chatId,
            userId: req.ip,
            history: enhancedMessages
          });
          
          // Send final response
          const finalResponseChunk = {
            id: `chatcmpl-${messageId}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{
              index: 0,
              delta: {
                role: 'assistant',
                content: finalResponse.content
              },
              finish_reason: 'stop'
            }]
          };
          res.write(`data: ${JSON.stringify(finalResponseChunk)}\n\n`);
          fullContent += '\n\n' + finalResponse.content;
        }

        // Update AI message with full content and metadata
        if (supabase) {
          const { error: updateError } = await supabase
            .from('messages')
            .update({
              content: fullContent,
              tokens: usage?.totalTokens || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', messageId);
          
          if (updateError) {
            console.error('❌ Failed to update AI message:', updateError);
          }
        } else {
          await db.Message.update({
            content: fullContent,
            tokens: usage?.totalTokens || null,
            meta: {
              receivedAt: new Date().toISOString(),
              responseTime: duration
            }
          }, {
            where: { id: messageId }
          });
        }

        // Update chat title if it's the first message
        if (messages.length === 1) {
          if (supabase) {
            const { error: updateError } = await supabase
              .from('chats')
              .update({
                title: lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : ''),
                updated_at: new Date().toISOString()
              })
              .eq('id', chatId);
            
            if (updateError) {
              console.error('❌ Failed to update chat title:', updateError);
            }
          } else {
            await db.Chat.update(
              { title: lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : '') },
              { where: { id: chatId } }
            );
          }
        }

        // End the response
        res.end();
      } catch (error) {
        console.error('❌ Streaming completion error:', error);
        const userError = formatErrorForUser(error);
        res.write(`data: ${JSON.stringify({
          error: {
            message: userError,
            type: 'api_error',
            param: null,
            code: 'chat_completion_failed'
          }
        })}\n\n`);
        res.end();
      }
    } else {
      // Non-streaming response (existing behavior)
      const startTime = Date.now();
      const response = await providers[provider].sendMessage(model, lastUserMessage.content, {
        temperature,
        max_tokens,
        conversationId: chatId,
        userId: req.ip,
        history: enhancedMessages
      });

      const duration = Date.now() - startTime;

      // Process tool calls if present
      let finalContent = response.content;
      const toolCalls = toolsProvider.processToolCalls(response.content);
      if (toolCalls) {
        // Execute tools and append results to messages
        for (const toolCall of toolCalls.tool_calls) {
          try {
            const toolResult = await toolsProvider.executeTool(toolCall.name, toolCall.parameters);
            enhancedMessages.push({
              role: 'assistant',
              content: response.content
            });
            enhancedMessages.push({
              role: 'tool',
              content: JSON.stringify(toolResult),
              name: toolCall.name
            });
          } catch (toolError) {
            console.error('❌ Tool execution error:', toolError);
            enhancedMessages.push({
              role: 'tool',
              content: `Error executing tool: ${toolError.message}`,
              name: toolCall.name
            });
          }
        }
        
        // Get final response after tool execution
        const finalResponse = await providers[provider].sendMessage(model, lastUserMessage.content, {
          temperature,
          max_tokens,
          conversationId: chatId,
          userId: req.ip,
          history: enhancedMessages
        });
        
        finalContent = response.content + '\n\n' + finalResponse.content;
      }

      // Save AI response to database
      let aiMessageId;
      if (supabase) {
        const { data, error: messageError } = await supabase
          .from('messages')
          .insert({
            id: uuidv4(),
            chat_id: chatId,
            role: 'assistant',
            content: finalContent,
            provider,
            model,
            tokens: response.usage?.totalTokens || null,
            created_at: new Date().toISOString()
          })
          .select();
        
        if (messageError) {
          console.error('❌ Failed to save AI response:', messageError);
        } else {
          aiMessageId = data[0].id;
        }
      } else {
        const aiMessage = await db.Message.create({
          chatId,
          role: 'assistant',
          content: finalContent,
          provider,
          model,
          tokens: response.usage?.totalTokens || null,
          meta: {
            receivedAt: new Date().toISOString(),
            responseTime: duration
          }
        });
        aiMessageId = aiMessage.id;
      }

      // Update chat title if it's the first message
      if (messages.length === 1) {
        if (supabase) {
          const { error: updateError } = await supabase
            .from('chats')
            .update({
              title: lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : ''),
              updated_at: new Date().toISOString()
            })
            .eq('id', chatId);
          
          if (updateError) {
            console.error('❌ Failed to update chat title:', updateError);
          }
        } else {
          await db.Chat.update(
            { title: lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : '') },
            { where: { id: chatId } }
          );
        }
      }

      // Return response in OpenAI format
      const completionResponse = {
        id: `chatcmpl-${aiMessageId}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: finalContent
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
    }
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