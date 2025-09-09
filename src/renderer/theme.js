// src/renderer/theme.js - Theme management
import { _purifyCSS, _delay } from './utils.js';

export async function loadTheme(theme) {
    // Remove existing theme styles
    const existingStyles = document.querySelectorAll("style.theming");
    existingStyles.forEach(style => style.remove());
    
    // Remove existing font styles
    const fontStyles = document.querySelectorAll("style.font-loading");
    fontStyles.forEach(style => style.remove());
    
    // Load fonts using FontFace API (matching eDEX UI approach)
    const fontPath = './assets/fonts'; // Relative path for web
    
    try {
        // Create a style element for font loading
        const fontStyle = document.createElement('style');
        fontStyle.className = 'font-loading';
        document.head.appendChild(fontStyle);
        
        // Load main font
        if (theme.cssvars && theme.cssvars.font_main) {
            const mainFontPath = `${fontPath}/${theme.cssvars.font_main.toLowerCase().replace(/ /g, '_')}.woff2`;
            const mainFont = new FontFace(theme.cssvars.font_main, `url("${mainFontPath}")`);
            document.fonts.add(mainFont);
            await mainFont.load();
        }
        
        // Load light font
        if (theme.cssvars && theme.cssvars.font_main_light) {
            const lightFontPath = `${fontPath}/${theme.cssvars.font_main_light.toLowerCase().replace(/ /g, '_')}.woff2`;
            const lightFont = new FontFace(theme.cssvars.font_main_light, `url("${lightFontPath}")`);
            document.fonts.add(lightFont);
            await lightFont.load();
        }
        
        // Load terminal font
        if (theme.terminal && theme.terminal.fontFamily) {
            const termFontPath = `${fontPath}/${theme.terminal.fontFamily.toLowerCase().replace(/ /g, '_')}.woff2`;
            const termFont = new FontFace(theme.terminal.fontFamily, `url("${termFontPath}")`);
            document.fonts.add(termFont);
            await termFont.load();
        }
    } catch (error) {
        console.warn("Font loading failed, using system fonts:", error);
    }

    // Apply CSS variables with smooth transition
    const themeStyle = document.createElement('style');
    themeStyle.className = 'theming';
    themeStyle.innerHTML = `
    :root {
        --font_main: "${_purifyCSS(theme.cssvars?.font_main || 'sans-serif')}";
        --font_main_light: "${_purifyCSS(theme.cssvars?.font_main_light || 'sans-serif')}";
        --font_mono: "${_purifyCSS(theme.terminal?.fontFamily || 'monospace')}";
        --color_r: ${_purifyCSS(theme.colors?.r || '170')};
        --color_g: ${_purifyCSS(theme.colors?.g || '207')};
        --color_b: ${_purifyCSS(theme.colors?.b || '209')};
        --color_black: ${_purifyCSS(theme.colors?.black || '#000000')};
        --color_light_black: ${_purifyCSS(theme.colors?.light_black || '#05080d')};
        --color_grey: ${_purifyCSS(theme.colors?.grey || '#262828')};
        --color_red: ${_purifyCSS(theme.colors?.red || 'red')};
        --color_yellow: ${_purifyCSS(theme.colors?.yellow || 'yellow')};
    }

    body {
        font-family: var(--font_main), sans-serif;
        cursor: ${window.settings?.nocursor ? "none" : "default"} !important;
        background-color: var(--color_black);
        color: rgb(var(--color_r), var(--color_g), var(--color_b));
        transition: all 0.5s ease-in-out;
    }

    ${window.settings?.nocursor ? "* { cursor: none !important; }" : ""}
    ${_purifyCSS(theme.injectCSS || "")}
    `;
    
    document.head.appendChild(themeStyle);

    window.theme = theme;
    window.theme.r = theme.colors?.r || 170;
    window.theme.g = theme.colors?.g || 207;
    window.theme.b = theme.colors?.b || 209;
}

// Export the original _loadTheme function for backward compatibility
export { loadTheme as _loadTheme };

export async function toggleTheme() {
    // Define available themes
    const themes = [
        'tron', 'blade', 'matrix', 'cyborg', 'nord', 
        'navy', 'chalkboard', 'apollo', 'interstellar'
    ];
    
    // Get current theme from localStorage or default to 'tron'
    let currentTheme = localStorage.getItem('edex_theme') || 'tron';
    
    // Find current theme index
    let currentIndex = themes.indexOf(currentTheme);
    
    // Move to next theme (loop back to start if at end)
    let nextIndex = (currentIndex + 1) % themes.length;
    let nextTheme = themes[nextIndex];
    
    // Load and apply new theme
    try {
        const response = await fetch(`./assets/themes/${nextTheme}.json`);
        const theme = await response.json();
        
        // Apply smooth transition
        document.body.style.transition = 'all 0.5s ease-in-out';
        document.body.style.opacity = '0';
        
        // Wait for fade out
        await _delay(250);
        
        // Load new theme
        await loadTheme(theme);
        
        // Update UI
        const themeToggle = document.getElementById("theme_toggle");
        if (themeToggle) {
            // Set button text based on theme brightness
            const isDark = theme.colors && theme.colors.black && 
                          (theme.colors.black.includes('#000') || theme.colors.black.includes('0,0,0'));
            themeToggle.textContent = isDark ? "🌙 Dark" : "☀️ Light";
            themeToggle.innerHTML = isDark ? "🌙 Dark" : "☀️ Light";
        }
        
        // Save theme preference
        localStorage.setItem('edex_theme', nextTheme);
        
        // Fade back in
        document.body.style.opacity = '1';
        
        console.log(`Theme switched to: ${nextTheme}`);
        window.showToast(`Theme switched to: ${nextTheme}`, "info");
    } catch (error) {
        console.error("Failed to load theme:", error);
        window.showToast("Failed to switch theme", "error");
        
        // Revert opacity if there was an error
        document.body.style.opacity = '1';
    }
}