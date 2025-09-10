// eDEX Chatbot - LM Studio Provider
const axios = require('axios');
const { createHttpConfig, formatErrorForUser, validateApiKey } = require('../utils/helpers');

class LMStudioProvider {
  constructor() {
    this.name = 'lmstudio';
    this.displayName = 'LM Studio';
    this.description = 'Local LLM models running in LM Studio with OpenAI-compatible API';
    this.baseUrl = process.env.LMSTUDIO_URL || 'http://localhost:1234/v1';
    this.requiresApiKey = false; // LM Studio doesn't require API key by default
    this.documentationUrl = 'https://lmstudio.ai/docs';
    this.cachedModels = null;
    this.lastModelFetch = 0;
    this.modelCacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if the provider is configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    // LM Studio is always "configured" since it runs locally
    return true;
  }

  /**
   * Check if provider supports streaming
   * @returns {boolean} Streaming support status
   */
  supportsStreaming() {
    return true;
  }

  /**
   * Get available models from LM Studio API
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    const now = Date.now();
    
    // Return cached models if still valid
    if (this.cachedModels && (now - this.lastModelFetch) < this.modelCacheDuration) {
      return this.cachedModels;
    }
    
    try {
      const apiKey = process.env.LMSTUDIO_API_KEY || 'lm-studio';
      const client = axios.create(createHttpConfig(this.baseUrl));
      
      const response = await client.get('/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Transform the response to match our expected format
      const models = (response.data.data || response.data.models || [])
        .filter(model => model.id) // Ensure model has an ID
        .map(model => ({
          id: model.id,
          name: model.id.split('/').pop() || model.id, // Extract name from ID
          contextLength: model.context_length || model.max_context_length || 8192,
          multimodal: model.multimodal || false
        }));
      
      // Cache the results
      this.cachedModels = models;
      this.lastModelFetch = now;
      
      return models;
    } catch (error) {
      console.warn('Failed to fetch LM Studio models:', error.message);
      // Return default models if API call fails
      return [
        { id: 'lmstudio-community/Meta-Llama-3-8B-Instruct', name: 'Meta-Llama-3-8B-Instruct', contextLength: 8192, multimodal: false },
        { id: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF', name: 'Mistral-7B-Instruct-v0.2', contextLength: 32768, multimodal: false },
        { id: 'lmstudio-community/Phi-3-mini-4k-instruct', name: 'Phi-3-mini-4k-instruct', contextLength: 4096, multimodal: false }
      ];
    }
  }

  /**
   * Test connection to LM Studio API
   * @param {string} apiKey - API key to test (optional for LM Studio)
   * @param {string} model - Model to test (optional)
   * @returns {object} Test result
   */
  async testConnection(apiKey = null, model = null) {
    const startTime = Date.now();
    const testApiKey = apiKey || process.env.LMSTUDIO_API_KEY || 'lm-studio';
    
    try {
      const client = axios.create(createHttpConfig(this.baseUrl));
      
      // Try to get models to test connection
      const response = await client.get('/models', {
        headers: {
          'Authorization': `Bearer ${testApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.status === 200,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: formatErrorForUser(error),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Send message to LM Studio API
   * @param {string} model - Model to use
   * @param {string} message - Message to send
   * @param {object} config - Configuration options
   * @returns {object} Response from API
   */
  async sendMessage(model, message, config = {}) {
    const apiKey = process.env.LMSTUDIO_API_KEY || 'lm-studio';
    const client = axios.create(createHttpConfig(this.baseUrl));

    const messages = [];
    
    // Add system prompt if provided
    if (config.systemPrompt) {
      messages.push({ role: 'system', content: config.systemPrompt });
    }

    // Add user message
    messages.push({ role: 'user', content: message });

    const requestData = {
      model: model,
      messages: messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2048,
      top_p: config.topP || 1.0,
      frequency_penalty: config.frequencyPenalty || 0,
      presence_penalty: config.presencePenalty || 0
    };

    try {
      const response = await client.post('/chat/completions', requestData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const choice = response.data.choices[0];
      
      return {
        content: choice.message.content,
        usage: response.data.usage,
        finishReason: choice.finish_reason,
        provider: this.name,
        model: model
      };

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw new Error('LM Studio API key is invalid');
        } else if (status === 429) {
          throw new Error('LM Studio rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to LM Studio API');
        } else {
          throw new Error(`LM Studio API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Network error: Unable to connect to LM Studio API. Please ensure LM Studio is running.');
      } else {
        throw new Error(`LM Studio API error: ${error.message}`);
      }
    }
  }

  /**
   * Stream message from LM Studio API
   * @param {string} model - Model to use
   * @param {string} message - Message to send
   * @param {object} config - Configuration options
   * @param {function} onChunk - Callback for each chunk
   * @param {function} onComplete - Callback when complete
   */
  async streamMessage(model, message, config = {}, onChunk, onComplete) {
    const apiKey = process.env.LMSTUDIO_API_KEY || 'lm-studio';
    const client = axios.create(createHttpConfig(this.baseUrl));

    const messages = [];
    
    // Add system prompt if provided
    if (config.systemPrompt) {
      messages.push({ role: 'system', content: config.systemPrompt });
    }

    // Add user message
    messages.push({ role: 'user', content: message });

    const requestData = {
      model: model,
      messages: messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2048,
      top_p: config.topP || 1.0,
      frequency_penalty: config.frequencyPenalty || 0,
      presence_penalty: config.presencePenalty || 0,
      stream: true // Enable streaming
    };

    try {
      const response = await client.post('/chat/completions', requestData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });

      let buffer = '';
      
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        
        // Process complete lines
        let lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line === 'data: [DONE]') {
            onComplete();
            return;
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
              const content = data.choices?.[0]?.delta?.content || '';
              
              if (content) {
                onChunk({
                  content,
                  provider: this.name,
                  model,
                  conversationId: config.conversationId,
                  usage: data.usage || null,
                  finishReason: data.choices?.[0]?.finish_reason || null
                });
              }
            } catch (parseError) {
              // Ignore parsing errors for incomplete JSON
              continue;
            }
          }
        }
      });

      response.data.on('end', () => {
        // Process any remaining data in buffer
        if (buffer.trim()) {
          if (buffer === 'data: [DONE]') {
            onComplete();
          } else if (buffer.startsWith('data: ')) {
            try {
              const data = JSON.parse(buffer.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              
              if (content) {
                onChunk({
                  content,
                  provider: this.name,
                  model,
                  conversationId: config.conversationId,
                  usage: data.usage || null,
                  finishReason: data.choices?.[0]?.finish_reason || null
                });
              }
            } catch (parseError) {
              // Ignore parsing errors
            }
          }
        }
        onComplete();
      });

      response.data.on('error', (error) => {
        throw error;
      });

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw new Error('LM Studio API key is invalid');
        } else if (status === 429) {
          throw new Error('LM Studio rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to LM Studio API');
        } else {
          throw new Error(`LM Studio API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Network error: Unable to connect to LM Studio API. Please ensure LM Studio is running.');
      } else {
        throw new Error(`LM Studio API error: ${error.message}`);
      }
    }
  }
}

module.exports = new LMStudioProvider();