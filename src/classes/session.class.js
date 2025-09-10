// Session Management Class for Modern Chatbot
class ChatSession {
    constructor(id = null, title = "New Chat") {
        this.id = id || this.generateId();
        this.title = title;
        this.messages = [];
        this.created = new Date();
        this.lastActivity = new Date();
        this.pinned = false;
        this.persona = "default";
    }

    generateId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    addMessage(role, content) {
        const message = {
            id: this.generateId(),
            role: role, // 'user', 'ai', 'system'
            content: content,
            timestamp: new Date(),
            tokens: content.length // Rough estimate
        };
        
        this.messages.push(message);
        this.lastActivity = new Date();
        
        // Update session title if it's the first user message and still "New Chat"
        if (this.title === "New Chat" && role === 'user' && this.messages.filter(m => m.role === 'user').length === 1) {
            this.title = content.substring(0, 30) + (content.length > 30 ? "..." : "");
        }
        
        return message;
    }

    getMessageCount() {
        return this.messages.length;
    }

    getTotalTokens() {
        return this.messages.reduce((total, msg) => total + msg.tokens, 0);
    }

    getTimeString() {
        const now = new Date();
        const diff = now - this.lastActivity;
        
        if (diff < 60000) return "Now";
        if (diff < 3600000) return Math.floor(diff / 60000) + "m";
        if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
        return Math.floor(diff / 86400000) + "d";
    }

    export() {
        return {
            id: this.id,
            title: this.title,
            messages: this.messages,
            created: this.created.toISOString(),
            lastActivity: this.lastActivity.toISOString(),
            pinned: this.pinned || false,
            persona: this.persona || "default"
        };
    }

    static import(data) {
        const session = new ChatSession(data.id, data.title);
        session.messages = data.messages;
        session.created = new Date(data.created);
        session.lastActivity = new Date(data.lastActivity);
        session.pinned = data.pinned || false;
        session.persona = data.persona || "default";
        return session;
    }
}

// Session Manager
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.currentSession = null;
        this.loadSessions();
    }

    createNewSession() {
        const session = new ChatSession();
        this.sessions.set(session.id, session);
        this.currentSession = session;
        this.saveSessions();
        return session;
    }

    getSession(id) {
        return this.sessions.get(id);
    }

    switchToSession(id) {
        const session = this.sessions.get(id);
        if (session) {
            this.currentSession = session;
            return true;
        }
        return false;
    }

    deleteSession(id) {
        if (this.sessions.has(id)) {
            this.sessions.delete(id);
            if (this.currentSession && this.currentSession.id === id) {
                // Switch to most recent session or create new one
                const sortedSessions = Array.from(this.sessions.values())
                    .sort((a, b) => b.lastActivity - a.lastActivity);
                this.currentSession = sortedSessions[0] || this.createNewSession();
            }
            this.saveSessions();
            return true;
        }
        return false;
    }

    getAllSessions() {
        return Array.from(this.sessions.values())
            .sort((a, b) => {
                // Pinned sessions come first
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                // Then sort by last activity
                return b.lastActivity - a.lastActivity;
            });
    }

    saveSessions() {
        try {
            const data = {
                sessions: Array.from(this.sessions.entries()).map(([id, session]) => [id, session.export()]),
                currentSessionId: this.currentSession ? this.currentSession.id : null
            };
            localStorage.setItem('edex_chat_sessions', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save sessions:', e);
        }
    }

    loadSessions() {
        try {
            const data = JSON.parse(localStorage.getItem('edex_chat_sessions'));
            if (data && data.sessions) {
                for (const [id, sessionData] of data.sessions) {
                    const session = ChatSession.import(sessionData);
                    this.sessions.set(id, session);
                }
                
                if (data.currentSessionId && this.sessions.has(data.currentSessionId)) {
                    this.currentSession = this.sessions.get(data.currentSessionId);
                }
            }
        } catch (e) {
            console.warn('Failed to load sessions:', e);
        }
        
        // Create default session if none exist
        if (this.sessions.size === 0) {
            this.createNewSession();
        } else if (!this.currentSession) {
            this.currentSession = this.getAllSessions()[0];
        }
    }
}

// Export for use in main.js
window.ChatSession = ChatSession;
window.SessionManager = SessionManager;