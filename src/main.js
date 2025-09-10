 // Main application logic adapted from eDEX-UI for Tauri chatbot

// Security helpers
window._escapeHtml = text => {
    let map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => {return map[m];});
};

window._purifyCSS = str => {
    if (typeof str === "undefined") return "";
    if (typeof str !== "string") {
        str = str.toString();
    }
    return str.replace(/[<]/g, "");
};

window._delay = ms => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

// Load theme (from eDEX-UI source with font loading)
window._loadTheme = async theme => {
    if (document.querySelector("style.theming")) {
        document.querySelector("style.theming").remove();
    }

    // Load fonts using FontFace API
    try {
        const mainFont = new FontFace(theme.cssvars.font_main, `url("./assets/fonts/${theme.cssvars.font_main.toLowerCase().replace(/ /g, '_')}.woff2")`);
        const lightFont = new FontFace(theme.cssvars.font_main_light, `url("./assets/fonts/${theme.cssvars.font_main_light.toLowerCase().replace(/ /g, '_')}.woff2")`);
        const termFont = new FontFace(theme.terminal.fontFamily, `url("./assets/fonts/${theme.terminal.fontFamily.toLowerCase().replace(/ /g, '_')}.woff2")`);
        
        document.fonts.add(mainFont);
        document.fonts.load("12px " + theme.cssvars.font_main);
        document.fonts.add(lightFont);
        document.fonts.load("12px " + theme.cssvars.font_main_light);
        document.fonts.add(termFont);
        document.fonts.load("12px " + theme.terminal.fontFamily);
    } catch(e) {
        console.warn("Font loading failed, using fallbacks:", e);
    }

    // Apply CSS variables
    document.querySelector("head").innerHTML += `<style class="theming">
    :root {
        --font_main: "${window._purifyCSS(theme.cssvars.font_main)}";
        --font_main_light: "${window._purifyCSS(theme.cssvars.font_main_light)}";
        --font_mono: "${window._purifyCSS(theme.terminal.fontFamily)}";
        --color_r: ${window._purifyCSS(theme.colors.r)};
        --color_g: ${window._purifyCSS(theme.colors.g)};
        --color_b: ${window._purifyCSS(theme.colors.b)};
        --color_black: ${window._purifyCSS(theme.colors.black)};
        --color_light_black: ${window._purifyCSS(theme.colors.light_black)};
        --color_grey: ${window._purifyCSS(theme.colors.grey)};
        --color_red: ${window._purifyCSS(theme.colors.red) || "red"};
        --color_yellow: ${window._purifyCSS(theme.colors.yellow) || "yellow"};
    }

    body {
        font-family: var(--font_main), sans-serif;
        cursor: ${window.settings?.nocursor ? "none" : "default"} !important;
    }

    ${window.settings?.nocursor ? "* { cursor: none !important; }" : ""}
    ${window._purifyCSS(theme.injectCSS || "")}
    </style>`;

    window.theme = theme;
    window.theme.r = theme.colors.r;
    window.theme.g = theme.colors.g;
    window.theme.b = theme.colors.b;
};

// Boot sequence with authentic eDEX-UI boot log
let bootIndex = 0;
let bootLines = [];

// Load authentic boot sequence
async function loadBootLog() {
    try {
        const response = await fetch('./assets/misc/boot_log.txt');
        const bootText = await response.text();
        bootLines = bootText.split('\n').filter(line => line.trim());
    } catch (e) {
        // Fallback boot sequence
        bootLines = [
            "Welcome to eDEX Chatbot!",
            "vm_page_bootstrap: 987323 free pages and 53061 wired pages",
            "eDEX Chatbot Interface v1.0.0 - Quantum Neural Networks Online",
            "Initializing AI consciousness protocols...",
            "Loading cybernetic interface drivers...",
            "Neural pathways established. Ready for interaction.",
            "Boot Complete"
        ];
    }
}

function displayBootLine() {
    let bootScreen = document.getElementById("boot_screen");
    
    if (typeof bootLines[bootIndex] === "undefined") {
        setTimeout(displayTitleScreen, 300);
        return;
    }

    if (bootLines[bootIndex] === "Boot Complete") {
        // Add audio effect here if needed
    }
    
    bootScreen.innerHTML += bootLines[bootIndex] + "<br/>";
    bootIndex++;

    switch(true) {
        case bootIndex === 2:
            bootScreen.innerHTML += `eDEX Chatbot Interface v1.0.0 - Neural Networks Online at ${Date().toString()}`;
        case bootIndex === 4:
            setTimeout(displayBootLine, 500);
            break;
        case bootIndex > 4 && bootIndex < 25:
            setTimeout(displayBootLine, 30);
            break;
        case bootIndex === 25:
            setTimeout(displayBootLine, 400);
            break;
        case bootIndex === 42:
            setTimeout(displayBootLine, 300);
            break;
        case bootIndex > 42 && bootIndex < 82:
            setTimeout(displayBootLine, 25);
            break;
        case bootIndex >= bootLines.length-2 && bootIndex < bootLines.length:
            setTimeout(displayBootLine, 300);
            break;
        default:
            setTimeout(displayBootLine, Math.pow(1 - (bootIndex/1000), 3)*25);
    }
}

// Title screen
async function displayTitleScreen() {
    let bootScreen = document.getElementById("boot_screen");
    if (bootScreen === null) {
        bootScreen = document.createElement("section");
        bootScreen.setAttribute("id", "boot_screen");
        bootScreen.setAttribute("style", "z-index: 9999999");
        document.body.appendChild(bootScreen);
    }
    bootScreen.innerHTML = "";

    await _delay(400);

    document.body.setAttribute("class", "");
    bootScreen.setAttribute("class", "center");
    bootScreen.innerHTML = "<h1>eDEX CHATBOT</h1>";
    let title = document.querySelector("section > h1");

    await _delay(200);

    document.body.setAttribute("class", "solidBackground");

    await _delay(100);

    title.setAttribute("style", `background-color: rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});border-bottom: 5px solid rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});`);

    await _delay(300);

    title.setAttribute("style", `border: 5px solid rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});`);

    await _delay(100);

    title.setAttribute("style", "");
    title.setAttribute("class", "glitch");

    await _delay(500);

    document.body.setAttribute("class", "");
    title.setAttribute("class", "");
    title.setAttribute("style", `border: 5px solid rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});`);

    await _delay(1000);
    
    bootScreen.remove();
    initUI();
}

// Initialize UI
async function initUI() {
    await _delay(10);
    
    // Show the modern chatbot interface
    document.getElementById("app_container").style.display = "flex";
    
    await _delay(200);
    
    // Dynamically import the Chatbot class since it's an ES6 module
    const { default: Chatbot } = await import('./classes/chatbot.class.js');
    
    // Initialize session manager and chatbot
    window.sessionManager = new SessionManager();
    window.chatbot = new Chatbot({
        terminal: null // We'll use message bubbles instead
    });
    
    // Initialize UI components
    initClock();
    initSessionManagement();
    initChatFeed();
    initInputHandling();
    initStatusUpdates();
    
    await _delay(500);
    
    // Load current session messages
    loadCurrentSession();
    
    console.log("eDEX Chatbot Interface Initialized");
}

