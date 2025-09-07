// _renderer.js - eDEX-UI style orchestrator for chatbot app
console.log("🔧 Initializing eDEX Chatbot Renderer...");

// Global variables
window.settings = {
    nointro: false,
    nointroOverride: false,
    nocursor: false,
    nocursorOverride: false,
    theme: "tron",
    termFontSize: 14,
    darkMode: true // Add dark mode setting
};

window.theme = null;
window.chat = null;
window.sessionManager = null;
window.markdownRenderer = new MarkdownRenderer();

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

// Theme loading
window._loadTheme = async theme => {
    if (document.querySelector("style.theming")) {
        document.querySelector("style.theming").remove();
    }

    // Load fonts using FontFace API (matching eDEX UI approach)
    const fontPath = './assets/fonts'; // Relative path for web
    
    try {
        // Load main font
        const mainFontPath = `${fontPath}/${theme.cssvars.font_main.toLowerCase().replace(/ /g, '_')}.woff2`;
        const mainFont = new FontFace(theme.cssvars.font_main, `url("${mainFontPath}")`);
        document.fonts.add(mainFont);
        await mainFont.load();
        
        // Load light font
        const lightFontPath = `${fontPath}/${theme.cssvars.font_main_light.toLowerCase().replace(/ /g, '_')}.woff2`;
        const lightFont = new FontFace(theme.cssvars.font_main_light, `url("${lightFontPath}")`);
        document.fonts.add(lightFont);
        await lightFont.load();
        
        // Load terminal font
        const termFontPath = `${fontPath}/${theme.terminal.fontFamily.toLowerCase().replace(/ /g, '_')}.woff2`;
        const termFont = new FontFace(theme.terminal.fontFamily, `url("${termFontPath}")`);
        document.fonts.add(termFont);
        await termFont.load();
    } catch (error) {
        console.warn("Font loading failed, using system fonts:", error);
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

// Boot sequence
let bootIndex = 0;
let bootLines = [];

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

    // Exact timing from eDEX UI
    switch(true) {
        case bootIndex < 10:
            setTimeout(displayBootLine, 100);
            break;
        case bootIndex < 20:
            setTimeout(displayBootLine, 50);
            break;
        case bootIndex < 30:
            setTimeout(displayBootLine, 30);
            break;
        case bootIndex < 50:
            setTimeout(displayBootLine, 20);
            break;
        case bootIndex < 70:
            setTimeout(displayBootLine, 15);
            break;
        case bootIndex < bootLines.length - 5:
            setTimeout(displayBootLine, 10);
            break;
        case bootIndex >= bootLines.length - 5 && bootIndex < bootLines.length:
            setTimeout(displayBootLine, 200);
            break;
        default:
            setTimeout(displayBootLine, Math.pow(1 - (bootIndex/1000), 3)*25);
    }
}

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

// UI initialization
async function initUI() {
    await _delay(10);
    
    // Show the modern chatbot interface
    document.getElementById("app_container").style.display = "flex";
    
    // Initialize chat component
    try {
        window.chat = new Chat({
            parentId: "chat_feed",
            onmessage: handleChatMessage
        });
        
        console.log("✅ Chat component initialized");
    } catch (e) {
        console.error("❌ Failed to initialize chat component:", e);
    }
    
    // Load chat history
    loadChatHistory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start clock
    startClock();
    
    console.log("✅ UI initialization complete");
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
            break;
        case 'typing_end':
            // Hide typing indicator
            hideTypingIndicator();
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
            break;
        case 'new_chat':
            // Handle new chat creation
            console.log("New chat created:", event.data);
            clearChatDisplay();
            break;
        case 'chat_loaded':
            // Handle chat loading
            console.log("Chat loaded:", event.data);
            loadChatMessages(event.data.messages);
            break;
        case 'cleared':
            // Handle chat clearing
            clearChatDisplay();
            break;
    }
}

