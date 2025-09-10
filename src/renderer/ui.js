// src/renderer/ui.js - UI initialization and management
import { _delay } from './utils.js';
import { loadDefaultProfile } from './profile.js';
import { loadApiSettings } from './apiSettings.js';
import { setupEventListeners } from './events.js';
import Chat from '../classes/chatbot.class.js';
import lmstudioService from '../services/lmstudioService.js';

// Load chat history from localStorage or backend
function loadChatHistory() {
    // In a full implementation, this would load chat history from localStorage or backend
    console.log("Loading chat history...");
    // For now, we'll just log that it's being called
}

// Check backend connection
async function checkBackendConnection() {
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        
        if (data.status === 'healthy') {
            console.log("Backend connection healthy");
            const statusElement = document.getElementById("connection_status");
            if (statusElement) {
                statusElement.textContent = "ONLINE";
                statusElement.style.color = "rgb(var(--color_r), var(--color_g), var(--color_b))";
            }
        } else {
            console.warn("Backend connection issue:", data);
            const statusElement = document.getElementById("connection_status");
            if (statusElement) {
                statusElement.textContent = "ISSUE";
                statusElement.style.color = "var(--color_yellow)";
            }
        }
    } catch (error) {
        console.error("Backend connection failed:", error);
        const statusElement = document.getElementById("connection_status");
        if (statusElement) {
            statusElement.textContent = "OFFLINE";
            statusElement.style.color = "var(--color_red)";
        }
    }
}

// Check LM Studio connection
async function checkLMStudioConnection() {
    // Only show LM Studio status when LM Studio provider is selected
    const providerSelector = document.getElementById("provider_selector");
    const lmstudioStatusItem = document.getElementById("lmstudio_status_item");
    
    if (providerSelector && providerSelector.value === 'lmstudio') {
        if (lmstudioStatusItem) {
            lmstudioStatusItem.style.display = "flex";
        }
        
        const statusElement = document.getElementById("lmstudio_connection_status");
        if (statusElement) {
            statusElement.textContent = "CHECKING";
            statusElement.className = "status_value checking";
        }
        
        try {
            // Dynamically import lmstudioService
            const { default: lmstudioService } = await import('../services/lmstudioService.js');
            const result = await lmstudioService.testConnection();
            
            if (result.success) {
                if (statusElement) {
                    statusElement.textContent = "ONLINE";
                    statusElement.className = "status_value online";
                }
            } else {
                if (statusElement) {
                    statusElement.textContent = "OFFLINE";
                    statusElement.className = "status_value offline";
                }
            }
        } catch (error) {
            if (statusElement) {
                statusElement.textContent = "ERROR";
                statusElement.className = "status_value offline";
            }
        }
    } else {
        // Hide LM Studio status when not using LM Studio
        if (lmstudioStatusItem) {
            lmstudioStatusItem.style.display = "none";
        }
    }
}