// Initialize system clock
function initClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        document.getElementById("system_clock").textContent = timeString;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize uptime counter
    const startTime = Date.now();
    setInterval(() => {
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        document.getElementById("uptime").textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }, 1000);
}

// Initialize session management
function initSessionManagement() {
    const newChatBtn = document.getElementById("new_chat_btn");
    const personaSelector = document.getElementById("persona_selector");
    const sessionSearch = document.getElementById("session_search");
    
    // New chat button with persona
    newChatBtn.addEventListener("click", () => {
        const persona = personaSelector.value;
        const newSession = window.sessionManager.createNewSession();
        newSession.persona = persona;
        renderSessions();
        loadCurrentSession();
        addSystemMessage(`New ${persona} chat session created`);
    });
    
    // Search sessions
    sessionSearch.addEventListener("input", (e) => {
        filterSessions(e.target.value);
    });
    
    // Render initial sessions
    renderSessions();
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById("mobile_menu_toggle");
    const sidebar = document.getElementById("sidebar");
    
    // Show mobile toggle on small screens
    function checkMobile() {
        if (window.innerWidth <= 768) {
            mobileToggle.style.display = "block";
        } else {
            mobileToggle.style.display = "none";
            sidebar.classList.remove("mobile-open");
        }
    }
    
    mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
            sidebar.classList.remove("mobile-open");
        }
    });
    
    window.addEventListener("resize", checkMobile);
    checkMobile();
    
    // Settings and About handlers
    document.getElementById("settings_btn").addEventListener('click', () => {
        openSettingsModal();
    });
    
    document.getElementById("about_btn").addEventListener('click', () => {
        addSystemMessage("eDEX Chatbot Interface v2.0 - Enhanced cyberpunk AI chat experience with advanced features");
    });
}

// Render session list
function renderSessions(filteredSessions = null) {
    const container = document.getElementById("chat_sessions");
    const sessions = filteredSessions || window.sessionManager.getAllSessions();
    
    container.innerHTML = sessions.map(session => `
        <div class="session_item ${session.id === window.sessionManager.currentSession?.id ? 'active' : ''} ${session.pinned ? 'pinned' : ''}" 
             data-session="${session.id}">
            <span class="session_title">${session.title}</span>
            <span class="session_time">${session.getTimeString()}</span>
            <div class="session_actions">
                <button class="session_action pin_btn" title="${session.pinned ? 'Unpin' : 'Pin'}">${session.pinned ? '📌' : '📍'}</button>
                <button class="session_action delete_btn" title="Delete">🗑</button>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.session_item').forEach(item => {
        const sessionId = item.getAttribute('data-session');
        
        item.querySelector('.session_title, .session_time').addEventListener('click', () => {
            if (window.sessionManager.switchToSession(sessionId)) {
                renderSessions();
                loadCurrentSession();
                // Close mobile menu
                document.getElementById("sidebar").classList.remove("mobile-open");
            }
        });
        
        // Pin/unpin functionality
        item.querySelector('.pin_btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const session = window.sessionManager.getSession(sessionId);
            session.pinned = !session.pinned;
            window.sessionManager.saveSessions();
            renderSessions();
        });
        
        // Delete functionality
        item.querySelector('.delete_btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this chat session?')) {
                window.sessionManager.deleteSession(sessionId);
                renderSessions();
                loadCurrentSession();
            }
        });
    });
}

// Filter sessions by search
function filterSessions(query) {
    if (!query.trim()) {
        renderSessions();
        return;
    }
    
    const allSessions = window.sessionManager.getAllSessions();
    const filteredSessions = allSessions.filter(session => 
        session.title.toLowerCase().includes(query.toLowerCase()) ||
        session.messages.some(msg => 
            msg.content.toLowerCase().includes(query.toLowerCase())
        )
    );
    
    renderSessions(filteredSessions);
}

// Initialize chat feed
function initChatFeed() {
    // Remove welcome message after initial load
    setTimeout(() => {
        const welcome = document.getElementById("welcome_message");
        if (welcome && window.sessionManager.currentSession.messages.length > 0) {
            welcome.style.display = "none";
        }
    }, 2000);
}

// Load current session messages
function loadCurrentSession() {
    const chatFeed = document.getElementById("chat_feed");
    const session = window.sessionManager.currentSession;
    
    // Clear existing messages (except welcome)
    const existingMessages = chatFeed.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Add session messages
    session.messages.forEach(message => {
        addMessageBubble(message.role, message.content, message.timestamp);
    });
    
    // Update stats
    updateStats();
    
    // Scroll to bottom
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

// Add message bubble with markdown support
function addMessageBubble(role, content, timestamp = new Date()) {
    const chatFeed = document.getElementById("chat_feed");
    const timeString = timestamp.toLocaleTimeString ? timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}_message`;
    
    if (role === 'system') {
        messageDiv.innerHTML = `
            <span class="message_icon">[SYSTEM]</span>
            <span class="message_content">${content}</span>
            <span class="message_time">${timeString}</span>
        `;
    } else {
        // Initialize markdown renderer if not exists
        if (!window.markdownRenderer) {
            window.markdownRenderer = new MarkdownRenderer();
        }
        
        // Render markdown for AI and user messages
        const renderedContent = window.markdownRenderer.render(content);
        
        messageDiv.innerHTML = `
            <div class="message_bubble markdown-content">${renderedContent}</div>
            <div class="message_time">${timeString}</div>
        `;
    }
    
    chatFeed.appendChild(messageDiv);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    
    return messageDiv;
}

// Add system message
function addSystemMessage(content) {
    addMessageBubble('system', content);
}

// Initialize input handling
function initInputHandling() {
    const chatInput = document.getElementById("chat_input");
    const sendButton = document.getElementById("send_button");
    const slashSuggestions = document.getElementById("slash_suggestions");
    let selectedSuggestion = -1;
    
    // Slash commands
    const slashCommands = [
        { command: "/summarize", description: "Summarize the conversation" },
        { command: "/translate", description: "Translate text to another language" },
        { command: "/explain", description: "Explain a complex topic simply" },
        { command: "/code", description: "Generate code for a specific task" },
        { command: "/debug", description: "Help debug code or issues" },
        { command: "/clear", description: "Clear the current chat session" },
        { command: "/export", description: "Export chat history" },
        { command: "/help", description: "Show available commands" }
    ];
    
    // Auto-resize textarea
    chatInput.addEventListener("input", (e) => {
        chatInput.style.height = "auto";
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
        
        // Handle slash commands
        const value = e.target.value;
        if (value.startsWith('/') && value.length > 1) {
            showSlashSuggestions(value);
        } else {
            hideSlashSuggestions();
        }
        
        // Update status
        const wordCount = value.split(/\s+/).filter(word => word.length > 0).length;
        document.getElementById("input_status_text").textContent = 
            `${wordCount} words - Press Enter to send, Shift+Enter for new line`;
    });
    
    // Slash command suggestions
    function showSlashSuggestions(input) {
        const filtered = slashCommands.filter(cmd => 
            cmd.command.toLowerCase().includes(input.toLowerCase())
        );
        
        if (filtered.length > 0) {
            slashSuggestions.innerHTML = filtered.map((cmd, index) => `
                <div class="slash-suggestion ${index === selectedSuggestion ? 'selected' : ''}" data-command="${cmd.command}">
                    <div class="slash-command">${cmd.command}</div>
                    <div class="slash-description">${cmd.description}</div>
                </div>
            `).join('');
            
            slashSuggestions.style.display = 'block';
            
            // Add click handlers
            slashSuggestions.querySelectorAll('.slash-suggestion').forEach(item => {
                item.addEventListener('click', () => {
                    const command = item.getAttribute('data-command');
                    chatInput.value = command + ' ';
                    hideSlashSuggestions();
                    chatInput.focus();
                });
            });
        } else {
            hideSlashSuggestions();
        }
    }
    
    function hideSlashSuggestions() {
        slashSuggestions.style.display = 'none';
        selectedSuggestion = -1;
    }
    
    // Enhanced keyboard handling
    chatInput.addEventListener("keydown", (e) => {
        if (slashSuggestions.style.display === 'block') {
            const suggestions = slashSuggestions.querySelectorAll('.slash-suggestion');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestion = Math.min(selectedSuggestion + 1, suggestions.length - 1);
                updateSuggestionSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestion = Math.max(selectedSuggestion - 1, -1);
                updateSuggestionSelection();
            } else if (e.key === 'Tab' && selectedSuggestion >= 0) {
                e.preventDefault();
                const command = suggestions[selectedSuggestion].getAttribute('data-command');
                chatInput.value = command + ' ';
                hideSlashSuggestions();
            } else if (e.key === 'Escape') {
                hideSlashSuggestions();
            }
        }
        
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (slashSuggestions.style.display === 'block' && selectedSuggestion >= 0) {
                const suggestions = slashSuggestions.querySelectorAll('.slash-suggestion');
                const command = suggestions[selectedSuggestion].getAttribute('data-command');
                chatInput.value = command + ' ';
                hideSlashSuggestions();
            } else {
                sendMessage();
            }
        }
    });
    
    function updateSuggestionSelection() {
        const suggestions = slashSuggestions.querySelectorAll('.slash-suggestion');
        suggestions.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedSuggestion);
        });
    }
    
    // Model selector
    const modelSelector = document.getElementById("model_selector");
    modelSelector.addEventListener("change", (e) => {
        const selectedModel = e.target.value;
        addSystemMessage(`Model changed to: ${e.target.options[e.target.selectedIndex].text}`);
        // Store model preference
        localStorage.setItem('edex_selected_model', selectedModel);
    });
    
    // Load saved model preference
    const savedModel = localStorage.getItem('edex_selected_model');
    if (savedModel) {
        modelSelector.value = savedModel;
    }
    
    // Send button
    sendButton.addEventListener("click", sendMessage);
    
    // Focus input
    chatInput.focus();
}

