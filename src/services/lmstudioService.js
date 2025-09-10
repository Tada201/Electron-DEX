// src/services/lmstudioService.js - Direct LM Studio API Service
// This service handles direct communication with LM Studio's OpenAI-compatible API
// for localhost-only operation without backend proxy

class LMStudioService {
  constructor() {
    this.baseUrl = 'http://localhost:1234/v1';
    this.defaultApiKey = 'lm-studio';
    this.defaultTimeout = 30000; // 30 seconds
    this.chunkBuffer = '';
    this.lastFlushTime = 0;
    this.flushInterval = 50; // Flush every 50ms for better performance
  }

  /**
   * Validate that the URL is localhost only (security interceptor)
   * @param {string} url - URL to validate
   * @returns {boolean} Whether the URL is valid
   * @private
   */
  _validateLocalhostUrl(url) {
    try {
      const urlObj = new URL(url);
      // Only allow localhost connections
      return urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
    } catch (e) {
      return false;
    }
  }

  /**
   * Sanitize user input (security interceptor)
   * @param {string} input - User input to sanitize
   * @returns {string} Sanitized input
   * @private
   */
  _sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove any potentially dangerous characters
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();
  }

  /**
   * Sanitize messages array (security interceptor)
   * @param {Array} messages - Array of message objects
   * @returns {Array} Sanitized messages
   * @private
   */
  _sanitizeMessages(messages) {
    if (!Array.isArray(messages)) return [];
    
    return messages.map(msg => ({
      role: msg.role,
      content: this._sanitizeInput(msg.content)
    }));
  }

  /**
   * Get the full API URL for an endpoint
   * @param {string} endpoint - API endpoint (e.g., '/models', '/chat/completions')
   * @returns {string} Full URL
   */
  getApiUrl(endpoint) {
    // Ensure endpoint starts with /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    const url = `${this.baseUrl}${endpoint}`;
    
    // Security: Validate that the URL is localhost only
    if (!this._validateLocalhostUrl(url)) {
      throw new Error('Security Error: Only localhost connections are allowed');
    }
    
    return url;
  }

  /**
   * Get headers for API requests
   * @param {string} apiKey - API key (optional)
   * @returns {object} Headers object
   */
  getHeaders(apiKey = null) {
    const key = apiKey || this.defaultApiKey;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    };
  }

  /**
   * Test connection to LM Studio API
   * @param {string} apiKey - API key to test (optional)
   * @returns {Promise<object>} Test result
   */
  async testConnection(apiKey = null) {
    const startTime = Date.now();
    
    try {
      const response = await this._fetchWithTimeout(
        this.getApiUrl('/models'),
        {
          method: 'GET',
          headers: this.getHeaders(apiKey)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: this._formatErrorForUser(error),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get available models from LM Studio API
   * @param {string} apiKey - API key (optional)
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels(apiKey = null) {
    try {
      const response = await this._fetchWithTimeout(
        this.getApiUrl('/models'),
        {
          method: 'GET',
          headers: this.getHeaders(apiKey)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response to match our expected format
      const models = (data.data || data.models || [])
        .filter(model => model.id) // Ensure model has an ID
        .map(model => ({
          id: model.id,
          name: model.id.split('/').pop() || model.id, // Extract name from ID
          contextLength: model.context_length || model.max_context_length || 8192,
          multimodal: model.multimodal || false
        }));

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
   * Send message to LM Studio API (non-streaming)
   * @param {string} model - Model to use
   * @param {Array} messages - Array of message objects
   * @param {object} config - Configuration options
   * @param {string} apiKey - API key (optional)
   * @returns {Promise<object>} Response from API
   */
  async sendMessage(model, messages, config = {}, apiKey = null) {
    // Security: Sanitize messages
    const sanitizedMessages = this._sanitizeMessages(messages);
    
    const requestData = {
      model: model,
      messages: sanitizedMessages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2048,
      top_p: config.topP || 1.0,
      frequency_penalty: config.frequencyPenalty || 0,
      presence_penalty: config.presencePenalty || 0,
      stream: false
    };

    try {
      const response = await this._fetchWithTimeout(
        this.getApiUrl('/chat/completions'),
        {
          method: 'POST',
          headers: this.getHeaders(apiKey),
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) {
        await this._handleApiError(response);
      }

      const data = await response.json();
      const choice = data.choices[0];
      
      return {
        content: choice.message.content,
        usage: data.usage,
        finishReason: choice.finish_reason,
        provider: 'lmstudio',
        model: model
      };
    } catch (error) {
      throw new Error(`LM Studio API error: ${this._formatErrorForUser(error)}`);
    }
  }

  /**
   * Stream message from LM Studio API with performance optimizations
   * @param {string} model - Model to use
   * @param {Array} messages - Array of message objects
   * @param {object} config - Configuration options
   * @param {function} onChunk - Callback for each chunk
   * @param {function} onComplete - Callback when complete
   * @param {string} apiKey - API key (optional)
   */
  async streamMessage(model, messages, config = {}, onChunk, onComplete, apiKey = null) {
    // Security: Sanitize messages
    const sanitizedMessages = this._sanitizeMessages(messages);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    const requestData = {
      model: model,
      messages: sanitizedMessages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2048,
      top_p: config.topP || 1.0,
      frequency_penalty: config.frequencyPenalty || 0,
      presence_penalty: config.presencePenalty || 0,
      stream: true // Enable streaming
    };

    try {
      const response = await fetch(this.getApiUrl('/chat/completions'), {
        method: 'POST',
        headers: this.getHeaders(apiKey),
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      // Handle network errors
      if (!response.ok) {
        await this._handleApiError(response);
      }

      // Ensure response body exists
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      this.chunkBuffer = '';
      this.lastFlushTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Flush any remaining buffered content
          if (this.chunkBuffer) {
            this._processBufferedChunks(onChunk, model);
          }
          onComplete();
          break;
        }

        this.chunkBuffer += decoder.decode(value, { stream: true });
        const lines = this.chunkBuffer.split('\n');
        this.chunkBuffer = lines.pop() || ''; // Keep incomplete line in buffer

        // Process complete lines
        for (const line of lines) {
          if (line === 'data: [DONE]') {
            // Flush any remaining buffered content before completion
            if (this.chunkBuffer) {
              this._processBufferedChunks(onChunk, model);
            }
            onComplete();
            return;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
              const content = data.choices?.[0]?.delta?.content || '';

              if (content) {
                // Security: Sanitize content before sending to frontend
                const sanitizedContent = this._sanitizeInput(content);
                
                // Performance optimization: Batch chunks
                this._bufferChunk(sanitizedContent, onChunk, model, data);
              }
            } catch (parseError) {
              // Ignore parsing errors for incomplete JSON
              continue;
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: LM Studio did not respond in time');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      // Clean up buffers
      this.chunkBuffer = '';
      this.lastFlushTime = 0;
    }
  }

  /**
   * Buffer chunks for performance optimization
   * @private
   */
  _bufferChunk(content, onChunk, model, data) {
    // For now, we'll send chunks immediately but this could be enhanced
    // with batching logic for even better performance
    onChunk({
      content: content,
      provider: 'lmstudio',
      model: model,
      usage: data.usage || null,
      finishReason: data.choices?.[0]?.finish_reason || null
    });
  }

  /**
   * Process buffered chunks
   * @private
   */
  _processBufferedChunks(onChunk, model) {
    // In a more advanced implementation, we could batch multiple chunks
    // For now, we'll just send what's in the buffer
    if (this.chunkBuffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(this.chunkBuffer.slice(6));
        const content = data.choices?.[0]?.delta?.content || '';
        if (content) {
          onChunk({
            content: this._sanitizeInput(content),
            provider: 'lmstudio',
            model: model,
            usage: data.usage || null,
            finishReason: data.choices?.[0]?.finish_reason || null
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    this.chunkBuffer = '';
  }

  /**
   * Fetch with timeout
   * @private
   */
  async _fetchWithTimeout(url, options) {
    // Security: Validate URL
    if (!this._validateLocalhostUrl(url)) {
      throw new Error('Security Error: Only localhost connections are allowed');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Handle API errors
   * @private
   */
  async _handleApiError(response) {
    const status = response.status;
    let errorMessage = `LM Studio API error (${status})`;
    
    try {
      const data = await response.json();
      errorMessage = data.error?.message || errorMessage;
    } catch (e) {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    
    if (status === 401) {
      throw new Error('LM Studio API key is invalid');
    } else if (status === 429) {
      throw new Error('LM Studio rate limit exceeded. Please wait and try again');
    } else if (status === 400) {
      throw new Error(`Invalid request to LM Studio API: ${errorMessage}`);
    } else {
      throw new Error(`${errorMessage}`);
    }
  }

  /**
   * Format error for user display
   * @private
   */
  _formatErrorForUser(error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return 'Network error: Unable to connect to LM Studio API. Please ensure LM Studio is running.';
    }
    return error.message || 'Unknown error occurred';
  }
}

// Export singleton instance
const lmstudioService = new LMStudioService();
export default lmstudioService;