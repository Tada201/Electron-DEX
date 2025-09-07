// eDEX Chatbot - xAI (Grok) Provider
const axios = require('axios');
const { createHttpConfig, formatErrorForUser, validateApiKey } = require('../utils/helpers');

class XAIProvider {
  constructor() {
    this.name = 'xai';
    this.displayName = 'xAI (Grok)';
    this.description = 'xAI Grok models with real-time information access';
    this.baseUrl = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
    this.requiresApiKey = true;
    this.documentationUrl = 'https://docs.x.ai';
  }

  isConfigured() {
    return !!process.env.XAI_API_KEY;
  }

  getAvailableModels() {
    return [
      { id: 'grok-beta', name: 'Grok Beta', contextLength: 131072, multimodal: false },
      { id: 'grok-2', name: 'Grok 2', contextLength: 131072, multimodal: false },
      { id: 'grok-2-mini', name: 'Grok 2 Mini', contextLength: 131072, multimodal: false }
    ];
  }

  async testConnection(apiKey, model = 'grok-beta') {
    const startTime = Date.now();
    
    try {
      if (!validateApiKey('xai', apiKey)) {
        return {
          success: false,
          error: 'Invalid xAI API key format. Key should start with "xai-".',
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
    const apiKey = process.env.XAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('xAI API key not configured');
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
          throw new Error('xAI API key is invalid or expired');
        } else if (status === 429) {
          throw new Error('xAI rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to xAI API');
        } else {
          throw new Error(`xAI API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`xAI API error: ${error.message}`);
      }
    }
  }
}

module.exports = new XAIProvider();