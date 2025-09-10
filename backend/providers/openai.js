// eDEX Chatbot - OpenAI Provider
const axios = require('axios');
const { createHttpConfig, formatErrorForUser, validateApiKey } = require('../utils/helpers');

class OpenAIProvider {
  constructor() {
    this.name = 'openai';
    this.displayName = 'OpenAI';
    this.description = 'OpenAI GPT models including GPT-4o, GPT-4 Turbo, and GPT-3.5 Turbo';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.requiresApiKey = true;
    this.documentationUrl = 'https://platform.openai.com/docs';
  }

  /**
   * Check if the provider is configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Get available models
   * @returns {Array} List of available models
   */
  getAvailableModels() {
    return [
      { id: 'gpt-4o', name: 'GPT-4o', contextLength: 128000, multimodal: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextLength: 128000, multimodal: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextLength: 128000, multimodal: true },
      { id: 'gpt-4', name: 'GPT-4', contextLength: 8192, multimodal: false },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextLength: 16385, multimodal: false }
    ];
  }

  /**
   * Test connection to OpenAI API
   * @param {string} apiKey - API key to test
   * @param {string} model - Model to test (optional)
   * @returns {object} Test result
   */
  async testConnection(apiKey, model = 'gpt-3.5-turbo') {
    const startTime = Date.now();
    
    try {
      if (!validateApiKey('openai', apiKey)) {
        return {
          success: false,
          error: 'Invalid OpenAI API key format. Key should start with "sk-".',
          responseTime: Date.now() - startTime
        };
      }

      const client = axios.create(createHttpConfig(this.baseUrl));
      
      const response = await client.post('/chat/completions', {
        model: model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
   * Send message to OpenAI API
   * @param {string} model - Model to use
   * @param {string} message - Message to send
   * @param {object} config - Configuration options
   * @returns {object} Response from API
   */
  async sendMessage(model, message, config = {}) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

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
          throw new Error('OpenAI API key is invalid or expired');
        } else if (status === 429) {
          throw new Error('OpenAI rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to OpenAI API');
        } else {
          throw new Error(`OpenAI API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Network error: Unable to connect to OpenAI API');
      } else {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    }
  }
}

module.exports = new OpenAIProvider();