// Start clock
function startClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        const clockElement = document.getElementById("system_clock");
        if (clockElement) {
            clockElement.textContent = timeString;
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

export async function initUI() {
    await _delay(10);
    
    // Show the modern chatbot interface
    const appContainer = document.getElementById("app_container");
    if (appContainer) {
        appContainer.style.display = "flex";
    }
    
    // Check if we're using the modular UI approach
    const isModularUI = document.getElementById('status_header') && 
                       document.getElementById('status_header').innerHTML.trim() === '';
    
    if (isModularUI) {
        // Use modular UI initialization
        console.log("Initializing modular UI");
        await initModularUI();
    } else {
        // Use traditional UI initialization
        console.log("Initializing traditional UI");
        await initTraditionalUI();
    }
}

async function initModularUI() {
    // Define the partials to load
    const partials = [
        { id: 'status_header', path: 'ui/partials/header.html' },
        { id: 'sidebar', path: 'ui/partials/sidebar.html' },
        { id: 'chat_main', path: 'ui/partials/chat_main.html' },
        { id: 'input_dock', path: 'ui/partials/input_dock.html' }
    ];

    try {
        // Load all partials
        await window.partialLoader.loadAllPartials(partials);
        console.log('Partials loaded successfully');
        
        // Initialize UI components after partials are loaded
        await initUIComponents();
        
        // Set up event listeners for modals
        setupModalListeners();
        
    } catch (error) {
        console.error('Failed to initialize modular UI:', error);
        // Fallback to traditional UI if dynamic loading fails
        await initTraditionalUI();
    }
}

async function initTraditionalUI() {
    // Initialize chat component
    try {
        const { default: Chat } = await import('../classes/chatbot.class.js');
        window.chat = new Chat({
            parentId: "chat_feed",
            onmessage: handleChatMessage
        });
        
        console.log("✅ Chat component initialized");
    } catch (e) {
        console.error("❌ Failed to initialize chat component:", e);
        window.showToast("Failed to initialize chat component", "error");
    }
    
    // Load chat history
    loadChatHistory();
    
    // Load saved API settings
    loadApiSettings();
    
    // Load default profile
    await loadDefaultProfile();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start clock
    startClock();
    
    // Check backend connection
    checkBackendConnection();
    
    // Check LM Studio connection
    checkLMStudioConnection();
    
    // Set up global keyboard navigation
    setupKeyboardNavigation();
    
    // Add data management features
    addExportButton();
    setupImportFunctionality();
    
    console.log("✅ Traditional UI initialization complete");
}

async function initUIComponents() {
    console.log('Initializing UI components');
    
    // Initialize clock
    startClock();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize chat component
    try {
        const { default: Chat } = await import('../classes/chatbot.class.js');
        window.chat = new Chat({
            parentId: "chat_feed",
            onmessage: handleChatMessage
        });
        
        console.log("✅ Chat component initialized");
    } catch (e) {
        console.error("❌ Failed to initialize chat component:", e);
        window.showToast("Failed to initialize chat component", "error");
    }
    
    // Load chat history
    loadChatHistory();
    
    // Load saved API settings
    loadApiSettings();
    
    // Load default profile
    await loadDefaultProfile();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check backend connection
    checkBackendConnection();
    
    // Check LM Studio connection
    checkLMStudioConnection();
    
    // Set up global keyboard navigation
    setupKeyboardNavigation();
    
    // Add data management features
    addExportButton();
    setupImportFunctionality();
    
    console.log('UI components initialized');
}

function initThemeToggle() {
    const themeToggle = document.getElementById("theme_toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function() {
            document.body.classList.toggle("dark-theme");
            document.body.classList.toggle("light-theme");
            
            if (document.body.classList.contains("light-theme")) {
                this.innerHTML = "☀️ Light";
            } else {
                this.innerHTML = "🌙 Dark";
            }
        });
    }
}

function setupModalListeners() {
    // Profile Management Modal
    const profileBtn = document.getElementById("profile_btn");
    if (profileBtn) {
        profileBtn.addEventListener("click", async function() {
            try {
                await window.modalManager.showModal('profile_management_modal', 'ui/modals/profile_modal.html');
            } catch (error) {
                console.error('Failed to show profile modal:', error);
                alert('Failed to open profile management. Please try again.');
            }
        });
    }
    
    // API Settings Modal
    const settingsBtn = document.getElementById("settings_btn");
    if (settingsBtn) {
        settingsBtn.addEventListener("click", async function() {
            try {
                await window.modalManager.showModal('api_settings_modal', 'ui/modals/api_modal.html');
            } catch (error) {
                console.error('Failed to show API settings modal:', error);
                alert('Failed to open API settings. Please try again.');
            }
        });
    }
    
    // Tools Management Modal
    const toolsBtn = document.getElementById("tools_btn");
    if (toolsBtn) {
        toolsBtn.addEventListener("click", async function() {
            try {
                await window.modalManager.showModal('tools_management_modal', 'ui/modals/tools_modal.html');
            } catch (error) {
                console.error('Failed to show tools modal:', error);
                alert('Failed to open tools management. Please try again.');
            }
        });
    }
}

