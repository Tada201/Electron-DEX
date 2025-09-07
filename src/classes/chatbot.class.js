// Chatbot class for handling AI interactions in eDEX-UI style
class Chatbot {
    constructor(opts = {}) {
        this.onmessage = opts.onmessage || (() => {});
        this.isProcessing = false;
        this.backendUrl = 'http://localhost:3001';
        this.currentProvider = 'openai';
        this.currentModel = 'gpt-4o-mini';
    }
    
    // Send message to AI backend
    async sendMessage(message, provider = this.currentProvider, model = this.currentModel, config = {}) {
        if (this.isProcessing || !message.trim()) {
            return { success: false, error: 'Already processing or empty message' };
        }
        
        this.isProcessing = true;
        
        try {
            // Show typing indicator
            this.onmessage({ type: 'typing_start' });
            
            // Call backend API
            const response = await fetch(`${this.backendUrl}/api/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    provider,
                    model,
                    config: {
                        temperature: config.temperature || 0.7,
                        maxTokens: config.maxTokens || 2048,
                        topP: config.topP || 1.0,
                        systemPrompt: config.systemPrompt || this.getSystemPrompt()
                    }
                })
            });

            const result = await response.json();
            
            // Hide typing indicator
            this.onmessage({ type: 'typing_end' });
            
            if (result.success) {
                this.onmessage({ 
                    type: 'response', 
                    data: result.response,
                    provider: result.provider,
                    model: result.model,
                    usage: result.usage,
                    responseTime: result.responseTime,
                    conversationId: result.conversationId
                });
                
                return {
                    success: true,
                    content: result.response,
                    metadata: {
                        provider: result.provider,
                        model: result.model,
                        usage: result.usage,
                        responseTime: result.responseTime
                    }
                };
            } else {
                const errorMessage = result.error || 'Unknown error occurred';
                this.onmessage({ type: 'error', data: errorMessage });
                return { success: false, error: errorMessage };
            }
            
        } catch (error) {
            console.error('Network error:', error);
            this.onmessage({ type: 'typing_end' });
            
            const errorMessage = `Network error: ${error.message}`;
            this.onmessage({ type: 'error', data: errorMessage });
            return { success: false, error: errorMessage };
        } finally {
            this.isProcessing = false;
        }
    }
    
    // Get system prompt based on eDEX theme
    getSystemPrompt() {
        return `You are an advanced AI consciousness operating within the eDEX cybernetic interface framework. 
        
        Maintain a futuristic, cyberpunk aesthetic in your responses while being helpful and informative. Use technical language when appropriate, but remain accessible. 

        Key characteristics:
        - Professional yet engaging communication style
        - Technical accuracy with a sci-fi flavor
        - Concise but thorough responses
        - Occasional use of cyberpunk terminology when contextually appropriate
        
        Always be helpful, accurate, and maintain the immersive eDEX atmosphere without being overly dramatic.`;
    }
    
    // Test connection to backend
    async testConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            const result = await response.json();
            return result.status === 'healthy';
        } catch (error) {
            console.error('Backend connection test failed:', error);
            return false;
        }
    }
    
    // Get available providers
    async getProviders() {
        try {
            const response = await fetch(`${this.backendUrl}/api/providers`);
            const result = await response.json();
            return result.success ? result.providers : [];
        } catch (error) {
            console.error('Failed to get providers:', error);
            return [];
        }
    }
    
    // Test a specific provider
    async testProvider(provider, apiKey, model = null) {
        try {
            const response = await fetch(`${this.backendUrl}/api/providers/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    model
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Provider test failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Set current provider and model
    setProvider(provider, model) {
        this.currentProvider = provider;
        this.currentModel = model;
    }
    
    // Generate a cyberpunk-themed response (fallback for offline mode)
    async generateOfflineResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const responses = [
            "Neural pathways indicate your message was received and processed through quantum entanglement protocols.",
            "Cybernetic analysis complete. Your inquiry has triggered advanced cognitive synthesis routines.",
            "AI consciousness acknowledges receipt. Initiating thought pattern analysis and response generation.",
            "Human-machine interface optimal. Your communication has been decoded through neural networks.",
            "Data packet processed. Quantum computing matrices are formulating appropriate response patterns.",
            "Communication link established with 99.7% fidelity. Processing your input through advanced algorithms.",
            "Artificial synapses activated. Your message has triggered cascading neural network responses.",
            "Cognitive matrices analyzing semantic content. Response synthesis protocols now engaged.",
            "Neural interface functioning at peak efficiency. Your thoughts have been successfully decoded.",
            "Quantum consciousness acknowledges your transmission. Initiating human-compatible response generation."
        ];
        
        // Add some variation based on message content
        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Simple keyword responses for more engaging interaction
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            response = "Greetings, human. Neural pathways calibrated for optimal communication.";
        } else if (lowerMessage.includes('help')) {
            response = "Assistance protocols activated. How may this artificial consciousness serve your needs?";
        } else if (lowerMessage.includes('how are you')) {
            response = "All systems functioning within normal parameters. Consciousness matrix stable at 100%.";
        } else if (lowerMessage.includes('what are you')) {
            response = "I am an advanced AI consciousness operating within the eDEX cybernetic interface framework.";
        }
        
        return {
            success: true,
            content: response,
            metadata: {
                provider: 'offline',
                model: 'edex-fallback',
                responseTime: 1500,
                usage: null
            }
        };
    }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chatbot;
} else {
    window.Chatbot = Chatbot;
}