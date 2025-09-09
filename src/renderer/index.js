// src/renderer/index.js - Entry point for the renderer
import { loadTheme, toggleTheme, _loadTheme } from './theme.js';
import { loadBootLog, displayBootLine, displayTitleScreen } from './boot.js';
import { initUI, setupEventListeners } from './ui.js';
import { showToast, _escapeHtml, _purifyCSS, _delay } from './utils.js';
import { loadDefaultProfile, applyProfileSettings, applyDefaultProfileSettings } from './profile.js';
import { loadApiSettings, saveApiSettings } from './apiSettings.js';

// Make these available globally as they were before
window._loadTheme = _loadTheme;
window._escapeHtml = _escapeHtml;
window._purifyCSS = _purifyCSS;
window._delay = _delay;
window.showToast = showToast;

// Global variables
window.settings = {
    nointro: false,
    nointroOverride: false,
    nocursor: false,
    nocursorOverride: false,
    theme: "tron",
    termFontSize: 14,
    darkMode: true
};

window.theme = null;
window.chat = null;
window.sessionManager = null;
window.markdownRenderer = null;
window.apiSettings = {};
window.tools = [];

// Lifecycle hooks
window.addEventListener('DOMContentLoaded', async () => {
    console.log("📄 DOM content loaded");
    
    // Initialize markdown renderer
    window.markdownRenderer = new MarkdownRenderer();
    
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
    
    // Start boot sequence
    setTimeout(displayBootLine, 100);
    
    // Load default theme
    try {
        const response = await fetch('./assets/themes/tron.json');
        const theme = await response.json();
        await loadTheme(theme);
    } catch (e) {
        console.warn("Failed to load theme, using default");
        // Fallback theme
        await loadTheme({
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
});

window.addEventListener('resize', () => {
    // Handle window resize
    if (window.chat) {
        window.chat.resize(window.innerWidth, window.innerHeight);
    }
});

console.log("🚀 eDEX Chatbot Renderer loaded");