// Chat message handler
function handleChatMessage(event) {
    switch(event.type) {
        case 'message_added':
            // Update UI with new message
            displayMessage(event.data);
            break;
        case 'typing_start':
            // Show typing indicator
            showTypingIndicator();
            // Show cancel button and hide send button
            const cancelStreamingBtn = document.getElementById("cancel_streaming_button");
            const sendBtnElement = document.getElementById("send_button");
            if (cancelStreamingBtn) {
                cancelStreamingBtn.style.display = "inline-block";
            }
            if (sendBtnElement) {
                sendBtnElement.style.display = "none";
            }
            break;
        case 'typing_end':
            // Hide typing indicator
            hideTypingIndicator();
            // Hide cancel button and show send button
            const cancelBtnElement = document.getElementById("cancel_streaming_button");
            const sendButtonElement = document.getElementById("send_button");
            if (cancelBtnElement) {
                cancelBtnElement.style.display = "none";
            }
            if (sendButtonElement) {
                sendButtonElement.style.display = "inline-block";
            }
            break;
        case 'processing_start':
            // Disable input
            disableChatInput();
            break;
        case 'processing_end':
            // Enable input
            enableChatInput();
            break;
        case 'error':
            // Show error message
            displayError(event.data);
            window.showToast(event.data, "error");
            break;
        case 'new_chat':
            // Handle new chat creation
            console.log("New chat created:", event.data);
            clearChatDisplay();
            window.showToast("New chat session created", "success");
            break;
        case 'chat_loaded':
            // Handle chat loading
            console.log("Chat loaded:", event.data);
            loadChatMessages(event.data.messages);
            window.showToast("Chat loaded successfully", "success");
            break;
        case 'cleared':
            // Handle chat clearing
            clearChatDisplay();
            window.showToast("Chat cleared", "info");
            break;
        case 'stream_start':
            // Handle stream start
            console.log("Stream started");
            break;
        case 'stream_end':
            // Handle stream end
            console.log("Stream ended");
            // Finalize the streaming message
            finalizeStreamingMessage();
            // Hide cancel button and show send button
            const cancelBtn = document.getElementById("cancel_streaming_button");
            const sendBtn = document.getElementById("send_button");
            if (cancelBtn) {
                cancelBtn.style.display = "none";
            }
            if (sendBtn) {
                sendBtn.style.display = "inline-block";
            }
            window.showToast("Response received", "success", 2000);
            break;
        case 'stream_content':
            // Handle streaming content
            updateStreamingMessage(event.data);
            break;
        case 'response':
            // Handle final response (non-streaming)
            displayMessage({ type: 'assistant', content: event.data });
            window.showToast("Response received", "success", 2000);
            break;
        case 'retry_attempt':
            // Handle retry attempt
            console.log(`Retry attempt ${event.data.attempt}/${event.data.maxAttempts}: ${event.data.error}`);
            window.showToast(`Retrying... (${event.data.attempt}/${event.data.maxAttempts})`, "warning");
            break;
    }
}

// Keep track of the current streaming message element
let currentStreamingMessage = null;
let currentStreamingContent = '';

