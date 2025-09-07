// eDEX Chatbot - Mistral AI Provider
const axios = require('axios');
const { createHttpConfig, formatErrorForUser, validateApiKey } = require('../utils/helpers');

class MistralProvider {
  constructor() {
    this.name = 'mistral';
    this.displayName = 'Mistral AI';
    this.description = 'Mistral AI models including Mistral Large, Medium, and Small';
    this.baseUrl = process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1';
    this.requiresApiKey = true;
    this.documentationUrl = 'https://docs.mistral.ai';
  }

  isConfigured() {
    return !!process.env.MISTRAL_API_KEY;
  }

  getAvailableModels() {
    return [
      { id: 'mistral-large-latest', name: 'Mistral Large', contextLength: 128000, multimodal: false },
      { id: 'mistral-medium', name: 'Mistral Medium', contextLength: 32768, multimodal: false },
      { id: 'mistral-small', name: 'Mistral Small', contextLength: 32768, multimodal: false },
      { id: 'open-mistral-7b', name: 'Open Mistral 7B', contextLength: 32768, multimodal: false },
      { id: 'open-mixtral-8x7b', name: 'Open Mixtral 8x7B', contextLength: 32768, multimodal: false },
      { id: 'open-mixtral-8x22b', name: 'Open Mixtral 8x22B', contextLength: 65536, multimodal: false }
    ];
  }

  async testConnection(apiKey, model = 'mistral-small') {
    const startTime = Date.now();
    
    try {
      if (!validateApiKey('mistral', apiKey)) {
        return {
          success: false,
          error: 'Invalid Mistral API key format.',
          responseTime: Date.now() - startTime
        };
      }

      const client = axios.create(createHttpConfig(this.baseUrl));
      
      const response = await client.post('/chat/completions', {
        model: model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
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

  async sendMessage(model, message, config = {}) {
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const client = axios.create(createHttpConfig(this.baseUrl));

    const messages = [];
    if (config.systemPrompt) {
      messages.push({ role: 'system', content: config.systemPrompt });
    }
    messages.push({ role: 'user', content: message });

    const requestData = {
      model: model,
      messages: messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2048,
      top_p: config.topP || 1.0
    };

    try {
      const response = await client.post('/chat/completions', requestData, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
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
          throw new Error('Mistral API key is invalid or expired');
        } else if (status === 429) {
          throw new Error('Mistral rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.message || 'Invalid request to Mistral API');
        } else {
          throw new Error(`Mistral API error (${status}): ${data.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`Mistral API error: ${error.message}`);
      }
    }
  }
}

module.exports = new MistralProvider();