// Send message handler
async function sendMessage() {
    const chatInput = document.getElementById("chat_input");
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input first
    chatInput.value = "";
    chatInput.style.height = "auto";
    document.getElementById("input_status_text").textContent = "Ready for input - Press Enter to send, Shift+Enter for new line";
    
    // Check for slash commands
    if (message.startsWith('/')) {
        await handleSlashCommand(message);
        return;
    }
    
    // Add user message to session
    const session = window.sessionManager.currentSession;
    const userMessage = session.addMessage('user', message);
    
    // Add message bubble
    addMessageBubble('user', message);
    
    // Check if streaming is enabled
    const settings = JSON.parse(localStorage.getItem('edex-settings') || '{}');
    const useStreaming = settings.tokenRendering !== false; // Default to true if not set
    
    if (useStreaming) {
        // Use streaming
        await streamMessage(message);
    } else {
        // Use non-streaming (existing behavior)
        // Add typing indicator
        const typingDiv = addMessageBubble('ai', `
            <div class="typing_indicator">
                <span>Processing neural patterns</span>
                <div class="typing_dots">
                    <div class="typing_dot"></div>
                    <div class="typing_dot"></div>
                    <div class="typing_dot"></div>
                </div>
            </div>
        `);
        
        // Simulate API call delay and get response
        setTimeout(async () => {
            // Remove typing indicator
            typingDiv.remove();
            
            // Get AI response from chatbot
            const response = await window.chatbot.generateResponse(message);
            
            // Add AI message to session
            session.addMessage('ai', response);
            
            // Add AI response bubble
            addMessageBubble('ai', response);
            
            // Update UI
            window.sessionManager.saveSessions();
            renderSessions();
            updateStats();
            
            // Focus input
            chatInput.focus();
        }, 1000 + Math.random() * 2000);
    }
}

