// src/renderer/events.js - Event handling
import { _delay } from './utils.js';

let selectedFiles = [];
let fileUploadStatus = {}; // Track upload status for each file

export function setupEventListeners() {
    // Send button
    const sendButton = document.getElementById("send_button");
    if (sendButton) {
        sendButton.addEventListener("click", handleSendMessage);
    }
    
    // Cancel streaming button
    const cancelStreamingButton = document.getElementById("cancel_streaming_button");
    if (cancelStreamingButton) {
        cancelStreamingButton.addEventListener("click", handleCancelStreaming);
    }
    
    // Chat input
    const chatInput = document.getElementById("chat_input");
    if (chatInput) {
        chatInput.addEventListener("keydown", handleChatInputKeydown);
    }
    
    // New chat button
    const newChatButton = document.getElementById("new_chat_btn");
    if (newChatButton) {
        newChatButton.addEventListener("click", handleNewChat);
    }
    
    // Settings button - handled by SettingsBridge
    // const settingsButton = document.getElementById("settings_btn");
    // if (settingsButton) {
    //     settingsButton.addEventListener("click", handleSettings);
    // }
    
    // About button
    const aboutButton = document.getElementById("about_btn");
    if (aboutButton) {
        aboutButton.addEventListener("click", handleAbout);
    }
    
    // Model selector
    const modelSelector = document.getElementById("model_selector");
    if (modelSelector) {
        modelSelector.addEventListener("change", handleModelChange);
    }
    
    // Session search
    const sessionSearch = document.getElementById("session_search");
    if (sessionSearch) {
        sessionSearch.addEventListener("input", handleSessionSearch);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById("theme_toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }
    
    // File upload functionality
    const fileUploadBtn = document.getElementById("file_upload_btn");
    const fileInput = document.getElementById("file_input");
    const filePreview = document.getElementById("file_preview");
    const inputContainer = document.querySelector(".input_container");
    
    if (fileUploadBtn && fileInput) {
        fileUploadBtn.addEventListener("click", () => {
            fileInput.click();
        });
        
        fileInput.addEventListener("change", handleFileSelect);
    }
    
    // Drag and drop functionality
    if (inputContainer) {
        inputContainer.addEventListener("dragover", handleDragOver);
        inputContainer.addEventListener("dragleave", handleDragLeave);
        inputContainer.addEventListener("drop", handleDrop);
    }
    
    // For the new input dock, we also need to set up drag and drop
    const inputDockContainer = document.querySelector("#input_dock .input_container");
    if (inputDockContainer) {
        inputDockContainer.addEventListener("dragover", handleDragOver);
        inputDockContainer.addEventListener("dragleave", handleDragLeave);
        inputDockContainer.addEventListener("drop", handleDrop);
    }
    
    // Session item click handlers
    setupSessionItemHandlers();
    
    // Modal close handlers
    setupModalCloseHandlers();
    
    // System panel handlers
    setupSystemPanelHandlers();
    
    console.log("✅ Event listeners set up");
}

// Handle send message
async function handleSendMessage() {
    const chatInput = document.getElementById("chat_input");
    if (!chatInput || !chatInput.value.trim()) return;
    
    const message = chatInput.value.trim();
    
    // Add user message to chat
    displayMessage({
        type: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString()
    });
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Disable input while processing
    disableChatInput();
    
    try {
        // Process files if any
        let fileContent = '';
        if (selectedFiles.length > 0) {
            fileContent = await processSelectedFiles();
        }
        
        // Combine message and file content
        const fullMessage = message + fileContent;
        
        // Send to chat component
        if (window.chat) {
            await window.chat.sendMessage(fullMessage);
        }
        
        // Clear selected files after sending
        selectedFiles = [];
        fileUploadStatus = {};
        updateFilePreview();
        
    } catch (error) {
        console.error('Send message error:', error);
        displayError('Failed to send message: ' + error.message);
        window.showToast('Failed to send message', 'error');
    } finally {
        // Hide typing indicator and enable input
        hideTypingIndicator();
        enableChatInput();
    }
}

// Handle cancel streaming button click
function handleCancelStreaming() {
    if (window.chat && typeof window.chat.cancelStreaming === 'function') {
        window.chat.cancelStreaming();
        
        // Hide cancel button
        const cancelStreamingButton = document.getElementById("cancel_streaming_button");
        if (cancelStreamingButton) {
            cancelStreamingButton.style.display = "none";
        }
        
        // Show send button
        const sendButton = document.getElementById("send_button");
        if (sendButton) {
            sendButton.style.display = "inline-block";
        }
        
        window.showToast("Response cancelled", "info");
    }
}

// Enhanced chat input keydown handler
function handleChatInputKeydown(event) {
    // Handle Enter to send message
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
        return;
    }
    
    // Handle Shift+Enter for new line (already handled by default behavior)
    
    // Handle Escape to clear input or cancel streaming
    if (event.key === "Escape") {
        const chatInput = document.getElementById("chat_input");
        if (chatInput && chatInput.value.trim() !== "") {
            if (confirm("Clear the input text?")) {
                chatInput.value = "";
                // Reset textarea height
                chatInput.style.height = 'auto';
            }
        } else {
            // If input is empty, try to cancel streaming
            if (window.chat && window.chat.isStreaming) {
                handleCancelStreaming();
            }
        }
        return;
    }
    
    // Handle Up Arrow to recall previous message
    if (event.key === "ArrowUp" && !event.shiftKey) {
        // If cursor is at the beginning of the input
        const chatInput = document.getElementById("chat_input");
        if (chatInput && chatInput.selectionStart === 0 && chatInput.selectionEnd === 0) {
            // Recall last sent message (would need to implement message history)
            // For now, just prevent default to avoid moving cursor to end
            event.preventDefault();
        }
        return;
    }

    // Auto-resize textarea with a small delay to ensure DOM is updated
    setTimeout(() => {
        const chatInput = document.getElementById("chat_input");
        if (chatInput) {
            chatInput.style.height = 'auto';
            const scrollHeight = chatInput.scrollHeight;
            // Limit the height to prevent it from growing too much
            chatInput.style.height = Math.min(scrollHeight, 200) + 'px';
        }
    }, 0);
}

// File handling functions
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    // Validate file types and sizes
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    const maxImageSize = 10 * 1024 * 1024; // 10MB limit for images
    
    for (const file of files) {
        // Check file type
        const validTypes = ['text/plain', 'text/markdown', 'application/pdf'];
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!validTypes.includes(file.type) && !validImageTypes.includes(file.type) && 
            !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
            window.showToast(`Invalid file type: ${file.name}. Only TXT, MD, PDF, and image files are allowed.`, "error");
            continue;
        }
        
        // Check file size
        const isImage = validImageTypes.includes(file.type) || 
            file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || 
            file.name.endsWith('.png') || file.name.endsWith('.gif') || 
            file.name.endsWith('.webp');
        
        const maxFileSize = isImage ? maxImageSize : maxSize;
        
        if (file.size > maxFileSize) {
            const sizeLimit = isImage ? "10MB" : "5MB";
            window.showToast(`File too large: ${file.name}. Maximum size is ${sizeLimit}.`, "error");
            continue;
        }
        
        validFiles.push(file);
    }
    
    // Add valid files to selected files
    selectedFiles = selectedFiles.concat(validFiles);
    
    // Initialize upload status for new files
    validFiles.forEach(file => {
        fileUploadStatus[file.name] = {
            status: 'pending', // pending, uploading, completed, error
            progress: 0
        };
    });
    
    // Update file preview
    updateFilePreview();
    
    // Clear file input
    event.target.value = '';
}

