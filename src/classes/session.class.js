// Session Manager for eDEX Chatbot
class SessionManager {
    constructor() {
        this.sessions = this.loadSessions();
        this.currentSession = this.getOrCreateDefaultSession();
    }
    
    // Load sessions from localStorage
    loadSessions() {
        try {
            const saved = localStorage.getItem('edex_chat_sessions');
            const sessions = saved ? JSON.parse(saved) : [];
            
            // Convert plain objects back to ChatSession instances
            return sessions.map(data => ChatSession.fromData(data));
        } catch (error) {
            console.error('Failed to load sessions:', error);
            return [];
        }
    }
    
    // Save sessions to localStorage
    saveSessions() {
        try {
            const data = this.sessions.map(session => session.toData());
            localStorage.setItem('edex_chat_sessions', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save sessions:', error);
        }
    }
    
    // Get or create default session
    getOrCreateDefaultSession() {
        let defaultSession = this.sessions.find(s => s.id === 'default');
        if (!defaultSession) {
            defaultSession = new ChatSession('default', 'Default Session');
            defaultSession.addMessage('system', 'eDEX Chatbot Interface Online - Neural networks initialized');
            this.sessions.unshift(defaultSession);
            this.saveSessions();
        }
        return defaultSession;
    }
    
    // Create new session
    createNewSession(title = null, persona = 'default') {
        const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const sessionTitle = title || this.generateSessionTitle();
        
        const newSession = new ChatSession(id, sessionTitle, persona);
        newSession.addMessage('system', `New ${persona} chat session created - Ready for interaction`);
        
        this.sessions.unshift(newSession);
        this.currentSession = newSession;
        this.saveSessions();
        
        return newSession;
    }
    
    // Generate auto title for session
    generateSessionTitle() {
        const adjectives = ['Neural', 'Quantum', 'Cyber', 'Digital', 'Advanced', 'Smart', 'Elite', 'Prime'];
        const nouns = ['Chat', 'Session', 'Interface', 'Link', 'Protocol', 'Network'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adj} ${noun}`;
    }
    
    // Switch to session by ID
    switchToSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            this.currentSession = session;
            return true;
        }
        return false;
    }
    
    // Get session by ID
    getSession(sessionId) {
        return this.sessions.find(s => s.id === sessionId);
    }
    
    // Delete session
    deleteSession(sessionId) {
        const index = this.sessions.findIndex(s => s.id === sessionId);
        if (index > -1) {
            // If deleting current session, switch to default or first available
            if (this.sessions[index].id === this.currentSession.id) {
                if (this.sessions.length > 1) {
                    const nextIndex = index === 0 ? 1 : index - 1;
                    this.currentSession = this.sessions[nextIndex];
                } else {
                    // Create new default session
                    this.currentSession = this.getOrCreateDefaultSession();
                }
            }
            
            this.sessions.splice(index, 1);
            this.saveSessions();
            return true;
        }
        return false;
    }
    
    // Get all sessions
    getAllSessions() {
        return this.sessions;
    }
    
    // Clear all sessions
    clearAllSessions() {
        this.sessions = [];
        this.currentSession = this.getOrCreateDefaultSession();
        this.saveSessions();
    }
}

// Chat Session class
class ChatSession {
    constructor(id, title, persona = 'default') {
        this.id = id;
        this.title = title;
        this.persona = persona;
        this.messages = [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.pinned = false;
        this.totalTokens = 0;
    }
    
    // Add message to session
    addMessage(role, content, metadata = {}) {
        const message = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            role, // 'user', 'ai', 'system'
            content,
            timestamp: new Date(),
            metadata
        };
        
        this.messages.push(message);
        this.updatedAt = new Date();
        
        // Update token count if available
        if (metadata.usage && metadata.usage.total_tokens) {
            this.totalTokens += metadata.usage.total_tokens;
        }
        
        return message;
    }
    
    // Get last user message
    getLastUserMessage() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            if (this.messages[i].role === 'user') {
                return this.messages[i];
            }
        }
        return null;
    }
    
    // Get conversation context (last N messages)
    getContext(maxMessages = 10) {
        return this.messages
            .filter(msg => msg.role !== 'system')
            .slice(-maxMessages);
    }
    
    // Get total tokens used
    getTotalTokens() {
        return this.totalTokens;
    }
    
    // Get session duration
    getDuration() {
        return new Date() - this.createdAt;
    }
    
    // Get formatted time string
    getTimeString() {
        const now = new Date();
        const diffMs = now - this.updatedAt;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return this.updatedAt.toLocaleDateString();
    }
    
    // Export session data
    export() {
        return {
            id: this.id,
            title: this.title,
            persona: this.persona,
            messages: this.messages,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            totalTokens: this.totalTokens,
            messageCount: this.messages.length
        };
    }
    
    // Convert to storage format
    toData() {
        return {
            id: this.id,
            title: this.title,
            persona: this.persona,
            messages: this.messages,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            pinned: this.pinned,
            totalTokens: this.totalTokens
        };
    }
    
    // Create from storage data
    static fromData(data) {
        const session = new ChatSession(data.id, data.title, data.persona);
        session.messages = data.messages || [];
        session.createdAt = new Date(data.createdAt);
        session.updatedAt = new Date(data.updatedAt);
        session.pinned = data.pinned || false;
        session.totalTokens = data.totalTokens || 0;
        return session;
    }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SessionManager, ChatSession };
} else {
    window.SessionManager = SessionManager;
    window.ChatSession = ChatSession;
}