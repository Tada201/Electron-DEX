// Chatbot class for handling AI interactions
class Chatbot {
    constructor(opts = {}) {
        this.terminal = opts.terminal;
        this.onmessage = opts.onmessage || (() => {});
        this.isProcessing = false;
        
        // Initialize Tauri API if available
        this._initTauriAPI();
    }
    
    async _initTauriAPI() {
        // Always use mock for now (can be updated later for Tauri integration)
        this.tauriInvoke = this._mockTauriInvoke.bind(this);
    }
    
    // Mock Tauri invoke for development/testing
    async _mockTauriInvoke(command, args = {}) {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        if (command === 'send_message') {
            const responses = [
                "System initialized. Welcome to eDEX Chatbot.",
                "Processing query... Analysis complete.",
                "Command acknowledged. Standing by for further input.",
                "Data stream established. Neural networks active.",
                "Quantum processors online. How may I assist you?",
                "Scanning databases... Information retrieved successfully.",
                "AI core responding. Task parameters understood.",
                "Cybernetic interface stable. Ready for next command."
            ];
            
            const responseIdx = Math.floor(Math.random() * responses.length);
            return responses[responseIdx];
        }
        
        throw new Error(`Unknown command: ${command}`);
    }
    
    async sendMessage(message, provider = 'openai', model = 'gpt-4o', config = {}) {
        if (this.isProcessing || !message.trim()) {
            return;
        }
        
        this.isProcessing = true;
        
        try {
            // Add user message to terminal
            if (this.terminal) {
                this.terminal.addMessage('user', message);
            }
            
            // Show typing indicator
            this._showTypingIndicator();
            
            // Call backend API
            const backendUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001' 
                : `https://${window.location.hostname.replace(/:\d+$/, '')}:3001`;
            const response = await fetch(`${backendUrl}/api/chat/send`, {
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
                        systemPrompt: config.systemPrompt
                    }
                })
            });

            const result = await response.json();
            
            // Remove typing indicator
            this._hideTypingIndicator();
            
            if (result.success) {
                // Add AI response to terminal
                if (this.terminal) {
                    this.terminal.addMessage('assistant', result.response);
                }
                
                // Trigger callback with additional metadata
                this.onmessage({ 
                    type: 'response', 
                    data: result.response,
                    provider: result.provider,
                    model: result.model,
                    usage: result.usage,
                    responseTime: result.responseTime
                });
            } else {
                // Handle error response
                const errorMessage = result.error || 'Unknown error occurred';
                if (this.terminal) {
                    this.terminal.addMessage('error', errorMessage);
                }
                this.onmessage({ type: 'error', data: errorMessage });
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this._hideTypingIndicator();
            
            const errorMessage = `Network error: ${error.message}`;
            if (this.terminal) {
                this.terminal.addMessage('error', errorMessage);
            }
            this.onmessage({ type: 'error', data: errorMessage });
        } finally {
            this.isProcessing = false;
        }
    }
    
    _showTypingIndicator() {
        if (this.terminal) {
            this._typingLine = this.terminal.term.buffer.active.cursorY;
            this.terminal.write('\x1b[36m[...] AI  > \x1b[0m');
            this._startTypingAnimation();
        }
    }
    
    _hideTypingIndicator() {
        if (this.terminal && this._typingAnimation) {
            clearInterval(this._typingAnimation);
            this._typingAnimation = null;
            
            // Clear the typing line
            this.terminal.term.write('\r\x1b[K');
        }
    }
    
    _startTypingAnimation() {
        let dots = '';
        this._typingAnimation = setInterval(() => {
            dots = dots.length >= 3 ? '' : dots + '.';
            if (this.terminal) {
                this.terminal.term.write('\rthinking' + dots + '\x1b[32m█\x1b[0m');
            }
        }, 500);
    }
    
    // Get chat history
    getHistory() {
        return this.terminal ? this.terminal.messages : [];
    }
    
    // Generate response (modern interface method)
    async generateResponse(message) {
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
        
        return response;
    }

    // Clear chat
    clear() {
        if (this.terminal) {
            this.terminal.clear();
            this.terminal.writeln("\x1b[1meDEX Chatbot Interface v1.0.0\x1b[0m");
            this.terminal.writeln("\x1b[36mChat cleared. Ready for new conversation.\x1b[0m");
            this.terminal.writeln("");
        }
    }
}