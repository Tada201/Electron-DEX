// Streaming hook for eDEX Chatbot
// This is adapted from React hook patterns for use in the eDEX UI component system

class StreamingChatHook {
  constructor() {
    this.state = {
      messages: [],
      isStreaming: false,
      currentStream: null,
      error: null,
      abortController: null
    };
    
    this.listeners = [];
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in streaming hook listener:', error);
      }
    });
  }

  /**
   * Send a message with streaming support
   * @param {string} message - User message
   * @param {Object} options - API options
   * @param {string} options.backendUrl - Backend URL
   * @param {string} options.provider - AI provider
   * @param {string} options.model - AI model
   * @param {Object} options.config - Additional configuration
   */
  async sendMessage(message, options = {}) {
    const {
      backendUrl = 'http://localhost:3001',
      provider = 'openai',
      model = 'gpt-4o-mini',
      config = {}
    } = options;

    // Reset error state
    this.state.error = null;
    
    // Create AbortController for cancellation
    this.state.abortController = new AbortController();
    
    try {
      // Add user message to state
      const userMessage = {
        id: this.generateId(),
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      
      this.state.messages = [...this.state.messages, userMessage];
      this.state.isStreaming = true;
      this.notifyListeners();
      
      // Prepare messages for API call
      const apiMessages = this.state.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Make streaming request
      const response = await fetch(`${backendUrl}/api/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: apiMessages,
          provider: provider,
          stream: true,
          ...config
        }),
        signal: this.state.abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Create assistant message
      const assistantMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      };
      
      this.state.messages = [...this.state.messages, assistantMessage];
      this.notifyListeners();
      
      // Read stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Mark message as finished streaming
          const updatedMessages = [...this.state.messages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.isStreaming = false;
          }
          this.state.messages = updatedMessages;
          this.state.isStreaming = false;
          this.notifyListeners();
          break;
        }
        
        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // Stream finished
              const updatedMessages = [...this.state.messages];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.isStreaming = false;
              }
              this.state.messages = updatedMessages;
              this.state.isStreaming = false;
              this.notifyListeners();
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                const content = parsed.choices[0].delta.content;
                
                // Update assistant message content
                const updatedMessages = [...this.state.messages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content += content;
                }
                this.state.messages = updatedMessages;
                this.notifyListeners();
              }
            } catch (parseError) {
              // Ignore parsing errors for streaming chunks
              console.warn('Failed to parse streaming chunk:', parseError);
            }
          }
        }
      }
      
      // Clean up
      reader.releaseLock();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream cancelled by user');
        this.state.isStreaming = false;
        this.notifyListeners();
      } else {
        console.error('Streaming error:', error);
        this.state.error = error.message;
        this.state.isStreaming = false;
        this.notifyListeners();
      }
    }
  }

  /**
   * Cancel the current streaming response
   */
  cancelStream() {
    if (this.state.abortController) {
      this.state.abortController.abort();
      this.state.abortController = null;
    }
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    this.state.messages = [];
    this.state.isStreaming = false;
    this.state.error = null;
    this.notifyListeners();
  }

  /**
   * Generate a unique ID
   * @returns {string}
   */
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StreamingChatHook };
} else {
  window.StreamingChatHook = StreamingChatHook;
}