// Stream message handler
async function streamMessage(message) {
    // Get current provider and model from settings
    const modelSelector = document.getElementById("model_selector");
    const selectedValue = modelSelector.value;
    
    // Parse provider and model from selection (format: "provider-model")
    let provider = 'openai';
    let model = 'gpt-4o';
    
    if (selectedValue && selectedValue.includes('-')) {
        const parts = selectedValue.split('-');
        provider = parts[0];
        model = parts.slice(1).join('-');
    }
    
    // Get settings
    const settings = JSON.parse(localStorage.getItem('edex-settings') || '{}');

    // Get API key from saved configs
    const apiConfigs = JSON.parse(localStorage.getItem('edex_api_configs') || '{}');
    const currentProvider = localStorage.getItem('edex_current_provider') || 'openai';
    const apiKey = apiConfigs[currentProvider]?.apiKey;

    // Add typing indicator that will be updated with streaming content
    const aiMessageDiv = addMessageBubble('ai', '');
    const messageContent = document.createElement('div');
    messageContent.className = 'message_bubble markdown-content streaming-content';
    messageContent.innerHTML = '<div class="typing_indicator"><span>Processing neural patterns</span><div class="typing_dots"><div class="typing_dot"></div><div class="typing_dot"></div><div class="typing_dot"></div></div></div>';
    aiMessageDiv.innerHTML = '';
    aiMessageDiv.appendChild(messageContent);
    
    // Add stop button
    const stopButton = document.createElement('button');
    stopButton.className = 'stop-button neon_button';
    stopButton.innerHTML = '⏹ STOP';
    stopButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 10px;
        padding: 5px 10px;
        font-size: 12px;
        z-index: 100;
    `;
    aiMessageDiv.appendChild(stopButton);
    
    const timeDiv = aiMessageDiv.querySelector('.message_time');
    if (timeDiv) {
        aiMessageDiv.appendChild(timeDiv); // Move time to end
    }
    
    // Get chat feed and scroll to bottom
    const chatFeed = document.getElementById("chat_feed");
    chatFeed.scrollTop = chatFeed.scrollHeight;
    
    // Build backend URL - Fixed to handle Electron environment properly
    let backendUrl;
    const hostname = window.location.hostname;
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
        // For Electron apps and localhost development
        backendUrl = 'http://localhost:3001';
    } else {
        // For deployed web applications
        backendUrl = `https://${hostname.replace(/:\d+$/, '')}:3001`;
    }
    
    // Create AbortController for cancellation
    const controller = new AbortController();
    const { signal } = controller;
    
    let accumulatedContent = '';
    let messageBubble = messageContent;
    let isStreaming = true;
    
    // Stop button handler
    stopButton.addEventListener('click', () => {
        if (isStreaming) {
            isStreaming = false;
            controller.abort(); // Abort the fetch request
            stopButton.disabled = true;
            stopButton.innerHTML = 'STOPPED';
            
            // Add a note that streaming was stopped
            if (!accumulatedContent.endsWith('\n\n[Streaming stopped by user]')) {
                accumulatedContent += '\n\n[Streaming stopped by user]';
                if (!window.markdownRenderer) {
                    window.markdownRenderer = new MarkdownRenderer();
                }
                messageBubble.innerHTML = window.markdownRenderer.render(accumulatedContent);
            }
            
            // Add final message to session
            const session = window.sessionManager.currentSession;
            session.addMessage('ai', accumulatedContent);
            
            // Update UI
            window.sessionManager.saveSessions();
            renderSessions();
            updateStats();
            
            // Focus input
            document.getElementById("chat_input").focus();
        }
    });
    
    try {
        // Make streaming request using fetch with ReadableStream
        const response = await fetch(`${backendUrl}/api/chat/stream?` + new URLSearchParams({
            message: message,
            provider: provider,
            model: model,
            config: JSON.stringify({
                temperature: settings.temperature || 0.7,
                maxTokens: settings.maxTokens || 2048,
                topP: settings.topP || 1.0,
                systemPrompt: settings.systemPrompt,
                apiKey: apiKey // Include API key in config
            })
        }), {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream'
            },
            signal // Attach abort signal
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!response.body) {
            throw new Error('ReadableStream not supported');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (isStreaming) {
            const { done, value } = await reader.read();
            
            if (done) {
                if (isStreaming) {
                    isStreaming = false;
                    stopButton.disabled = true;
                    stopButton.innerHTML = 'DONE';
                    
                    // Add final message to session
                    const session = window.sessionManager.currentSession;
                    session.addMessage('ai', accumulatedContent);
                    
                    // Update UI
                    window.sessionManager.saveSessions();
                    renderSessions();
                    updateStats();
                    
                    // Focus input
                    document.getElementById("chat_input").focus();
                }
                break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines
            let lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer
            
            for (const line of lines) {
                if (line.trim() === '') continue;
                
                try {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
                        
                        // Check if streaming is complete
                        if (data.done === true) {
                            if (isStreaming) {
                                isStreaming = false;
                                stopButton.disabled = true;
                                stopButton.innerHTML = 'DONE';
                                
                                // Add final message to session
                                const session = window.sessionManager.currentSession;
                                session.addMessage('ai', accumulatedContent);
                                
                                // Update UI
                                window.sessionManager.saveSessions();
                                renderSessions();
                                updateStats();
                                
                                // Focus input
                                document.getElementById("chat_input").focus();
                            }
                            break;
                        }
                        
                        // Handle error
                        if (data.error) {
                            if (isStreaming) {
                                isStreaming = false;
                                stopButton.disabled = true;
                                stopButton.innerHTML = 'ERROR';
                                messageBubble.innerHTML = `<div class="error-message">Error: ${data.error}</div>`;
                                // Add error to session for history
                                const session = window.sessionManager.currentSession;
                                session.addMessage('error', `Error: ${data.error}`);
                            }
                            break;
                        }
                        
                        // Add content to accumulated content
                        if (data.content && isStreaming) {
                            accumulatedContent += data.content;
                            
                            // If this is the first chunk, replace typing indicator
                            if (messageBubble.innerHTML.includes('typing_indicator')) {
                                messageBubble.innerHTML = '';
                            }
                            
                            // Update message bubble with accumulated content
                            if (!window.markdownRenderer) {
                                window.markdownRenderer = new MarkdownRenderer();
                            }
                            
                            // Render markdown content
                            messageBubble.innerHTML = window.markdownRenderer.render(accumulatedContent);
                            
                            // Scroll to bottom
                            chatFeed.scrollTop = chatFeed.scrollHeight;
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing stream data:', parseError);
                    // Continue processing other lines
                }
            }
        }
        
        // Clean up
        reader.releaseLock();
    } catch (error) {
        if (error.name === 'AbortError') {
            // Request was cancelled by user
            if (isStreaming) {
                isStreaming = false;
                stopButton.disabled = true;
                stopButton.innerHTML = 'STOPPED';
                
                // Add a note that streaming was stopped
                if (!accumulatedContent.endsWith('\n\n[Streaming stopped by user]')) {
                    accumulatedContent += '\n\n[Streaming stopped by user]';
                    if (!window.markdownRenderer) {
                        window.markdownRenderer = new MarkdownRenderer();
                    }
                    messageBubble.innerHTML = window.markdownRenderer.render(accumulatedContent);
                }
                
                // Add final message to session
                const session = window.sessionManager.currentSession;
                session.addMessage('ai', accumulatedContent);
                
                // Update UI
                window.sessionManager.saveSessions();
                renderSessions();
                updateStats();
            }
        } else {
            console.error('Stream error:', error);
            if (isStreaming) {
                isStreaming = false;
                stopButton.disabled = true;
                stopButton.innerHTML = 'ERROR';
                if (messageBubble.innerHTML.includes('typing_indicator')) {
                    messageBubble.innerHTML = `<div class="error-message">Connection error: ${error.message}. Please try again.</div>`;
                } else {
                    // Add error message to the end
                    messageBubble.innerHTML += `<div class="error-message"><br>Connection error: ${error.message}. Please try again.</div>`;
                }
                // Add error to session for history
                const session = window.sessionManager.currentSession;
                session.addMessage('error', `Connection error: ${error.message}. Please try again.`);
            }
        }
    }
    
    // Add a timeout to handle cases where the stream doesn't start
    setTimeout(() => {
        if (isStreaming && messageBubble.innerHTML.includes('typing_indicator')) {
            isStreaming = false;
            controller.abort(); // Abort the fetch request
            stopButton.disabled = true;
            stopButton.innerHTML = 'TIMEOUT';
            messageBubble.innerHTML = '<div class="error-message">Request timeout. Please try again.</div>';
            // Add error to session for history
            const session = window.sessionManager.currentSession;
            session.addMessage('error', 'Request timeout. Please try again.');
        }
    }, 30000); // 30 second timeout
}

// Update status and stats
function updateStats() {
    const session = window.sessionManager.currentSession;
    const totalSessions = window.sessionManager.getAllSessions().length;
    
    document.getElementById("token_count").textContent = session.getTotalTokens();
    document.getElementById("active_sessions").textContent = totalSessions;
}

// Initialize status updates
function initStatusUpdates() {
    // Simulate API latency updates
    setInterval(() => {
        const latency = 50 + Math.random() * 200;
        document.getElementById("api_latency").textContent = Math.floor(latency) + "ms";
    }, 2000 + Math.random() * 3000);
    
    // Update connection status
    document.getElementById("connection_status").textContent = "ONLINE";
    
    // Initial stats
    updateStats();
}

// Handle slash commands
async function handleSlashCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    switch (cmd) {
        case '/clear':
            const chatFeed = document.getElementById("chat_feed");
            chatFeed.innerHTML = '';
            window.sessionManager.currentSession.messages = [];
            addSystemMessage("Chat session cleared");
            break;
            
        case '/export':
            exportChatHistory();
            break;
            
        case '/help':
            addSystemMessage(`Available commands:
/summarize - Summarize the conversation
/translate [text] - Translate text
/explain [topic] - Explain a topic
/code [task] - Generate code
/debug [issue] - Help debug
/clear - Clear chat
/export - Export history
/help - Show this help`);
            break;
            
        case '/summarize':
            const session = window.sessionManager.currentSession;
            if (session.messages.length === 0) {
                addSystemMessage("No messages to summarize");
            } else {
                addSystemMessage("Analyzing conversation patterns...");
                setTimeout(() => {
                    const summary = `## Conversation Summary
- **Messages:** ${session.messages.length}
- **Tokens:** ${session.getTotalTokens()}
- **Duration:** ${session.getTimeString()}

**Main topics discussed:** General AI interaction and system capabilities.`;
                    addMessageBubble('ai', summary);
                }, 1000);
            }
            break;
            
        case '/translate':
            if (!args) {
                addSystemMessage("Usage: /translate [text to translate]");
            } else {
                addSystemMessage("Translation functionality would connect to translation API");
                addMessageBubble('ai', `**Translation of "${args}":**\n\nThis would provide actual translation with real API integration.`);
            }
            break;
            
        case '/explain':
            if (!args) {
                addSystemMessage("Usage: /explain [topic to explain]");
            } else {
                addMessageBubble('ai', `## Explanation: ${args}

I would provide a detailed explanation of **"${args}"** with:

- Clear context and background
- Step-by-step breakdown
- Practical examples
- Related concepts

*This would be enhanced with real knowledge base integration.*`);
            }
            break;
            
        case '/code':
            if (!args) {
                addSystemMessage("Usage: /code [programming task]");
            } else {
                addMessageBubble('ai', `## Code Generation: ${args}

\`\`\`javascript
// Example implementation for: ${args}
function ${args.replace(/\s+/g, '')}() {
    // Neural network analysis suggests this approach:
    console.log('Implementation for: ${args}');
    
    // Add your specific logic here
    return 'Task completed successfully';
}

// Usage example:
${args.replace(/\s+/g, '')}();
\`\`\``);
            }
            break;
            
        case '/debug':
            if (!args) {
                addSystemMessage("Usage: /debug [issue description]");
            } else {
                addMessageBubble('ai', `## Debug Analysis: ${args}

### 🔍 Issue Analysis
**Problem:** ${args}

### 🛠 Debugging Steps
1. **Check for common issues**
2. **Review error patterns** 
3. **Analyze system state**
4. **Suggest solutions**

### 💡 Recommendations
This would provide detailed debugging help with real code analysis and suggestions.

*Enhanced debugging would include stack trace analysis and solution recommendations.*`);
            }
            break;
            
        default:
            addSystemMessage(`Unknown command: ${cmd}. Type /help for available commands.`);
    }
    
    // Focus input after command
    document.getElementById("chat_input").focus();
}

// Export chat history
function exportChatHistory() {
    const session = window.sessionManager.currentSession;
    const data = {
        session: session.export(),
        exported: new Date().toISOString(),
        version: "2.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edex-chat-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addSystemMessage("Chat history exported successfully");
}

// Settings modal
function openSettingsModal() {
    // Load current settings
    const currentSettings = JSON.parse(localStorage.getItem('edex-settings') || '{}');
    const tokenRendering = currentSettings.tokenRendering !== false; // Default to true
    
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-backdrop" style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
        "></div>
        <div class="modal-content" style="
            position: relative;
            background: linear-gradient(135deg, rgba(var(--color_r), var(--color_g), var(--color_b), 0.1) 0%, transparent 70%);
            border: 0.09vh solid rgba(var(--color_r), var(--color_g), var(--color_b), 0.3);
            padding: 3vh;
            min-width: 40vh;
            max-width: 60vh;
        ">
            <h3 class="title" style="margin-bottom: 2vh;"><p>PANEL</p><p>SETTINGS</p></h3>
            <div class="settings-content" style="
                font-family: var(--font_mono), monospace;
                color: rgba(var(--color_r), var(--color_g), var(--color_b), 0.9);
            ">
                <div class="setting-group" style="margin-bottom: 2vh;">
                    <label>Theme Accent Color (RGB):</label><br>
                    <input type="range" id="color_r" min="0" max="255" value="${window.theme.r}" style="width: 100%; margin: 0.5vh 0;">
                    <input type="range" id="color_g" min="0" max="255" value="${window.theme.g}" style="width: 100%; margin: 0.5vh 0;">
                    <input type="range" id="color_b" min="0" max="255" value="${window.theme.b}" style="width: 100%; margin: 0.5vh 0;">
                </div>
                <div class="setting-group" style="margin-bottom: 2vh;">
                    <label>Font Size:</label><br>
                    <input type="range" id="font_size" min="10" max="20" value="14" style="width: 100%; margin: 0.5vh 0;">
                </div>
                <div class="setting-group" style="margin-bottom: 2vh;">
                    <label><input type="checkbox" id="animations_enabled" checked style="margin-right: 1vh;"> Animations</label>
                </div>
                <div class="setting-group" style="margin-bottom: 2vh;">
                    <label><input type="checkbox" id="sounds_enabled" checked style="margin-right: 1vh;"> Sound Effects</label>
                </div>
                <div class="setting-group" style="margin-bottom: 2vh;">
                    <label><input type="checkbox" id="token_rendering" ${tokenRendering ? 'checked' : ''} style="margin-right: 1vh;"> Token-by-Token Rendering (Streaming)</label>
                </div>
            </div>
            <div class="modal-actions" style="display: flex; gap: 1vh; margin-top: 2vh;">
                <button class="neon_button" id="save_settings" style="flex: 1;">SAVE</button>
                <button class="neon_button" id="close_settings" style="flex: 1;">CLOSE</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('#save_settings').addEventListener('click', () => {
        saveSettings(modal);
    });
    
    modal.querySelector('#close_settings').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Real-time color preview
    ['color_r', 'color_g', 'color_b'].forEach(id => {
        modal.querySelector('#' + id).addEventListener('input', (e) => {
            const r = modal.querySelector('#color_r').value;
            const g = modal.querySelector('#color_g').value;
            const b = modal.querySelector('#color_b').value;
            document.documentElement.style.setProperty('--color_r', r);
            document.documentElement.style.setProperty('--color_g', g);
            document.documentElement.style.setProperty('--color_b', b);
        });
    });
}

function saveSettings(modal) {
    const settings = {
        color_r: modal.querySelector('#color_r').value,
        color_g: modal.querySelector('#color_g').value,
        color_b: modal.querySelector('#color_b').value,
        font_size: modal.querySelector('#font_size').value,
        animations_enabled: modal.querySelector('#animations_enabled').checked,
        sounds_enabled: modal.querySelector('#sounds_enabled').checked,
        tokenRendering: modal.querySelector('#token_rendering').checked
    };
    
    localStorage.setItem('edex_settings', JSON.stringify(settings));
    
    // Update theme colors permanently
    window.theme.r = settings.color_r;
    window.theme.g = settings.color_g;
    window.theme.b = settings.color_b;
    
    addSystemMessage("Settings saved successfully");
    document.body.removeChild(modal);
}

// Initialize application
async function init() {
    // Load boot log first
    await loadBootLog();
    
    // Initialize settings (mock for web version)
    window.settings = {
        nointro: false,
        nointroOverride: false,
        nocursor: false,
        nocursorOverride: false,
        theme: "tron",
        termFontSize: 14
    };

    // Load default theme
    try {
        const response = await fetch('./assets/themes/tron.json');
        const theme = await response.json();
        await _loadTheme(theme);
    } catch (e) {
        console.warn("Failed to load theme, using default");
        // Fallback theme
        await _loadTheme({
            colors: {
                r: 170, g: 207, b: 209,
                black: "#000000",
                light_black: "#05080d", 
                grey: "#262828"
            },
            cssvars: {
                font_main: "United Sans Medium",
                font_main_light: "United Sans Light"
            },
            terminal: {
                fontFamily: "Fira Mono",
                foreground: "#aacfd1",
                background: "#05080d",
                cursor: "#aacfd1",
                cursorAccent: "#aacfd1",
                selection: "rgba(170,207,209,0.3)"
            }
        });
    }

    // Start boot sequence (skip if nointro is set)
    if (window.settings.nointro || window.settings.nointroOverride) {
        document.getElementById("boot_screen").remove();
        document.body.setAttribute("class", "");
        initUI();
    } else {
        displayBootLine();
    }
}

// API Settings Modal Management
class APISettingsManager {
    constructor() {
        this.modal = null;
        this.currentProvider = 'openai';
        this.providers = {
            openai: {
                name: 'OpenAI',
                keyPrefix: 'sk-',
                models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
                endpoint: 'https://api.openai.com/v1/chat/completions'
            },
            anthropic: {
                name: 'Anthropic',
                keyPrefix: 'sk-ant-',
                models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
                endpoint: 'https://api.anthropic.com/v1/messages'
            },
            google: {
                name: 'Google Gemini',
                keyPrefix: 'AIza',
                keyPattern: /^AIza[A-Za-z0-9-_]{35}$/,
                models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-1.0-pro'],
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/'
            },
            mistral: {
                name: 'Mistral',
                keyPrefix: 'mis_',
                models: ['mistral-large-latest', 'mistral-medium', 'mistral-small'],
                endpoint: 'https://api.mistral.ai/v1/chat/completions'
            },
            groq: {
                name: 'Groq',
                keyPrefix: 'gsk_',
                models: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'],
                endpoint: 'https://api.groq.com/openai/v1/chat/completions'
            },
            lmstudio: {
                name: 'LM Studio',
                keyPrefix: 'lm-studio',
                models: ['lmstudio-community/Meta-Llama-3-8B-Instruct', 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF', 'lmstudio-community/Phi-3-mini-4k-instruct'],
                endpoint: 'http://localhost:1234/v1/chat/completions'
            }
        };
        
        this.initModal();
    }

    initModal() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.modal = document.getElementById('api_settings_modal');
        
        if (!this.modal) return;

        // Close modal handlers
        document.getElementById('api_modal_close').addEventListener('click', () => this.closeModal());
        document.getElementById('api_modal_cancel').addEventListener('click', () => this.closeModal());
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Provider tabs
        const providerTabs = document.querySelectorAll('.provider-tab:not(.coming-soon)');
        providerTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const provider = tab.getAttribute('data-provider');
                this.switchProvider(provider);
            });
        });

        // Form handlers
        this.setupFormHandlers();
        
        // Footer buttons
        document.getElementById('api_test_connection').addEventListener('click', () => this.testConnection());
        document.getElementById('api_save_settings').addEventListener('click', () => this.saveSettings());
        
        // Load saved settings
        this.loadSettings();
    }

    setupFormHandlers() {
        // Password visibility toggles
        const visibilityToggles = document.querySelectorAll('.toggle-visibility');
        visibilityToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.textContent = '🙈';
                } else {
                    input.type = 'password';
                    toggle.textContent = '👁';
                }
            });
        });

        // Temperature slider for OpenAI
        const tempSlider = document.getElementById('openai_temperature');
        const tempValue = document.getElementById('openai_temp_value');
        if (tempSlider && tempValue) {
            tempSlider.addEventListener('input', (e) => {
                tempValue.textContent = e.target.value;
            });
        }

        // Temperature slider for LM Studio
        const lmstudioTempSlider = document.getElementById('lmstudio_temperature');
        const lmstudioTempValue = document.getElementById('lmstudio_temp_value');
        if (lmstudioTempSlider && lmstudioTempValue) {
            lmstudioTempSlider.addEventListener('input', (e) => {
                lmstudioTempValue.textContent = e.target.value;
            });
        }

        // Custom model handling for LM Studio
        const lmstudioModelSelect = document.getElementById('lmstudio_model_select');
        const lmstudioCustomModelGroup = document.getElementById('lmstudio_custom_model_group');
        const lmstudioCustomModelInput = document.getElementById('lmstudio_custom_model');

        if (lmstudioModelSelect && lmstudioCustomModelGroup) {
            lmstudioModelSelect.addEventListener('change', (e) => {
                if (e.target.value === '__custom__') {
                    lmstudioCustomModelGroup.style.display = 'block';
                } else {
                    lmstudioCustomModelGroup.style.display = 'none';
                }
            });
        }

        // Custom model handling for Google Gemini
        const googleModelSelect = document.getElementById('google_model');
        const googleCustomModelGroup = document.getElementById('google_custom_model_group');
        const googleCustomModelInput = document.getElementById('google_custom_model');

        if (googleModelSelect && googleCustomModelGroup) {
            googleModelSelect.addEventListener('change', (e) => {
                if (e.target.value === '__custom__') {
                    googleCustomModelGroup.style.display = 'block';
                } else {
                    googleCustomModelGroup.style.display = 'none';
                }
            });
        }

        // Form validation on input
        const apiKeyInputs = document.querySelectorAll('input[id$="_api_key"]');
        apiKeyInputs.forEach(input => {
            input.addEventListener('input', () => this.validateApiKey(input));
        });
    }

    openModal() {
        if (!this.modal) return;
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.loadSettings();
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.updateStatus('[SYSTEM] Awaiting configuration...');
    }

    switchProvider(providerId) {
        if (!this.providers[providerId]) return;
        
        this.currentProvider = providerId;

        // Update tab states
        document.querySelectorAll('.provider-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-provider') === providerId) {
                tab.classList.add('active');
            }
        });

        // Update config panels
        document.querySelectorAll('.config-panel').forEach(panel => {
            panel.classList.remove('active');
            if (panel.getAttribute('data-provider') === providerId) {
                panel.classList.add('active');
            }
        });
        
        this.updateStatus(`[SYSTEM] Switched to ${this.providers[providerId].name} configuration`);
    }

    validateApiKey(input) {
        const provider = input.id.split('_')[0];
        const key = input.value.trim();
        const validationMsg = input.parentElement.nextElementSibling;

        if (!key) {
            validationMsg.textContent = '';
            validationMsg.className = 'validation-message';
            return false;
        }

        // Special handling for LM Studio
        if (provider === 'lmstudio') {
            // LM Studio accepts "lm-studio" or empty as valid
            if (key === 'lm-studio' || key === '') {
                validationMsg.textContent = 'Valid format ✓';
                validationMsg.className = 'validation-message success';
                return true;
            }
            // For other values, we don't validate strictly
            validationMsg.textContent = 'Custom key accepted';
            validationMsg.className = 'validation-message success';
            return true;
        }

        // Check for specific regex pattern if available
        const keyPattern = this.providers[provider]?.keyPattern;
        if (keyPattern) {
            if (!keyPattern.test(key)) {
                validationMsg.textContent = `Invalid format. Expected: ${this.providers[provider].keyPrefix}[35 characters]`;
                validationMsg.className = 'validation-message error';
                return false;
            }
        } else {
            // Fallback to prefix check
            const expectedPrefix = this.providers[provider]?.keyPrefix;
            if (expectedPrefix && !key.startsWith(expectedPrefix)) {
                validationMsg.textContent = `Invalid format. Expected format: ${expectedPrefix}...`;
                validationMsg.className = 'validation-message error';
                return false;
            }

            if (key.length < 20) {
                validationMsg.textContent = 'API key appears too short';
                validationMsg.className = 'validation-message error';
                return false;
            }
        }

        validationMsg.textContent = 'Valid format ✓';
        validationMsg.className = 'validation-message success';
        return true;
    }

    async testConnection() {
        const provider = this.currentProvider;
        const config = this.getProviderConfig(provider);
        
        if (!config.apiKey) {
            this.updateStatus('[SYSTEM] Error: No API key provided', 'error');
            return;
        }

        this.updateStatus('[SYSTEM] Testing connection...', 'testing');
        const testBtn = document.getElementById('api_test_connection');
        testBtn.disabled = true;
        testBtn.textContent = 'TESTING...';

        try {
            const success = await this.performConnectionTest(provider, config);
            if (success) {
                this.updateStatus('[SYSTEM] ✓ Connection successful!', 'success');
            } else {
                this.updateStatus('[SYSTEM] ✗ Connection failed. Check your API key.', 'error');
            }
        } catch (error) {
            this.updateStatus(`[SYSTEM] ✗ Error: ${error.message}`, 'error');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'TEST CONNECTION';
        }
    }

    async performConnectionTest(provider, config) {
        // Special handling for LM Studio
        if (provider === 'lmstudio') {
            try {
                // For LM Studio, we'll just check if the URL is accessible
                const baseUrl = config.baseUrl || 'http://localhost:1234/v1';
                const response = await fetch(`${baseUrl}/models`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${config.apiKey || 'lm-studio'}`,
                        'Content-Type': 'application/json'
                    }
                });

                return response.ok;
            } catch (error) {
                console.warn('LM Studio connection test failed:', error);
                return false;
            }
        }

        // Simulate API test - In a real implementation, you'd make actual API calls
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check for specific regex pattern if available
                const keyPattern = this.providers[provider]?.keyPattern;
                if (keyPattern) {
                    const isValid = config.apiKey && keyPattern.test(config.apiKey);
                    resolve(isValid);
                } else {
                    // Fallback to prefix check
                    const isValid = config.apiKey &&
                                   config.apiKey.length > 20 &&
                                   config.apiKey.startsWith(this.providers[provider].keyPrefix);
                    resolve(isValid);
                }
            }, 1500);
        });
    }

    getProviderConfig(provider) {
        const config = {
            provider: provider,
            apiKey: document.getElementById(`${provider}_api_key`)?.value.trim() || '',
            model: document.getElementById(`${provider}_model`)?.value || this.providers[provider].models[0]
        };

        // Provider-specific settings
        if (provider === 'openai') {
            config.temperature = parseFloat(document.getElementById('openai_temperature')?.value || 0.7);
            config.maxTokens = parseInt(document.getElementById('openai_max_tokens')?.value || 2048);
        } else if (provider === 'anthropic') {
            config.maxTokens = parseInt(document.getElementById('anthropic_max_tokens')?.value || 4096);
        } else if (provider === 'lmstudio') {
            config.baseUrl = document.getElementById('lmstudio_base_url')?.value.trim() || 'http://localhost:1234/v1';

            // Handle custom model selection
            const modelSelect = document.getElementById('lmstudio_model_select');
            if (modelSelect?.value === '__custom__') {
                config.model = document.getElementById('lmstudio_custom_model')?.value.trim() ||
                              'lmstudio-community/Meta-Llama-3-8B-Instruct';
            } else {
                config.model = modelSelect?.value || 'lmstudio-community/Meta-Llama-3-8B-Instruct';
            }

            config.temperature = parseFloat(document.getElementById('lmstudio_temperature')?.value || 0.7);
            config.maxTokens = parseInt(document.getElementById('lmstudio_max_tokens')?.value || 2048);
        } else if (provider === 'google') {
            // Handle custom model selection for Google Gemini
            const modelSelect = document.getElementById('google_model');
            if (modelSelect?.value === '__custom__') {
                config.model = document.getElementById('google_custom_model')?.value.trim() ||
                              'gemini-1.5-pro-latest';
            } else {
                config.model = modelSelect?.value || 'gemini-1.5-pro';
            }
        }

        return config;
    }

    saveSettings() {
        const configs = {};
        
        // Save all provider configurations
        Object.keys(this.providers).forEach(provider => {
            const config = this.getProviderConfig(provider);
            if (config.apiKey) {
                configs[provider] = config;
            }
        });

        // Store in localStorage (in production, use proper encryption)
        localStorage.setItem('edex_api_configs', JSON.stringify(configs));
        localStorage.setItem('edex_current_provider', this.currentProvider);
        
        this.updateStatus('[SYSTEM] ✓ Settings saved successfully!', 'success');
        
        // Update main model selector
        this.updateMainModelSelector();
        
        setTimeout(() => {
            this.closeModal();
        }, 1500);
    }

    loadSettings() {
        try {
            const configs = JSON.parse(localStorage.getItem('edex_api_configs') || '{}');
            const currentProvider = localStorage.getItem('edex_current_provider') || 'openai';
            
            // Load each provider's settings
            Object.keys(configs).forEach(provider => {
                const config = configs[provider];
                
                // Load API key (masked)
                const keyInput = document.getElementById(`${provider}_api_key`);
                if (keyInput && config.apiKey) {
                    keyInput.value = config.apiKey;
                }
                
                // Load model
                const modelSelect = document.getElementById(`${provider}_model`);
                if (modelSelect && config.model) {
                    modelSelect.value = config.model;
                }
                
                // Load provider-specific settings
                if (provider === 'openai') {
                    if (config.temperature !== undefined) {
                        const tempSlider = document.getElementById('openai_temperature');
                        const tempValue = document.getElementById('openai_temp_value');
                        if (tempSlider) {
                            tempSlider.value = config.temperature;
                            if (tempValue) tempValue.textContent = config.temperature;
                        }
                    }
                    if (config.maxTokens) {
                        const tokensInput = document.getElementById('openai_max_tokens');
                        if (tokensInput) tokensInput.value = config.maxTokens;
                    }
                } else if (provider === 'anthropic' && config.maxTokens) {
                    const tokensInput = document.getElementById('anthropic_max_tokens');
                    if (tokensInput) tokensInput.value = config.maxTokens;
                } else if (provider === 'lmstudio') {
                    if (config.baseUrl) {
                        const baseUrlInput = document.getElementById('lmstudio_base_url');
                        if (baseUrlInput) baseUrlInput.value = config.baseUrl;
                    }

                    // Handle custom model loading
                    const modelSelect = document.getElementById('lmstudio_model_select');
                    const customModelGroup = document.getElementById('lmstudio_custom_model_group');
                    const customModelInput = document.getElementById('lmstudio_custom_model');

                    if (config.model) {
                        // Check if the model is in the standard list
                        const standardModels = ['lmstudio-community/Meta-Llama-3-8B-Instruct',
                                              'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
                                              'lmstudio-community/Phi-3-mini-4k-instruct'];

                        if (standardModels.includes(config.model)) {
                            if (modelSelect) modelSelect.value = config.model;
                            if (customModelGroup) customModelGroup.style.display = 'none';
                        } else {
                            // It's a custom model
                            if (modelSelect) modelSelect.value = '__custom__';
                            if (customModelGroup) customModelGroup.style.display = 'block';
                            if (customModelInput) customModelInput.value = config.model;
                        }
                    }

                    if (config.temperature !== undefined) {
                        const tempSlider = document.getElementById('lmstudio_temperature');
                        const tempValue = document.getElementById('lmstudio_temp_value');
                        if (tempSlider) {
                            tempSlider.value = config.temperature;
                            if (tempValue) tempValue.textContent = config.temperature;
                        }
                    }
                    if (config.maxTokens) {
                        const tokensInput = document.getElementById('lmstudio_max_tokens');
                        if (tokensInput) tokensInput.value = config.maxTokens;
                    }
                } else if (provider === 'google') {
                    // Handle custom model loading for Google Gemini
                    const modelSelect = document.getElementById('google_model');
                    const customModelGroup = document.getElementById('google_custom_model_group');
                    const customModelInput = document.getElementById('google_custom_model');

                    if (config.model) {
                        // Check if the model is in the standard list
                        const standardModels = ['gemini-2.0-flash-exp', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-1.0-pro'];

                        if (standardModels.includes(config.model)) {
                            if (modelSelect) modelSelect.value = config.model;
                            if (customModelGroup) customModelGroup.style.display = 'none';
                        } else {
                            // It's a custom model
                            if (modelSelect) modelSelect.value = '__custom__';
                            if (customModelGroup) customModelGroup.style.display = 'block';
                            if (customModelInput) customModelInput.value = config.model;
                        }
                    }
                }
            });
            
            // Switch to current provider
            this.switchProvider(currentProvider);
        } catch (error) {
            console.warn('Failed to load API settings:', error);
        }
    }

    updateMainModelSelector() {
        const currentProvider = localStorage.getItem('edex_current_provider') || 'openai';
        const configs = JSON.parse(localStorage.getItem('edex_api_configs') || '{}');
        
        if (configs[currentProvider]) {
            const modelSelector = document.getElementById('model_selector');
            if (modelSelector) {
                // Update the main interface to show configured provider
                const providerName = this.providers[currentProvider].name;
                const model = configs[currentProvider].model;
                
                // For LM Studio, we want to show the actual model name
                let displayName = model;
                if (currentProvider === 'lmstudio') {
                    // Extract just the model name part after the last slash
                    const parts = model.split('/');
                    displayName = parts[parts.length - 1] || model;
                }
                
                // Check if option already exists
                let option = Array.from(modelSelector.options).find(opt => 
                    opt.value === `${currentProvider}-${model}`
                );
                
                if (!option) {
                    option = new Option(`${providerName} - ${displayName}`, `${currentProvider}-${model}`);
                    modelSelector.appendChild(option);
                }
                
                modelSelector.value = `${currentProvider}-${model}`;
            }
        }
    }

    updateStatus(message, type = 'default') {
        const statusElement = document.querySelector('#connection_status .status-text');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-text ${type}`;
        }
    }

    getCurrentConfig() {
        const currentProvider = localStorage.getItem('edex_current_provider') || 'openai';
        const configs = JSON.parse(localStorage.getItem('edex_api_configs') || '{}');
        return configs[currentProvider] || null;
    }
}

// Settings modal function
function openSettingsModal() {
    if (!window.apiSettingsManager) {
        window.apiSettingsManager = new APISettingsManager();
    }
    window.apiSettingsManager.openModal();
}

// Start when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
