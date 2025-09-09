// Collaboration utilities for eDEX-UI chatbot
class CollaborationManager {
    constructor() {
        this.tabId = 'tab_' + Math.random().toString(36).substr(2, 9);
        this.init();
    }

    init() {
        // Set up localStorage event listener for inter-tab communication
        window.addEventListener('storage', this.handleStorageChange.bind(this));
        
        // Set up session sharing functionality
        this.setupSessionSharing();
        
        console.log("✅ Real-time collaboration features initialized");
    }

    handleStorageChange(event) {
        // Handle shared session updates
        if (event.key === 'sharedSessionUpdate') {
            const updateData = JSON.parse(event.newValue);
            this.handleSharedSessionUpdate(updateData);
        }
        
        // Handle new message notifications
        if (event.key === 'newMessageNotification') {
            const notificationData = JSON.parse(event.newValue);
            this.handleNewMessageNotification(notificationData);
        }
        
        // Handle session sync requests
        if (event.key === 'sessionSyncRequest') {
            const requestData = JSON.parse(event.newValue);
            this.handleSessionSyncRequest(requestData);
        }
    }

    handleSharedSessionUpdate(updateData) {
        // Only process if this isn't the tab that sent the update
        if (updateData.sourceTabId !== this.tabId) {
            // Update the chat feed with new messages
            if (updateData.type === 'message_added' && window.chat) {
                window.displayMessage(updateData.data);
            }
            
            // Update session list
            if (updateData.type === 'session_updated') {
                this.updateSessionList();
            }
            
            console.log('🔄 Received shared session update:', updateData);
        }
    }

    handleNewMessageNotification(notificationData) {
        // Only process if this isn't the tab that sent the notification
        if (notificationData.sourceTabId !== this.tabId) {
            // Show notification
            window.showToast(`New message in ${notificationData.sessionTitle}`, 'info');
            
            // Update session list to show unread indicator
            this.updateSessionList();
            
            console.log('🔔 Received new message notification:', notificationData);
        }
    }

    handleSessionSyncRequest(requestData) {
        // Only process if this isn't the tab that sent the request
        if (requestData.sourceTabId !== this.tabId && window.chat) {
            // Send current session data
            const currentSession = window.chat.getCurrentSession();
            if (currentSession) {
                const syncData = {
                    type: 'session_sync_response',
                    sourceTabId: this.tabId,
                    targetTabId: requestData.sourceTabId,
                    sessionId: currentSession.id,
                    messages: currentSession.messages,
                    timestamp: Date.now()
                };
                
                localStorage.setItem('sessionSyncResponse', JSON.stringify(syncData));
                
                console.log('🔄 Sent session sync response:', syncData);
            }
        }
    }

    // Notify other tabs of a new message
    notifyNewMessage(messageData, sessionTitle) {
        const notificationData = {
            type: 'new_message',
            sourceTabId: this.tabId,
            messageData: messageData,
            sessionTitle: sessionTitle,
            timestamp: Date.now()
        };
        
        localStorage.setItem('newMessageNotification', JSON.stringify(notificationData));
        
        // Clear the notification after a short delay to prevent accumulation
        setTimeout(() => {
            localStorage.removeItem('newMessageNotification');
        }, 1000);
    }

    // Share session update with other tabs
    shareSessionUpdate(updateType, data) {
        const updateData = {
            type: updateType,
            sourceTabId: this.tabId,
            data: data,
            timestamp: Date.now()
        };
        
        localStorage.setItem('sharedSessionUpdate', JSON.stringify(updateData));
        
        // Clear the update after a short delay to prevent accumulation
        setTimeout(() => {
            localStorage.removeItem('sharedSessionUpdate');
        }, 1000);
    }

    // Request session sync from other tabs
    requestSessionSync() {
        const requestData = {
            type: 'session_sync_request',
            sourceTabId: this.tabId,
            timestamp: Date.now()
        };
        
        localStorage.setItem('sessionSyncRequest', JSON.stringify(requestData));
        
        // Clear the request after a short delay
        setTimeout(() => {
            localStorage.removeItem('sessionSyncRequest');
        }, 1000);
    }

    // Setup session sharing functionality
    setupSessionSharing() {
        // Add share session button to UI
        const sessionActions = document.querySelector('.sessions_header');
        if (sessionActions) {
            const shareButton = document.createElement('button');
            shareButton.id = 'share_session_btn';
            shareButton.className = 'neon_button';
            shareButton.textContent = '🔗 Share Session';
            shareButton.style.marginTop = '10px';
            shareButton.style.display = 'none'; // Hidden by default
            
            sessionActions.appendChild(shareButton);
            
            // Add event listener
            shareButton.addEventListener('click', this.handleShareSession.bind(this));
        }
        
        // Add event listener for session selection
        const sessionsContainer = document.getElementById('chat_sessions');
        if (sessionsContainer) {
            sessionsContainer.addEventListener('click', (event) => {
                const sessionItem = event.target.closest('.session_item');
                if (sessionItem) {
                    // Update share button visibility
                    this.updateShareButtonVisibility();
                }
            });
        }
    }

    // Update share button visibility
    updateShareButtonVisibility() {
        const shareButton = document.getElementById('share_session_btn');
        if (shareButton) {
            // Only show share button for non-default sessions
            const activeSession = document.querySelector('.session_item.active');
            if (activeSession && activeSession.dataset.session !== 'default') {
                shareButton.style.display = 'block';
            } else {
                shareButton.style.display = 'none';
            }
        }
    }

    // Handle share session button click
    handleShareSession() {
        if (!window.chat) return;
        
        const currentSession = window.chat.getCurrentSession();
        if (!currentSession) {
            window.showToast('No active session to share', 'error');
            return;
        }
        
        // Create shareable session data
        const sessionData = {
            id: currentSession.id,
            title: currentSession.title || 'Shared Session',
            messages: currentSession.messages,
            createdAt: currentSession.createdAt,
            sharedAt: new Date().toISOString()
        };
        
        // Convert to JSON and create data URL
        const sessionJson = JSON.stringify(sessionData, null, 2);
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(sessionJson)}`;
        
        // Create temporary link for download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `shared-session-${currentSession.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.showToast('Session exported for sharing', 'success');
    }

    // Update session list with collaboration indicators
    updateSessionList() {
        // This function would update the session list UI to show collaboration indicators
        // For now, we'll just log that it would be called
        console.log('🔄 Updating session list for collaboration');
    }
}

// Export the CollaborationManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollaborationManager;
} else {
    window.CollaborationManager = CollaborationManager;
}