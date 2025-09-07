// eDEX Chatbot - Groq Provider
const axios = require('axios');
const { createHttpConfig, formatErrorForUser, validateApiKey } = require('../utils/helpers');

class GroqProvider {
  constructor() {
    this.name = 'groq';
    this.displayName = 'Groq';
    this.description = 'Groq fast inference for Llama, Mixtral, and Gemma models';
    this.baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
    this.requiresApiKey = true;
    this.documentationUrl = 'https://console.groq.com/docs';
  }

  isConfigured() {
    return !!process.env.GROQ_API_KEY;
  }

  getAvailableModels() {
    return [
      { id: 'llama3-70b-8192', name: 'Llama 3 70B', contextLength: 8192, multimodal: false },
      { id: 'llama3-8b-8192', name: 'Llama 3 8B', contextLength: 8192, multimodal: false },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextLength: 32768, multimodal: false },
      { id: 'gemma-7b-it', name: 'Gemma 7B IT', contextLength: 8192, multimodal: false },
      { id: 'llama2-70b-4096', name: 'Llama 2 70B', contextLength: 4096, multimodal: false }
    ];
  }

  async testConnection(apiKey, model = 'llama3-8b-8192') {
    const startTime = Date.now();
    
    try {
      if (!validateApiKey('groq', apiKey)) {
        return {
          success: false,
          error: 'Invalid Groq API key format. Key should start with "gsk_".',
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
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
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
          throw new Error('Groq API key is invalid or expired');
        } else if (status === 429) {
          throw new Error('Groq rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to Groq API');
        } else {
          throw new Error(`Groq API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`Groq API error: ${error.message}`);
      }
    }
  }
}

module.exports = new GroqProvider();