// Update streaming message
function updateStreamingMessage(content) {
    const chatFeed = document.getElementById("chat_feed");
    if (!chatFeed) return;
    
    // If we don't have a streaming message element, create one
    if (!currentStreamingMessage) {
        // Remove existing typing indicator
        const existingIndicator = document.getElementById("typing-indicator");
        if (existingIndicator) existingIndicator.remove();
        
        // Create new streaming message
        currentStreamingMessage = document.createElement("div");
        currentStreamingMessage.className = "message message-assistant streaming";
        
        currentStreamingContent = '';
        
        const messageBubble = document.createElement("div");
        messageBubble.className = "message_bubble";
        
        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.innerHTML = ''; // Will be updated with streaming content
        
        const timeDiv = document.createElement("div");
        timeDiv.className = "message_time";
        timeDiv.textContent = new Date().toLocaleTimeString();
        
        messageBubble.appendChild(contentDiv);
        messageBubble.appendChild(timeDiv);
        currentStreamingMessage.appendChild(messageBubble);
        
        chatFeed.appendChild(currentStreamingMessage);
    }
    
    // Update content
    currentStreamingContent += content;
    
    // Update the displayed content with rendered markdown
    const contentDiv = currentStreamingMessage.querySelector(".message-content");
    if (contentDiv) {
        contentDiv.innerHTML = window.markdownRenderer.render(currentStreamingContent);
    }
    
    // Scroll to bottom
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

// Finalize streaming message
function finalizeStreamingMessage() {
    if (currentStreamingMessage) {
        // Update timestamp
        const timeDiv = currentStreamingMessage.querySelector(".message_time");
        if (timeDiv) {
            timeDiv.textContent = new Date().toLocaleTimeString();
        }
        
        // Remove streaming class
        currentStreamingMessage.classList.remove("streaming");
        
        // Reset streaming variables
        currentStreamingMessage = null;
        currentStreamingContent = '';
    }
}

// UI Update Functions
function displayMessage(messageData) {
    const chatFeed = document.getElementById("chat_feed");
    if (!chatFeed) return;

    // If this is a final response to a streaming message, replace the streaming message
    if (messageData.type === 'assistant' && currentStreamingMessage) {
        // Update the final content and timestamp
        const contentDiv = currentStreamingMessage.querySelector(".message-content");
        const timeDiv = currentStreamingMessage.querySelector(".message_time");
        
        if (contentDiv) {
            contentDiv.innerHTML = window.markdownRenderer.render(messageData.content);
        }
        
        if (timeDiv) {
            timeDiv.textContent = new Date().toLocaleTimeString();
        }
        
        // Reset streaming variables
        currentStreamingMessage = null;
        currentStreamingContent = '';
        return;
    }
    
    // Remove welcome message if this is the first real message
    if (chatFeed.querySelectorAll('.message').length === 1 && 
        chatFeed.querySelector('#welcome_message')) {
        chatFeed.querySelector('#welcome_message').remove();
    }
    
    const messageElement = document.createElement("div");
    messageElement.className = `message message-${messageData.type}`;
    
    // Render markdown content
    const renderedContent = window.markdownRenderer.render(messageData.content);
    
    const icon = messageData.type === 'user' ? '[USER]' : 
                 messageData.type === 'assistant' ? '[AI]' : 
                 '[SYSTEM]';
    
    messageElement.innerHTML = `
        <div class="message_bubble">
            <div class="message-content">${renderedContent}</div>
            <div class="message_time">${messageData.timestamp}</div>
        </div>
    `;
    
    // Add retry button for assistant messages
    if (messageData.type === 'assistant') {
        const retryButton = document.createElement("button");
        retryButton.className = "retry-button neon_button";
        retryButton.textContent = "↻ Regenerate";
        retryButton.onclick = () => retryLastMessage();
        messageElement.appendChild(retryButton);
    }
    
    chatFeed.appendChild(messageElement);
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function showTypingIndicator() {
    const chatFeed = document.getElementById("chat_feed");
    if (!chatFeed) return;
    
    // Remove existing typing indicator
    const existingIndicator = document.getElementById("typing-indicator");
    if (existingIndicator) existingIndicator.remove();
    
    // Remove any existing streaming message
    if (currentStreamingMessage) {
        currentStreamingMessage.remove();
        currentStreamingMessage = null;
        currentStreamingContent = '';
    }
    
    const typingElement = document.createElement("div");
    typingElement.className = "message message-typing";
    typingElement.id = "typing-indicator";
    typingElement.innerHTML = `
        <div class="message_bubble">
            <div class="typing-indicator">
                <span class="typing-text">Thinking</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    
    chatFeed.appendChild(typingElement);
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function hideTypingIndicator() {
    const typingElement = document.getElementById("typing-indicator");
    if (typingElement) {
        typingElement.remove();
    }
}

function disableChatInput() {
    const chatInput = document.getElementById("chat_input");
    const sendButton = document.getElementById("send_button");
    
    if (chatInput) chatInput.disabled = true;
    if (sendButton) sendButton.disabled = true;
}

function enableChatInput() {
    const chatInput = document.getElementById("chat_input");
    const sendButton = document.getElementById("send_button");
    
    if (chatInput) chatInput.disabled = false;
    if (sendButton) sendButton.disabled = false;
    
    // Focus the input
    if (chatInput) chatInput.focus();
}

function displayError(error) {
    const chatFeed = document.getElementById("chat_feed");
    if (!chatFeed) return;
    
    const errorElement = document.createElement("div");
    errorElement.className = "message message-error";
    errorElement.innerHTML = `
        <div class="message_bubble">
            <div class="message-content">${error}</div>
            <div class="message_time">${new Date().toLocaleTimeString()}</div>
        </div>
        <button class="retry-button neon_button" onclick="retryLastMessage()">↻ Retry</button>
    `;
    
    chatFeed.appendChild(errorElement);
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function clearChatDisplay() {
    const chatFeed = document.getElementById("chat_feed");
    if (chatFeed) {
        // Keep the welcome message
        const welcomeMessage = chatFeed.querySelector("#welcome_message");
        chatFeed.innerHTML = "";
        if (welcomeMessage) {
            chatFeed.appendChild(welcomeMessage);
        }
    }
    
    // Reset streaming variables
    currentStreamingMessage = null;
    currentStreamingContent = '';
}

function loadChatMessages(messages) {
    // Clear current chat display
    clearChatDisplay();
    
    // Display each message
    messages.forEach(message => {
        displayMessage(message);
    });
}

function retryLastMessage() {
    // In a full implementation, we would retry the last message
    console.log("Retry last message functionality would be implemented here");
    displayError("Retry functionality would be implemented in a full version");
    window.showToast("Retry functionality coming soon", "info");
}

// Set up global keyboard navigation
function setupKeyboardNavigation() {
    // Add global keydown listener for keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);
    
    // Focus the chat input by default
    const chatInput = document.getElementById("chat_input");
    if (chatInput) {
        chatInput.focus();
    }
}

// Handle global keyboard shortcuts
function handleGlobalKeydown(event) {
    // Ignore if typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        // Allow Escape to blur inputs
        if (event.key === 'Escape') {
            event.target.blur();
        }
        return;
    }
    
    // Handle keyboard shortcuts
    switch (event.key) {
        case 'Enter':
            // Focus chat input
            const chatInput = document.getElementById("chat_input");
            if (chatInput) {
                chatInput.focus();
                event.preventDefault();
            }
            break;
            
        case 'n':
            if (event.ctrlKey || event.metaKey) {
                // Ctrl+N or Cmd+N - New chat
                event.preventDefault();
                handleNewChat();
            }
            break;
            
        case 's':
            if (event.ctrlKey || event.metaKey) {
                // Ctrl+S or Cmd+S - Settings
                event.preventDefault();
                // Open settings via SettingsBridge
                if (window.SettingsBridge) {
                    window.SettingsBridge.open();
                }
            }
            break;
            
        case 'ArrowUp':
            // Navigate to previous session
            if (event.altKey) {
                event.preventDefault();
                navigateSessions('previous');
            }
            break;
            
        case 'ArrowDown':
            // Navigate to next session
            if (event.altKey) {
                event.preventDefault();
                navigateSessions('next');
            }
            break;
            
        case 'f':
            if (event.ctrlKey || event.metaKey) {
                // Ctrl+F or Cmd+F - Focus search
                event.preventDefault();
                const sessionSearch = document.getElementById("session_search");
                if (sessionSearch) {
                    sessionSearch.focus();
                }
            }
            break;
            
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
            // Switch to specific session (1-6)
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                switchToSessionByIndex(parseInt(event.key) - 1);
            }
            break;
            
        case 'Tab':
            // Enhanced tab navigation
            if (!event.shiftKey) {
                // Tab - Move focus forward
                event.preventDefault();
                moveFocusForward();
            } else {
                // Shift+Tab - Move focus backward
                event.preventDefault();
                moveFocusBackward();
            }
            break;
    }
}

// Navigate between sessions
function navigateSessions(direction) {
    const sessions = document.querySelectorAll('.session_item');
    if (sessions.length === 0) return;
    
    // Find current active session
    let currentIndex = -1;
    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].classList.contains('active')) {
            currentIndex = i;
            break;
        }
    }
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % sessions.length;
    } else {
        newIndex = (currentIndex - 1 + sessions.length) % sessions.length;
    }
    
    // Focus the new session
    sessions[newIndex].focus();
    
    // Scroll to make it visible
    sessions[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Switch to session by index (0-5 for sessions 1-6)
function switchToSessionByIndex(index) {
    const sessions = document.querySelectorAll('.session_item');
    if (index >= 0 && index < sessions.length) {
        // Click the session to switch to it
        sessions[index].querySelector('.session_title').click();
    }
}

// Move focus forward through interactive elements
function moveFocusForward() {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const currentIndex = focusableElements.indexOf(document.activeElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    
    focusableElements[nextIndex].focus();
}

// Move focus backward through interactive elements
function moveFocusBackward() {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const currentIndex = focusableElements.indexOf(document.activeElement);
    const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    
    focusableElements[prevIndex].focus();
}

// Get all focusable elements in the correct order
function getFocusableElements() {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '.session_item'
    ];
    
    const elements = Array.from(document.querySelectorAll(focusableSelectors.join(', ')));
    
    // Filter out elements that are hidden or have zero size
    return elements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
    });
}

// Add export button to chat interface
function addExportButton() {
    // Add export button to the sidebar footer
    const sidebarFooter = document.querySelector('.sidebar_footer');
    if (sidebarFooter && !document.getElementById('export_btn')) {
        const exportBtn = document.createElement('div');
        exportBtn.className = 'sidebar_item';
        exportBtn.id = 'export_btn';
        exportBtn.innerHTML = '<span class="sidebar_icon">📤</span><span>EXPORT DATA</span>';
        exportBtn.addEventListener('click', exportAllChats);
        sidebarFooter.appendChild(exportBtn);
    }
}

// Add import functionality
function setupImportFunctionality() {
    // Add import button next to export button
    const sidebarFooter = document.querySelector('.sidebar_footer');
    if (sidebarFooter && !document.getElementById('import_btn')) {
        const importBtn = document.createElement('div');
        importBtn.className = 'sidebar_item';
        importBtn.id = 'import_btn';
        importBtn.innerHTML = '<span class="sidebar_icon">📥</span><span>IMPORT DATA</span>';
        importBtn.addEventListener('click', () => {
            // Create a hidden file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    importChat(event.target.files[0]);
                }
            });
            document.body.appendChild(fileInput);
            fileInput.click();
            // Clean up
            setTimeout(() => {
                document.body.removeChild(fileInput);
            }, 1000);
        });
        sidebarFooter.appendChild(importBtn);
    }
}

// Handle new chat
async function handleNewChat() {
    if (window.chat) {
        try {
            await window.chat.createNewChat();
            console.log("New chat session started");
        } catch (error) {
            console.error("Failed to create new chat:", error);
            displayError("Failed to create new chat");
            window.showToast("Failed to create new chat", "error");
        }
    }
}

// Handle settings - now handled by SettingsBridge
// function handleSettings() {
//     console.log("Settings button clicked");
//     
//     // Show the API settings modal
//     const settingsModal = document.getElementById("api_settings_modal");
//     if (settingsModal) {
//         settingsModal.style.display = "flex";
//         
//         // Add event listeners for modal controls
//         setupSettingsModalListeners();
//         
//         // Populate modal with saved settings
//         populateApiSettingsModal();
//     }
//     
//     // Load profiles
//     loadProfiles();
// }

// Handle about button click
function handleAbout() {
    console.log("About button clicked");
    
    // Show about modal
    const aboutModal = document.getElementById("about_modal");
    if (aboutModal) {
        aboutModal.style.display = "flex";
    }
}

// Setup session item handlers
function setupSessionItemHandlers() {
    const chatSessions = document.getElementById('chat_sessions');
    if (!chatSessions) return;
    
    // Handle session item clicks
    chatSessions.addEventListener('click', (event) => {
        const sessionItem = event.target.closest('.session_item');
        if (sessionItem) {
            const sessionId = sessionItem.dataset.session;
            if (sessionId) {
                loadChat(sessionId);
            }
        }
    });
    
    // Handle session action buttons (pin, delete)
    chatSessions.addEventListener('click', (event) => {
        const actionButton = event.target.closest('.session_action');
        if (actionButton) {
            event.stopPropagation();
            const sessionItem = actionButton.closest('.session_item');
            const sessionId = sessionItem.dataset.session;
            
            if (actionButton.classList.contains('pin_btn')) {
                toggleSessionPin(sessionId);
            } else if (actionButton.classList.contains('delete_btn')) {
                deleteSession(sessionId);
            }
        }
    });
}

// Setup modal close handlers
function setupModalCloseHandlers() {
    // About modal close
    const aboutModalClose = document.getElementById("about_modal_close");
    if (aboutModalClose) {
        aboutModalClose.addEventListener("click", () => {
            document.getElementById("about_modal").style.display = "none";
        });
    }
    
    // Profile modal close
    const profileModalClose = document.getElementById("profile_modal_close");
    if (profileModalClose) {
        profileModalClose.addEventListener("click", () => {
            document.getElementById("profile_management_modal").style.display = "none";
        });
    }
    
    // Click outside to close modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
}

// Setup system panel handlers
function setupSystemPanelHandlers() {
    // System info panel
    const systemInfoBtn = document.getElementById("system_info_btn");
    if (systemInfoBtn) {
        systemInfoBtn.addEventListener("click", () => {
            toggleSystemPanel('system_info');
        });
    }
    
    // System monitor panel
    const systemMonitorBtn = document.getElementById("system_monitor_btn");
    if (systemMonitorBtn) {
        systemMonitorBtn.addEventListener("click", () => {
            toggleSystemPanel('system_monitor');
        });
    }
    
    // System tools panel
    const systemToolsBtn = document.getElementById("system_tools_btn");
    if (systemToolsBtn) {
        systemToolsBtn.addEventListener("click", () => {
            toggleSystemPanel('system_tools');
        });
    }
}

// Toggle system panel visibility
function toggleSystemPanel(panelName) {
    const panel = document.getElementById(`${panelName}_panel`);
    if (!panel) return;
    
    const isVisible = panel.style.display === 'block';
    
    // Hide all system panels
    document.querySelectorAll('.system_panel').forEach(p => {
        p.style.display = 'none';
    });
    
    // Show or hide the clicked panel
    panel.style.display = isVisible ? 'none' : 'block';
    
    // Update button states
    updateSystemPanelButtons(panelName, !isVisible);
}

// Update system panel button states
function updateSystemPanelButtons(activePanel, isActive) {
    const buttons = {
        'system_info': document.getElementById("system_info_btn"),
        'system_monitor': document.getElementById("system_monitor_btn"),
        'system_tools': document.getElementById("system_tools_btn")
    };
    
    Object.entries(buttons).forEach(([panelName, button]) => {
        if (button) {
            if (panelName === activePanel && isActive) {