function updateFilePreview() {
    const filePreview = document.getElementById("file_preview");
    if (!filePreview) return;
    
    filePreview.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-preview-item";
        
        // Add status class based on upload status
        const status = fileUploadStatus[file.name]?.status || 'pending';
        fileItem.classList.add(`file-status-${status}`);
        
        const fileName = document.createElement("span");
        fileName.className = "file-name";
        fileName.textContent = file.name;
        
        // Add file type icon
        const fileTypeIcon = document.createElement("span");
        fileTypeIcon.className = "file-type-icon";
        if (file.type.startsWith('image/')) {
            fileTypeIcon.textContent = "🖼";
        } else if (file.type === 'application/pdf') {
            fileTypeIcon.textContent = "📄";
        } else {
            fileTypeIcon.textContent = "📝";
        }
        
        // Add progress indicator for uploading files
        if (status === 'uploading') {
            const progressContainer = document.createElement("div");
            progressContainer.className = "file-upload-progress-container";
            
            const progressBar = document.createElement("div");
            progressBar.className = "file-upload-progress-bar";
            const progress = fileUploadStatus[file.name]?.progress || 0;
            progressBar.style.width = `${progress}%`;
            
            progressContainer.appendChild(progressBar);
            fileItem.appendChild(progressContainer);
        }
        
        // Add status indicator
        const statusIndicator = document.createElement("span");
        statusIndicator.className = "file-status-indicator";
        switch (status) {
            case 'pending':
                statusIndicator.textContent = "⏳";
                break;
            case 'uploading':
                statusIndicator.textContent = "📤";
                break;
            case 'completed':
                statusIndicator.textContent = "✅";
                break;
            case 'error':
                statusIndicator.textContent = "❌";
                break;
        }
        
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-file";
        removeBtn.innerHTML = "×";
        removeBtn.onclick = () => removeFile(index);
        
        fileItem.appendChild(fileTypeIcon);
        fileItem.appendChild(fileName);
        fileItem.appendChild(statusIndicator);
        fileItem.appendChild(removeBtn);
        filePreview.appendChild(fileItem);
    });
}

