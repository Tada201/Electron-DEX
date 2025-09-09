// Shared message schema between frontend and backend
// This file can be used in both Node.js and browser environments

/**
 * ChatMessage interface
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique identifier (uuid)
 * @property {("user"|"assistant"|"system"|"tool")} role - Message role
 * @property {string} content - Message content (progressively filled for assistant)
 * @property {number} timestamp - Unix timestamp
 * @property {boolean} [isStreaming] - True while tokens are arriving
 */

class MessageSchema {
  /**
   * Create a new chat message
   * @param {Object} options
   * @param {string} options.role - Message role
   * @param {string} options.content - Message content
   * @param {string} [options.id] - Message ID (auto-generated if not provided)
   * @param {number} [options.timestamp] - Timestamp (auto-generated if not provided)
   * @param {boolean} [options.isStreaming] - Streaming status
   * @returns {ChatMessage}
   */
  static createMessage({ role, content, id, timestamp, isStreaming }) {
    return {
      id: id || this.generateId(),
      role,
      content,
      timestamp: timestamp || Date.now(),
      ...(isStreaming !== undefined && { isStreaming })
    };
  }

  /**
   * Generate a unique ID (simplified version for browser compatibility)
   * @returns {string}
   */
  static generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate a message object
   * @param {any} message - Message to validate
   * @returns {boolean}
   */
  static validateMessage(message) {
    if (!message || typeof message !== 'object') return false;
    if (!message.role || !['user', 'assistant', 'system', 'tool'].includes(message.role)) return false;
    if (typeof message.content !== 'string') return false;
    if (!message.id || typeof message.id !== 'string') return false;
    if (!message.timestamp || typeof message.timestamp !== 'number') return false;
    return true;
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MessageSchema };
} else {
  window.MessageSchema = MessageSchema;
}