// eDEX Chatbot - Helper Utilities

/**
 * Sanitize user input to prevent security issues
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, 8192); // Limit length to 8KB
}

/**
 * Format error for user display
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
function formatErrorForUser(error) {
  const message = error.message || error.toString();
  
  if (message.includes('API key') || message.includes('authentication') || message.includes('401')) {
    return '🔑 Authentication failed. Please check your API key in settings.';
  }
  
  if (message.includes('rate limit') || message.includes('429')) {
    return '⏱️ Rate limit exceeded. Please wait a moment and try again.';
  }
  
  if (message.includes('network') || message.includes('ECONNREFUSED') || message.includes('timeout')) {
    return '🌐 Network error. Please check your internet connection and try again.';
  }
  
  if (message.includes('model') && message.includes('not found')) {
    return '🤖 Model not available. Please select a different model.';
  }
  
  if (message.includes('quota') || message.includes('billing')) {
    return '💳 API quota exceeded. Please check your billing settings.';
  }
  
  if (message.includes('context') || message.includes('too long')) {
    return '📄 Message too long. Please try a shorter message.';
  }
  
  // Default error message
  return `⚠️ ${message}`;
}

/**
 * Validate API key format for different providers
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Whether the key format is valid
 */
function validateApiKey(provider, apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return false;
  
  const patterns = {
    openai: /^sk-[A-Za-z0-9-_]{32,}$/,
    anthropic: /^sk-ant-[A-Za-z0-9-_]{32,}$/,
    google: /^AIza[A-Za-z0-9-_]{35}$/,
    mistral: /^[A-Za-z0-9]{32,}$/,
    groq: /^gsk_[A-Za-z0-9]{52}$/,
    xai: /^xai-[A-Za-z0-9-_]{32,}$/
  };
  
  const pattern = patterns[provider.toLowerCase()];
  return pattern ? pattern.test(apiKey) : apiKey.length >= 10;
}

/**
 * Validate message configuration
 * @param {object} config - Configuration object
 * @returns {object} Validation result
 */
function validateConfig(config = {}) {
  const errors = [];
  
  if (config.temperature !== undefined) {
    if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 2) {
      errors.push('Temperature must be a number between 0 and 2');
    }
  }
  
  if (config.maxTokens !== undefined) {
    if (typeof config.maxTokens !== 'number' || config.maxTokens < 1 || config.maxTokens > 200000) {
      errors.push('Max tokens must be a number between 1 and 200000');
    }
  }
  
  if (config.topP !== undefined) {
    if (typeof config.topP !== 'number' || config.topP < 0 || config.topP > 1) {
      errors.push('Top P must be a number between 0 and 1');
    }
  }
  
  if (config.systemPrompt !== undefined) {
    if (typeof config.systemPrompt !== 'string') {
      errors.push('System prompt must be a string');
    } else if (config.systemPrompt.length > 4096) {
      errors.push('System prompt must be less than 4096 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create a standardized HTTP client configuration
 * @param {string} baseURL - Base URL for the API
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {object} Axios configuration object
 */
function createHttpConfig(baseURL, timeout = 30000) {
  return {
    baseURL,
    timeout,
    headers: {
      'User-Agent': 'eDEX-Chatbot/1.0.0',
      'Content-Type': 'application/json'
    }
  };
}

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed JSON or default value
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error.message);
    return defaultValue;
  }
}

/**
 * Generate a unique session ID
 * @returns {string} Unique session identifier
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log with timestamp and formatting
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  console[level](logMessage);
  if (data) {
    console[level]('Data:', data);
  }
}

/**
 * Calculate response time
 * @param {number} startTime - Start time in milliseconds
 * @returns {number} Response time in milliseconds
 */
function calculateResponseTime(startTime) {
  return Date.now() - startTime;
}

/**
 * Create standard response format
 * @param {boolean} success - Whether the operation was successful
 * @param {*} data - Response data
 * @param {string} error - Error message if applicable
 * @returns {object} Standardized response object
 */
function createResponse(success, data = null, error = null) {
  const response = { success };
  
  if (success) {
    if (data !== null) response.data = data;
  } else {
    if (error) response.error = error;
  }
  
  response.timestamp = new Date().toISOString();
  return response;
}

module.exports = {
  sanitizeInput,
  formatErrorForUser,
  validateApiKey,
  validateConfig,
  createHttpConfig,
  safeJsonParse,
  generateSessionId,
  log,
  calculateResponseTime,
  createResponse
};