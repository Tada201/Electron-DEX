// Chat class following eDEX-UI component pattern
class Chat {
    constructor(opts) {
        if (!opts.parentId) throw "Missing parentId option";
        
        this.parentId = opts.parentId;
        this.onmessage = opts.onmessage || (() => {});
        this.messages = [];
        this.isProcessing = false;
        this.backendUrl = 'http://localhost:3001';
        this.currentProvider = 'openai';
        this.currentModel = 'gpt-4o-mini';
        this.currentChatId = null;
        this.markdownRenderer = new MarkdownRenderer();
        
        this._initializeChat();
    }
    
    async _initializeChat() {
        // Get the container element
        const container = document.getElementById(this.parentId);
        if (!container) {
            console.error(`Container with id ${this.parentId} not found`);
            return;
        }
        
        // Initialize with welcome message
        this.addMessage('system', 'eDEX Chatbot Interface v1.0.0 - Neural networks initialized');
    }
    
    // Send message to AI backend
    async sendMessage(message, provider = this.currentProvider, model = this.currentModel, config = {}) {
        if (this.isProcessing || !message.trim()) {
            return { success: false, error: 'Already processing or empty message' };
        }
        
        this.isProcessing = true;
        this.onmessage({ type: 'processing_start' });
        
        try {
            // Add user message to UI
            this.addMessage('user', message);
            
            // Show typing indicator
            this.onmessage({ type: 'typing_start' });
            
            // Create new chat if needed
            if (!this.currentChatId) {
                const newChatResponse = await fetch(`${this.backendUrl}/api/chat/new`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                        userId: 'default'
                    })
                });
                
                if (!newChatResponse.ok) {
                    throw new Error('Failed to create new chat');
                }
                
                const newChatData = await newChatResponse.json();
                this.currentChatId = newChatData.chat.id;
            }
            
            // Send message to backend API
            const response = await fetch(`${this.backendUrl}/api/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: message }
                    ],
                    provider: provider,
                    chat_id: this.currentChatId,
                    ...config
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get response from AI');
            }
            
            const data = await response.json();
            
            // Add AI response to UI
            this.addMessage('assistant', data.choices[0].message.content);
            
            this.onmessage({ type: 'typing_end' });
            this.onmessage({ 
                type: 'response', 
                data: data.choices[0].message.content,
                provider: provider,
                model: model
            });
            
            return {
                success: true,
                content: data.choices[0].message.content
            };
        } catch (error) {
            this.onmessage({ type: 'typing_end' });
            this.onmessage({ type: 'error', data: error.message });
            return { success: false, error: error.message };
        } finally {
            this.isProcessing = false;
            this.onmessage({ type: 'processing_end' });
        }
    }
    
    // Add message to chat display
    addMessage(type, content) {
        const timestamp = new Date().toLocaleTimeString();
        this.messages.push({ type, content, timestamp });
        
        // Notify listeners with the actual content
        this.onmessage({ type: 'message_added', data: { type, content, timestamp } });
    }
    
    // Clear chat history
    clear() {
        this.messages = [];
        this.currentChatId = null;
        this.onmessage({ type: 'cleared' });
    }
    
    // Create new chat
    async createNewChat(title = 'New Chat') {
        try {
            const response = await fetch(`${this.backendUrl}/api/chat/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    userId: 'default'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create new chat');
            }
            
            const data = await response.json();
            this.currentChatId = data.chat.id;
            this.messages = [];
            this.onmessage({ type: 'new_chat', data: data.chat });
            
            return data.chat;
        } catch (error) {
            console.error('Failed to create new chat:', error);
            throw error;
        }
    }
    
    // Load chat by ID
    async loadChat(chatId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/chat/${chatId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load chat');
            }
            
            const data = await response.json();
            this.currentChatId = chatId;
            this.messages = data.chat.messages.map(msg => ({
                type: msg.role,
                content: msg.content,
                timestamp: new Date(msg.createdAt).toLocaleTimeString()
            }));
            
            this.onmessage({ type: 'chat_loaded', data: data.chat });
            
            return data.chat;
        } catch (error) {
            console.error('Failed to load chat:', error);
            throw error;
        }
    }
    
    // Get chat history
    async getChatHistory() {
        try {
            const response = await fetch(`${this.backendUrl}/api/chat?userId=default`);
            
            if (!response.ok) {
                throw new Error('Failed to get chat history');
            }
            
            const data = await response.json();
            return data.chats;
        } catch (error) {
            console.error('Failed to get chat history:', error);
            throw error;
        }
    }
    
    // Set current provider and model
    setProvider(provider, model) {
        this.currentProvider = provider;
        this.currentModel = model;
    }
    
    // Lifecycle methods following eDEX-UI pattern
    init() {
        // Initialize the chat component
        console.log('Chat component initialized');
    }
    
    focus() {
        // Focus the chat input
        console.log('Chat component focused');
    }
    
    resize(width, height) {
        // Handle resize events
        console.log(`Chat component resized to ${width}x${height}`);
    }
    
    destroy() {
        // Clean up resources
        console.log('Chat component destroyed');
    }
}