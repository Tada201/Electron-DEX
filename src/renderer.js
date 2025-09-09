import './utils/markdown.js';
// src/renderer.js - Central renderer that imports all modules
import { loadTheme, toggleTheme, _loadTheme } from './renderer/theme.js';
import { loadBootLog, displayBootLine, displayTitleScreen } from './renderer/boot.js';
import { initUI } from './renderer/ui.js';
import { setupEventListeners } from './renderer/events.js';
import { showToast, _escapeHtml, _purifyCSS, _delay } from './renderer/utils.js';
import { loadDefaultProfile, applyProfileSettings, applyDefaultProfileSettings } from './renderer/profile.js';
import { loadApiSettings, saveApiSettings } from './renderer/apiSettings.js';
import { runTests } from './renderer/test.js';

// Make these available globally as they were before
window._loadTheme = _loadTheme;
window._escapeHtml = _escapeHtml;
window._purifyCSS = _purifyCSS;
window._delay = _delay;
window.showToast = showToast;

// Debug logging
console.log("Renderer.js loaded");
if (window.SettingsBridge) {
    console.log("SettingsBridge found at renderer load time");
} else {
    console.log("SettingsBridge NOT found at renderer load time");
}

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

// Export all functions for global access
window.loadTheme = loadTheme;
window.toggleTheme = toggleTheme;
window.loadBootLog = loadBootLog;
window.displayBootLine = displayBootLine;
window.displayTitleScreen = displayTitleScreen;
window.initUI = initUI;
window.setupEventListeners = setupEventListeners;
window.loadDefaultProfile = loadDefaultProfile;
window.applyProfileSettings = applyProfileSettings;
window.applyDefaultProfileSettings = applyDefaultProfileSettings;
window.loadApiSettings = loadApiSettings;
window.saveApiSettings = saveApiSettings;
window.runTests = runTests;

// Lifecycle hooks
window.addEventListener('DOMContentLoaded', async () => {
    console.log("📄 DOM content loaded");
    
    try {
        // Verify essential DOM elements exist
        const bootScreen = document.getElementById("boot_screen");
        const appContainer = document.getElementById("app_container");
        
        if (!bootScreen || !appContainer) {
            console.error("❌ Essential DOM elements missing");
            return;
        }
        
        // Initialize markdown renderer with error handling
        try {
            window.markdownRenderer = new MarkdownRenderer();
        } catch (e) {
            console.warn("⚠️ Markdown renderer failed to initialize", e);
        }
        
        // Add click outside to close modal functionality
        const modal = document.getElementById("api_settings_modal");
        if (modal) {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            });
        }
        
        // Initialize Settings Bridge
        try {
            if (window.SettingsBridge) {
                console.log("Renderer: Initializing SettingsBridge...");
                // Wait a bit for DOM to be ready
                setTimeout(() => {
                    console.log("Renderer: Calling SettingsBridge.init()");
                    window.SettingsBridge.init();
                }, 500); // Increased timeout to 500ms
            } else {
                console.log("Renderer: SettingsBridge not found");
            }
        } catch (e) {
            console.warn("⚠️ Settings bridge failed to initialize", e);
        }
        
        // Load boot log
        await loadBootLog();
        
        // Start boot sequence with error handling
        setTimeout(() => {
            try {
                displayBootLine();
            } catch (e) {
                console.error("❌ Boot sequence failed", e);
                // Emergency fallback: skip boot and show UI
                const bootScreen = document.getElementById("boot_screen");
                if (bootScreen) bootScreen.style.display = "none";
                const appContainer = document.getElementById("app_container");
                if (appContainer) appContainer.style.display = "flex";
            }
        }, 100);
        
        // Load default theme
        try {
            const response = await fetch('./assets/themes/tron.json');
            const theme = await response.json();
            await loadTheme(theme);
        } catch (e) {
            console.warn("⚠️ Failed to load theme, using default", e);
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
        
        // Safe development mode check for tests
        const isDevMode = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
        if (isDevMode) {
            try {
                runTests();
            } catch (e) {
                console.warn("⚠️ Tests failed to run", e);
            }
        }
        
    } catch (error) {
        console.error("❌ Critical initialization error", error);
        // Emergency fallback: show basic UI
        const bootScreen = document.getElementById("boot_screen");
        if (bootScreen) bootScreen.style.display = "none";
        const appContainer = document.getElementById("app_container");
        if (appContainer) appContainer.style.display = "flex";
    }
});

window.addEventListener('resize', () => {
    // Handle window resize
    if (window.chat) {
        window.chat.resize(window.innerWidth, window.innerHeight);
    }
});

console.log("🚀 eDEX Chatbot Renderer loaded");