// Event listener setup
function setupEventListeners() {
    // Send button
    const sendButton = document.getElementById("send_button");
    if (sendButton) {
        sendButton.addEventListener("click", handleSendMessage);
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
    
    // Settings button
    const settingsButton = document.getElementById("settings_btn");
    if (settingsButton) {
        settingsButton.addEventListener("click", handleSettings);
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
    
    console.log("✅ Event listeners set up");
}

// UI Update Functions
function displayMessage(messageData) {
    const chatFeed = document.getElementById("chat_feed");
    if (!chatFeed) return;
    
    // Remove welcome message if this is the first real message
    if (chatFeed.querySelectorAll('.message').length === 1 && 
        chatFeed.querySelector('.system_message')) {
        chatFeed.querySelector('.system_message').remove();
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
}

function loadChatMessages(messages) {
    clearChatDisplay();
    
    messages.forEach(msg => {
        displayMessage({
            type: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString()
        });
    });
}

// Event handlers
function handleSendMessage() {
    const chatInput = document.getElementById("chat_input");
    const message = chatInput.value.trim();
    
    if (message && window.chat) {
        // Get current provider and model
        const modelSelector = document.getElementById("model_selector");
        const model = modelSelector ? modelSelector.value : 'gpt-4o-mini';
        
        window.chat.sendMessage(message, 'openai', model);
        chatInput.value = "";
    }
}

function handleChatInputKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
    
    // Auto-resize textarea
    const chatInput = document.getElementById("chat_input");
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
}

async function handleNewChat() {
    if (window.chat) {
        try {
            await window.chat.createNewChat();
            console.log("New chat session started");
        } catch (error) {
            console.error("Failed to create new chat:", error);
            displayError("Failed to create new chat");
        }
    }
}

function handleSettings() {
    console.log("Settings button clicked");
    
    // Show the API settings modal
    const settingsModal = document.getElementById("api_settings_modal");
    if (settingsModal) {
        settingsModal.style.display = "flex";
        
        // Add event listeners for modal controls
        setupSettingsModalListeners();
    }
}

function handleModelChange(event) {
    const model = event.target.value;
    console.log("Model changed to:", model);
    // In a full implementation, we would update the chat component
}

function retryLastMessage() {
    // In a full implementation, we would retry the last message
    console.log("Retry last message functionality would be implemented here");
    displayError("Retry functionality would be implemented in a full version");
}

function setupSettingsModalListeners() {
    // Close button
    const closeBtn = document.getElementById("api_modal_close");
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("api_settings_modal").style.display = "none";
        };
    }
    
    // Cancel button
    const cancelBtn = document.getElementById("api_modal_cancel");
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            document.getElementById("api_settings_modal").style.display = "none";
        };
    }
    
    // Provider tabs
    const providerTabs = document.querySelectorAll(".provider-tab");
    providerTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs
            providerTabs.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            tab.classList.add("active");
            
            // Show corresponding config panel
            const provider = tab.dataset.provider;
            const configPanels = document.querySelectorAll(".config-panel");
            configPanels.forEach(panel => {
                panel.classList.remove("active");
                if (panel.dataset.provider === provider) {
                    panel.classList.add("active");
                }
            });
        });
    });
    
    // Toggle visibility buttons for API keys
    const toggleButtons = document.querySelectorAll(".toggle-visibility");
    toggleButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    button.textContent = "🙈";
                } else {
                    input.type = "password";
                    button.textContent = "👁";
                }
            }
        });
    });
    
    // Save settings button
    const saveBtn = document.getElementById("api_save_settings");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            saveApiSettings();
        });
    }
    
    // Test connection button
    const testBtn = document.getElementById("api_test_connection");
    if (testBtn) {
        testBtn.addEventListener("click", () => {
            testApiConnection();
        });
    }
}