function removeFile(index) {
    const file = selectedFiles[index];
    if (file) {
        // Remove from status tracking
        delete fileUploadStatus[file.name];
    }
    
    selectedFiles.splice(index, 1);
    updateFilePreview();
}

// Simulate file upload progress for demonstration
async function simulateFileUpload(file) {
    // Update status to uploading
    fileUploadStatus[file.name] = {
        status: 'uploading',
        progress: 0
    };
    
    // Update UI
    updateFilePreview();
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
        await _delay(100); // Simulate network delay
        fileUploadStatus[file.name].progress = i;
        updateFilePreview();
    }
    
    // Mark as completed
    fileUploadStatus[file.name].status = 'completed';
    fileUploadStatus[file.name].progress = 100;
    updateFilePreview();
    
    window.showToast(`File ${file.name} uploaded successfully`, "success");
}

// Enhanced processSelectedFiles function with visual indicators
async function processSelectedFiles() {
    let combinedContent = "";
    
    for (const file of selectedFiles) {
        try {
            // Update status to uploading
            fileUploadStatus[file.name] = {
                status: 'uploading',
                progress: 0
            };
            updateFilePreview();
            
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 20) {
                await _delay(50); // Simulate network delay
                fileUploadStatus[file.name].progress = i;
                updateFilePreview();
            }
            
            let content = "";
            
            // Check if it's an image file
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const isImage = validImageTypes.includes(file.type) || 
                file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || 
                file.name.endsWith('.png') || file.name.endsWith('.gif') || 
                file.name.endsWith('.webp');
            
            if (file.type === "application/pdf") {
                // For PDF files, we would need a PDF parser
                // For now, we'll just indicate that it's a PDF file
                content = `[PDF File: ${file.name}]\n(PDF processing would be implemented in a full version)`;
            } else if (isImage) {
                // For image files, create a data URL
                content = `[Image File: ${file.name}]\n(Actual image processing would be implemented in a full version)`;
            } else {
                // For text files, read the content
                content = await readFileAsText(file);
            }
            
            // Mark as completed
            fileUploadStatus[file.name].status = 'completed';
            fileUploadStatus[file.name].progress = 100;
            updateFilePreview();
            
            combinedContent += `\n\n--- File: ${file.name} ---\n${content}\n--- End of ${file.name} ---\n`;
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            
            // Mark as error
            fileUploadStatus[file.name] = {
                status: 'error',
                progress: 0
            };
            updateFilePreview();
            
            window.showToast(`Error processing file ${file.name}: ${error.message}`, "error");
        }
    }
    
    return combinedContent;
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

// Drag and drop handlers
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const inputContainer = document.querySelector(".input_container");
    if (inputContainer) {
        inputContainer.classList.add("drag-over");
    }
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const inputContainer = document.querySelector(".input_container");
    if (inputContainer) {
        inputContainer.classList.remove("drag-over");
    }
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const inputContainer = document.querySelector(".input_container");
    if (inputContainer) {
        inputContainer.classList.remove("drag-over");
    }
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        // Create a fake event to pass to handleFileSelect
        const fakeEvent = {
            target: {
                files: files
            }
        };
        handleFileSelect(fakeEvent);
    }
}

// Handle model change
function handleModelChange(event) {
    const model = event.target.value;
    console.log("Model changed to:", model);
    window.showToast(`Model changed to: ${model}`, "info");
    // In a full implementation, we would update the chat component
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
                button.classList.add('active');
                button.style.background = 'rgba(var(--color_r), var(--color_g), var(--color_b), 0.3)';
            } else {
                button.classList.remove('active');
                button.style.background = '';
            }
        }
    });
}

