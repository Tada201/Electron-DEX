// src/renderer/utils.js - Utility functions
export function showToast(message, type = 'info', duration = 5000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.cyber-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `cyber-toast cyber-toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color_black);
        border: 2px solid rgb(var(--color_r), var(--color_g), var(--color_b));
        box-shadow: 0 0 20px rgba(var(--color_r), var(--color_g), var(--color_b), 0.5);
        border-radius: 5px;
        padding: 15px 20px;
        color: rgb(var(--color_r), var(--color_g), var(--color_b));
        font-family: var(--font_mono);
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    // Type-specific styling
    let borderColor = 'rgb(var(--color_r), var(--color_g), var(--color_b))';
    let glowColor = 'rgba(var(--color_r), var(--color_g), var(--color_b), 0.5)';
    switch (type) {
        case 'success':
            borderColor = '#00ff00';
            glowColor = 'rgba(0, 255, 0, 0.5)';
            break;
        case 'error':
            borderColor = '#ff0000';
            glowColor = 'rgba(255, 0, 0, 0.5)';
            break;
        case 'warning':
            borderColor = '#ffff00';
            glowColor = 'rgba(255, 255, 0, 0.5)';
            break;
        case 'info':
            borderColor = 'rgb(var(--color_r), var(--color_g), var(--color_b))';
            glowColor = 'rgba(var(--color_r), var(--color_g), var(--color_b), 0.5)';
            break;
    }
    toast.style.borderColor = borderColor;
    toast.style.boxShadow = `0 0 20px ${glowColor}`;

    // Add content
    toast.innerHTML = `
        <div style="margin-bottom: 5px;">${_escapeHtml(message)}</div>
        <div style="font-size: 12px; opacity: 0.8;">Click to dismiss</div>
    `;

    // Event listeners
    toast.addEventListener('click', () => toast.remove());

    // Append to body
    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

export function _escapeHtml(text) {
    let map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => {return map[m];});
}

export function _purifyCSS(str) {
    if (typeof str === "undefined") return "";
    if (typeof str !== "string") {
        str = str.toString();
    }
    return str.replace(/[<]/g, "");
}

export function _delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}