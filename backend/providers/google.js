// eDEX Chatbot - Google Gemini Provider
const axios = require('axios');
const { createHttpConfig, formatErrorForUser, validateApiKey } = require('../utils/helpers');

class GoogleProvider {
  constructor() {
    this.name = 'google';
    this.displayName = 'Google Gemini';
    this.description = 'Google Gemini models including Gemini 1.5 Pro and Flash';
    this.baseUrl = process.env.GOOGLE_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    this.requiresApiKey = true;
    this.documentationUrl = 'https://ai.google.dev/docs';
  }

  /**
   * Check if provider supports streaming
   * @returns {boolean} Streaming support status
   */
  supportsStreaming() {
    return true;
  }

  isConfigured() {
    return !!process.env.GOOGLE_API_KEY;
  }

  getAvailableModels() {
    return [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextLength: 2000000, multimodal: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextLength: 1000000, multimodal: true },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', contextLength: 30720, multimodal: false }
    ];
  }

  async testConnection(apiKey, model = 'gemini-1.5-flash') {
    const startTime = Date.now();
    
    try {
      if (!validateApiKey('google', apiKey)) {
        return {
          success: false,
          error: 'Invalid Google API key format.',
          responseTime: Date.now() - startTime
        };
      }

      const client = axios.create(createHttpConfig(this.baseUrl));
      
      const response = await client.post(`/models/${model}:generateContent?key=${apiKey}`, {
        contents: [{ role: 'user', parts: [{ text: 'test' }] }],
        generationConfig: { maxOutputTokens: 1 }
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
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const client = axios.create(createHttpConfig(this.baseUrl));

    const requestData = {
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 2048,
        topP: config.topP || 1.0
      }
    };

    try {
      const response = await client.post(`/models/${model}:generateContent?key=${apiKey}`, requestData);

      const candidate = response.data.candidates[0];
      
      return {
        content: candidate.content.parts[0].text,
        usage: response.data.usageMetadata ? {
          prompt_tokens: response.data.usageMetadata.promptTokenCount || 0,
          completion_tokens: response.data.usageMetadata.candidatesTokenCount || 0,
          total_tokens: response.data.usageMetadata.totalTokenCount || 0
        } : null,
        finishReason: candidate.finishReason,
        provider: this.name,
        model: model
      };

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw new Error('Google API key is invalid or expired');
        } else if (status === 429) {
          throw new Error('Google API rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to Google API');
        } else {
          throw new Error(`Google API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`Google API error: ${error.message}`);
      }
    }
  }

  /**
   * Stream message from Google Gemini API
   * @param {string} model - Model to use
   * @param {string} message - Message to send
   * @param {object} config - Configuration options
   * @param {function} onChunk - Callback for each chunk
   * @param {function} onComplete - Callback when complete
   */
  async streamMessage(model, message, config = {}, onChunk, onComplete) {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const client = axios.create(createHttpConfig(this.baseUrl));

    const requestData = {
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 2048,
        topP: config.topP || 1.0
      }
    };

    try {
      const response = await client.post(`/models/${model}:streamGenerateContent?key=${apiKey}`, requestData, {
        responseType: 'stream'
      });

      let buffer = '';
      
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        
        // Process complete lines
        let lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line);
            
            // Check if this is the end of the stream
            if (data.candidates?.[0]?.finishReason) {
              onComplete();
              return;
            }
            
            // Extract content from the response
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            if (content) {
              onChunk({
                content,
                provider: this.name,
                model,
                conversationId: config.conversationId,
                usage: data.usageMetadata ? {
                  prompt_tokens: data.usageMetadata.promptTokenCount || 0,
                  completion_tokens: data.usageMetadata.candidatesTokenCount || 0,
                  total_tokens: data.usageMetadata.totalTokenCount || 0
                } : null,
                finishReason: data.candidates?.[0]?.finishReason || null
              });
            }
          } catch (parseError) {
            // Ignore parsing errors for incomplete JSON
            continue;
          }
        }
      });

      response.data.on('end', () => {
        // Process any remaining data in buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            
            // Extract content from the response
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            if (content) {
              onChunk({
                content,
                provider: this.name,
                model,
                conversationId: config.conversationId,
                usage: data.usageMetadata ? {
                  prompt_tokens: data.usageMetadata.promptTokenCount || 0,
                  completion_tokens: data.usageMetadata.candidatesTokenCount || 0,
                  total_tokens: data.usageMetadata.totalTokenCount || 0
                } : null,
                finishReason: data.candidates?.[0]?.finishReason || null
              });
            }
          } catch (parseError) {
            // Ignore parsing errors
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
          throw new Error('Google API key is invalid or expired');
        } else if (status === 429) {
          throw new Error('Google API rate limit exceeded. Please wait and try again');
        } else if (status === 400) {
          throw new Error(data.error?.message || 'Invalid request to Google API');
        } else {
          throw new Error(`Google API error (${status}): ${data.error?.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`Google API error: ${error.message}`);
      }
    }
  }
}

module.exports = new GoogleProvider();