// Toggle session pin
function toggleSessionPin(sessionId) {
    console.log("Toggle pin for session:", sessionId);
    window.showToast("Pin functionality coming soon", "info");
}

// Delete session
function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    console.log("Delete session:", sessionId);
    
    // Call backend to delete session
    fetch(`http://localhost:3001/api/sessions/${sessionId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            window.showToast('Session deleted successfully', 'success');
            loadChatHistory(); // Refresh the session list
        } else {
            window.showToast(result.error || 'Failed to delete session', 'error');
        }
    })
    .catch(error => {
        console.error('Delete session error:', error);
        window.showToast('Failed to delete session', 'error');
    });
}

// Load a specific chat
async function loadChat(chatId) {
    try {
        const response = await fetch(`http://localhost:3001/api/chat/${chatId}`);
        const result = await response.json();
        
        if (result.success) {
            // Load chat messages
            loadChatMessages(result.chat.messages);
            window.showToast(`Loaded chat: ${result.chat.title}`, 'success');
        } else {
            throw new Error(result.error || 'Failed to load chat');
        }
    } catch (error) {
        console.error('Load chat error:', error);
        window.showToast(`Failed to load chat: ${error.message}`, 'error');
    }
}

// Enhanced session search with data management features
function handleSessionSearch(event) {
    const query = event.target.value.trim();
    
    if (query.length > 2) {
        // Perform search after a delay to avoid too many requests
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(async () => {
            const results = await searchChats(query);
            // Update UI with search results
            updateSearchResults(results);
        }, 300);
    } else {
        // Clear search results
        clearSearchResults();
    }
}

// Search chats
async function searchChats(query) {
    try {
        const response = await fetch(`http://localhost:3001/api/data/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result.success) {
            return result.results;
        } else {
            throw new Error(result.error || 'Failed to search chats');
        }
    } catch (error) {
        console.error('Search error:', error);
        window.showToast(`Search failed: ${error.message}`, 'error');
        return [];
    }
}

// Update UI with search results
function updateSearchResults(results) {
    const chatSessions = document.getElementById('chat_sessions');
    if (!chatSessions) return;
    
    // Clear current sessions
    chatSessions.innerHTML = '';
    
    // Add search results
    results.forEach(result => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session_item';
        sessionItem.dataset.session = result.id;
        sessionItem.innerHTML = `
            <span class="session_title">${result.title}</span>
            <span class="session_time">${new Date(result.updatedAt).toLocaleString()}</span>
            <div class="session_actions">
                <button class="session_action pin_btn" title="Pin">📌</button>
                <button class="session_action delete_btn" title="Delete">🗑</button>
            </div>
        `;
        
        // Add click handler to load the chat
        sessionItem.querySelector('.session_title').addEventListener('click', () => {
            loadChat(result.id);
        });
        
        chatSessions.appendChild(sessionItem);
    });
}

// Clear search results and show all sessions
function clearSearchResults() {
    // This would reload all sessions
    loadChatHistory();
}

// Load chat history from localStorage or backend
function loadChatHistory() {
    // In a full implementation, this would load chat history from localStorage or backend
    console.log("Loading chat history...");
    // For now, we'll just log that it's being called
}

// Load chat messages
function loadChatMessages(messages) {
    // Clear current chat display
    clearChatDisplay();
    
    // Display each message
    messages.forEach(message => {
        displayMessage(message);
    });
}

// Clear chat display
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

// Display message
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

// Show typing indicator
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

// Hide typing indicator
function hideTypingIndicator() {
    const typingElement = document.getElementById("typing-indicator");
    if (typingElement) {
        typingElement.remove();
    }
}

// Disable chat input
function disableChatInput() {
    const chatInput = document.getElementById("chat_input");
    const sendButton = document.getElementById("send_button");
    
    if (chatInput) chatInput.disabled = true;
    if (sendButton) sendButton.disabled = true;
}

// Enable chat input
function enableChatInput() {
    const chatInput = document.getElementById("chat_input");
    const sendButton = document.getElementById("send_button");
    
    if (chatInput) chatInput.disabled = false;
    if (sendButton) sendButton.disabled = false;
    
    // Focus the input
    if (chatInput) chatInput.focus();
}

// Display error
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

// Retry last message
function retryLastMessage() {
    // In a full implementation, we would retry the last message
    console.log("Retry last message functionality would be implemented here");
    displayError("Retry functionality would be implemented in a full version");
    window.showToast("Retry functionality coming soon", "info");
}