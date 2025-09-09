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
        this.markdownRenderer = new window.MarkdownRenderer();
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
        this.tools = []; // Available tools
        this.enableTools = false; // Whether tools are enabled
        
        // Profile-specific settings
        this.temperature = 0.7;
        this.maxTokens = 2048;
        this.systemPrompt = '';
        
        // Streaming state
        this.isStreaming = false;
        this.currentStreamingMessage = null;
        this.currentStreamingContent = '';
        
        // Initialize the chat component
        this.init();
    }
    
    // Lifecycle method: Initialize the chat component
    init() {
        // Get the container element
        const container = document.getElementById(this.parentId);
        if (!container) {
            console.error(`Container with id ${this.parentId} not found`);
            return;
        }
        
        // Initialize with welcome message
        this.addMessage('system', 'eDEX Chatbot Interface v1.0.0 - Neural networks initialized');
        console.log('Chat component initialized');
    }
    
    // Lifecycle method: Focus the chat input
    focus() {
        // Focus the chat input
        console.log('Chat component focused');
    }
    
    // Lifecycle method: Handle resize events
    resize(width, height) {
        // Handle resize events
        console.log(`Chat component resized to ${width}x${height}`);
    }
    
    // Lifecycle method: Clean up resources
    destroy() {
        // Clean up resources
        console.log('Chat component destroyed');
    }
    
    // Send message to AI backend with streaming support and retry mechanism
    async sendMessage(message, provider = this.currentProvider, model = this.currentModel, config = {}, stream = true) {
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
            
            // Merge profile-specific settings with provided config
            const mergedConfig = {
                temperature: this.temperature,
                maxTokens: this.maxTokens,
                systemPrompt: this.systemPrompt,
                ...config
            };
            
            // Prepare messages for API call
            const apiMessages = this.messages.map(msg => ({
                role: msg.type,
                content: msg.content
            }));
            
            // Add current user message
            apiMessages.push({ role: 'user', content: message });
            
            // Prepare tools if enabled
            const toolsConfig = this.enableTools && this.tools.length > 0 ? this.tools : undefined;
            
            if (stream) {
                // Streaming implementation with AbortController for cancellation
                const abortController = new AbortController();
                this.currentAbortController = abortController;
                
                const response = await fetch(`${this.backendUrl}/api/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: apiMessages,
                        provider: provider,
                        chat_id: this.currentChatId,
                        stream: true,
                        tools: toolsConfig,
                        ...mergedConfig
                    }),
                    signal: abortController.signal
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'Failed to get response from AI');
                }
                
                // Process streaming response
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullContent = '';
                
                // Create initial streaming message
                this.isStreaming = true;
                this.currentStreamingContent = '';
                this.onmessage({ type: 'stream_start' });
                
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        // Check if stream was cancelled
                        if (abortController.signal.aborted) {
                            break;
                        }
                        
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n\n');
                        
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                
                                if (data === '[DONE]') {
                                    // Stream finished
                                    this.onmessage({ 
                                        type: 'stream_end', 
                                        data: fullContent,
                                        provider: provider,
                                        model: model
                                    });
                                    this.isStreaming = false;
                                    this.currentStreamingMessage = null;
                                    this.currentStreamingContent = '';
                                    break;
                                }
                                
                                try {
                                    const parsed = JSON.parse(data);
                                    
                                    if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                        const content = parsed.choices[0].delta.content;
                                        fullContent += content;
                                        this.currentStreamingContent += content;
                                        this.onmessage({ type: 'stream_content', data: content });
                                    }
                                } catch (parseError) {
                                    // Ignore parsing errors for streaming chunks
                                }
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
                
                // Add final message to chat
                this.addMessage('assistant', fullContent);
                
                this.onmessage({ type: 'typing_end' });
                this.onmessage({ 
                    type: 'response', 
                    data: fullContent,
                    provider: provider,
                    model: model
                });
                
                this.isProcessing = false;
                this.onmessage({ type: 'processing_end' });
                this.retryAttempts = 0; // Reset retry attempts on success
                return {
                    success: true,
                    content: fullContent
                };
            } else {
                // Non-streaming implementation (existing behavior)
                const response = await fetch(`${this.backendUrl}/api/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: apiMessages,
                        provider: provider,
                        chat_id: this.currentChatId,
                        tools: toolsConfig,
                        ...mergedConfig
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
                
                this.retryAttempts = 0; // Reset retry attempts on success
                return {
                    success: true,
                    content: data.choices[0].message.content
                };
            }
        } catch (error) {
            // Handle abort errors specifically
            if (error.name === 'AbortError') {
                console.log('Request was cancelled by user');
                this.onmessage({ type: 'typing_end' });
                this.isProcessing = false;
                this.onmessage({ type: 'processing_end' });
                this.isStreaming = false;
                this.currentStreamingMessage = null;
                this.currentStreamingContent = '';
                return { success: false, error: 'Request cancelled' };
            }
            
            this.onmessage({ type: 'typing_end' });
            
            // Implement retry mechanism
            if (this.retryAttempts < this.maxRetryAttempts) {
                this.retryAttempts++;
                this.onmessage({ 
                    type: 'retry_attempt', 
                    data: { 
                        attempt: this.retryAttempts, 
                        maxAttempts: this.maxRetryAttempts,
                        error: error.message
                    } 
                });
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryAttempts));
                
                // Retry the request
                return await this.sendMessage(message, provider, model, config, stream);
            } else {
                // Max retries exceeded
                this.onmessage({ type: 'error', data: `Failed after ${this.maxRetryAttempts} attempts: ${error.message}` });
                this.isProcessing = false;
                this.onmessage({ type: 'processing_end' });
                this.retryAttempts = 0; // Reset retry attempts
                return { success: false, error: error.message };
            }
        }
    }
    
    // Cancel current streaming response
    cancelStreaming() {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
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
        this.isStreaming = false;
        this.currentStreamingMessage = null;
        this.currentStreamingContent = '';
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
            this.isStreaming = false;
            this.currentStreamingMessage = null;
            this.currentStreamingContent = '';
            this.onmessage({ type: 'new_chat', data: data.chat });
            
            return data.chat;
        } catch (error) {
            console.error('Failed to create new chat:', error);
            this.onmessage({ type: 'error', data: `Failed to create new chat: ${error.message}` });
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
            
            this.isStreaming = false;
            this.currentStreamingMessage = null;
            this.currentStreamingContent = '';
            this.onmessage({ type: 'chat_loaded', data: data.chat });
            
            return data.chat;
        } catch (error) {
            console.error('Failed to load chat:', error);
            this.onmessage({ type: 'error', data: `Failed to load chat: ${error.message}` });
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
            this.onmessage({ type: 'error', data: `Failed to get chat history: ${error.message}` });
            throw error;
        }
    }
    
    // Set current provider and model
    setProvider(provider, model) {
        this.currentProvider = provider;
        this.currentModel = model;
    }
    
    // Set profile-specific settings
    setProfileSettings(settings) {
        if (settings.temperature !== undefined) {
            this.temperature = settings.temperature;
        }
        if (settings.maxTokens !== undefined) {
            this.maxTokens = settings.maxTokens;
        }
        if (settings.systemPrompt !== undefined) {
            this.systemPrompt = settings.systemPrompt;
        }
        if (settings.provider !== undefined) {
            this.currentProvider = settings.provider;
        }
        if (settings.model !== undefined) {
            this.currentModel = settings.model;
        }
    }
    
    // Set available tools
    setTools(tools) {
        this.tools = tools;
    }
    
    // Enable or disable tools
    setToolsEnabled(enabled) {
        this.enableTools = enabled;
    }
    
    // Execute a tool
    async executeTool(toolId, parameters = {}) {
        try {
            const response = await fetch(`${this.backendUrl}/api/tools/execute/${toolId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parameters })
            });
            
            if (!response.ok) {
                throw new Error('Failed to execute tool');
            }
            
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Failed to execute tool:', error);
            throw error;
        }
    }
}
export default Chat;