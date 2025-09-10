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

  /**
   * Check if provider supports streaming
   * @returns {boolean} Streaming support status
   */
  supportsStreaming() {
    return true;
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

  /**
   * Stream message from Groq API
   * @param {string} model - Model to use
   * @param {string} message - Message to send
   * @param {object} config - Configuration options
   * @param {function} onChunk - Callback for each chunk
   * @param {function} onComplete - Callback when complete
   */
  async streamMessage(model, message, config = {}, onChunk, onComplete) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
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