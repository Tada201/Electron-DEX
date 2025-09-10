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

  /**
   * Check if provider supports streaming
   * @returns {boolean} Streaming support status
   */
  supportsStreaming() {
    return true;
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

  /**
   * Stream message from xAI API
   * @param {string} model - Model to use
   * @param {string} message - Message to send
   * @param {object} config - Configuration options
   * @param {function} onChunk - Callback for each chunk
   * @param {function} onComplete - Callback when complete
   */
  async streamMessage(model, message, config = {}, onChunk, onComplete) {
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
      top_p: config.topP || 1.0,
      stream: true // Enable streaming
    };

    try {
      const response = await client.post('/chat/completions', requestData, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
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