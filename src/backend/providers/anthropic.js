// eDEX Chatbot - Anthropic Provider
const axios = require('axios');
const { createHttpConfig, formatErrorForUser, validateApiKey } = require('../utils/helpers');

class AnthropicProvider {
  constructor() {
    this.name = 'anthropic';
    this.displayName = 'Anthropic';
    this.description = 'Anthropic Claude models including Claude 3.5 Sonnet, Claude 3 Haiku, and Claude 3 Opus';
    this.baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    this.requiresApiKey = true;
    this.documentationUrl = 'https://docs.anthropic.com';
  }

  /**
   * Check if the provider is configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  /**
   * Get available models
   * @returns {Array} List of available models
   */
  getAvailableModels() {
    return [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextLength: 200000, multimodal: true },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextLength: 200000, multimodal: true },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextLength: 200000, multimodal: true },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', contextLength: 200000, multimodal: true },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', contextLength: 200000, multimodal: true }
    ];
  }

  /**
   * Test connection to Anthropic API
   * @param {string} apiKey - API key to test
   * @param {string} model - Model to test (optional)
   * @returns {object} Test result
   */
  async testConnection(apiKey, model = 'claude-3-haiku-20240307') {
    const startTime = Date.now();
    
    try {
      if (!validateApiKey('anthropic', apiKey)) {
        return {
          success: false,
          error: 'Invalid Anthropic API key format. Key should start with "sk-ant-".',
          responseTime: Date.now() - startTime
        };
      }

      const client = axios.create(createHttpConfig(this.baseUrl));
      
      const response = await client.post('/v1/messages', {
        model: model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
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
   * Send message to Anthropic API
   * @param {string} model - Model to use
   * @param {string} message - Message to send
   * @param {object} config - Configuration options
   * @returns {object} Response from API
   */
  async sendMessage(model, message, config = {}) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const client = axios.create(createHttpConfig(this.baseUrl));

    const requestData = {
      model: model,
      messages: [{ role: 'user', content: message }],
      max_tokens: config.maxTokens || 2048,
      temperature: config.temperature || 0.7
    };

    // Add system prompt if provided
    if (config.systemPrompt) {
      requestData.system = config.systemPrompt;
    }

    try {
      const response = await client.post('/v1/messages', requestData, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      });

      const content = response.data.content[0];
      
      return {
        content: content.text,
        usage: {
          prompt_tokens: response.data.usage?.input_tokens || 0,
          completion_tokens: response.data.usage?.output_tokens || 0,
          total_tokens: (response.data.usage?.input_tokens || 0) + (response.data.usage?.output_tokens || 0)
        },
        finishReason: response.data.stop_reason,
        provider: this.name,
        model: model
      };

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw new Error('Anthropic API key is invalid or expired');
        } else if (status === 429) {
          throw new Error('Anthropic rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to Anthropic API');
        } else {
          throw new Error(`Anthropic API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Network error: Unable to connect to Anthropic API');
      } else {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
    }
  }
}

module.exports = new AnthropicProvider();