function saveApiSettings() {
    // Collect settings from all provider forms
    const providers = ["openai", "anthropic", "google", "mistral", "groq", "xai"];
    const settings = {};
    
    providers.forEach(provider => {
        const apiKey = document.getElementById(`${provider}_api_key`);
        if (apiKey) {
            settings[provider] = {
                apiKey: apiKey.value
            };
            
            // Get additional settings based on provider
            if (provider === "openai") {
                settings[provider].model = document.getElementById("openai_model").value;
                settings[provider].temperature = document.getElementById("openai_temperature").value;
                settings[provider].maxTokens = document.getElementById("openai_max_tokens").value;
            } else if (provider === "anthropic") {
                settings[provider].model = document.getElementById("anthropic_model").value;
                settings[provider].maxTokens = document.getElementById("anthropic_max_tokens").value;
            } else if (provider === "google") {
                settings[provider].model = document.getElementById("google_model").value;
            } else if (provider === "mistral") {
                settings[provider].model = document.getElementById("mistral_model").value;
            } else if (provider === "groq") {
                settings[provider].model = document.getElementById("groq_model").value;
            } else if (provider === "xai") {
                settings[provider].model = document.getElementById("xai_model").value;
            }
        }
    });
    
    // In a real implementation, you would save these settings to localStorage or send to backend
    console.log("Saving API settings:", settings);
    
    // Show success message
    const statusDisplay = document.getElementById("connection_status");
    if (statusDisplay) {
        statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Settings saved successfully</span>';
        setTimeout(() => {
            statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Awaiting configuration...</span>';
        }, 3000);
    }
    
    // Close modal
    document.getElementById("api_settings_modal").style.display = "none";
}

function testApiConnection() {
    // In a real implementation, you would test the connection to the selected provider
    console.log("Testing API connection...");
    
    // Show testing message
    const statusDisplay = document.getElementById("connection_status");
    if (statusDisplay) {
        statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Testing connection...</span>';
    }
    
    // Simulate API test (in a real app, you would make actual API calls)
    setTimeout(() => {
        const statusDisplay = document.getElementById("connection_status");
        if (statusDisplay) {
            statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Connection successful</span>';
            setTimeout(() => {
                statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Awaiting configuration...</span>';
            }, 3000);
        }
    }, 1500);
}

function toggleTheme() {
    window.settings.darkMode = !window.settings.darkMode;
    
    // Update CSS variables for theme
    const root = document.documentElement;
    if (window.settings.darkMode) {
        root.style.setProperty('--color_black', '#05080d');
        root.style.setProperty('--color_light_black', '#05080d');
        root.style.setProperty('--color_grey', '#262828');
        root.style.setProperty('--background-color', '#05080d');
    } else {
        root.style.setProperty('--color_black', '#f0f0f0');
        root.style.setProperty('--color_light_black', '#e0e0e0');
        root.style.setProperty('--color_grey', '#d0d0d0');
        root.style.setProperty('--background-color', '#f8f8f8');
    }
    
    // Update button text
    const themeToggle = document.getElementById("theme_toggle");
    if (themeToggle) {
        themeToggle.textContent = window.settings.darkMode ? "🌙 Dark" : "☀️ Light";
    }
    
    console.log("Theme toggled to:", window.settings.darkMode ? "dark" : "light");
}

// Clock functionality
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const clockElement = document.getElementById("system_clock");
    if (clockElement) {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString();
    }
}

// Lifecycle hooks
window.addEventListener('DOMContentLoaded', async () => {
    console.log("📄 DOM content loaded");
    
    // Add click outside to close modal functionality
    const modal = document.getElementById("api_settings_modal");
    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }
    
    // Load boot log
    await loadBootLog();
    
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
});

window.addEventListener('resize', () => {
    // Handle window resize
    if (window.chat) {
        window.chat.resize(window.innerWidth, window.innerHeight);
    }
});

console.log("🚀 eDEX Chatbot Renderer loaded");