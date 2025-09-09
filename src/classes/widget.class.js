// Base Widget class for eDEX-UI style widgets
class Widget {
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.name = options.name || 'Widget';
        this.enabled = options.enabled !== false; // Default to true
        this.visible = options.visible !== false; // Default to true
        this.position = options.position || { x: 0, y: 0 };
        this.size = options.size || { width: 300, height: 200 };
        this.element = null;
        this.updateInterval = options.updateInterval || 5000; // 5 seconds default
        this.updateTimer = null;
    }

    // Generate unique ID
    generateId() {
        return 'widget-' + Math.random().toString(36).substr(2, 9);
    }

    // Initialize widget
    async init() {
        if (!this.enabled) return;
        
        // Create widget element
        this.createElement();
        
        // Start update cycle
        this.startUpdating();
        
        console.log(`✅ Widget ${this.name} initialized`);
    }

    // Create widget DOM element
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'widget-container';
        this.element.id = this.id;
        this.element.setAttribute('tabindex', '0'); // Make focusable
        this.element.setAttribute('role', 'region');
        this.element.setAttribute('aria-label', this.name);
        
        // Add focus event listeners
        this.element.addEventListener('focus', () => {
            this.onFocus();
        });
        
        this.element.addEventListener('blur', () => {
            this.onBlur();
        });
        
        this.element.addEventListener('keydown', (event) => {
            this.handleKeydown(event);
        });
        
        // Add default content
        this.element.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">${this.name}</h3>
                <div class="widget-controls">
                    <button class="widget-control-btn" aria-label="Close widget">×</button>
                </div>
            </div>
            <div class="widget-content">
                <p>Widget content loading...</p>
            </div>
        `;
        
        // Add close button functionality
        const closeBtn = this.element.querySelector('.widget-control-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.disable();
            });
        }
    }

    // Handle focus event
    onFocus() {
        this.element.style.boxShadow = '0 0 10px rgba(var(--color_r), var(--color_g), var(--color_b), 0.5)';
        console.log(`Widget ${this.name} focused`);
    }

    // Handle blur event
    onBlur() {
        this.element.style.boxShadow = 'none';
        console.log(`Widget ${this.name} blurred`);
    }

    // Handle keyboard events
    handleKeydown(event) {
        switch (event.key) {
            case 'Escape':
                // Close widget on Escape
                event.preventDefault();
                this.disable();
                break;
                
            case 'Enter':
            case ' ':
                // Activate widget on Enter or Space
                if (event.target === this.element) {
                    event.preventDefault();
                    this.activate();
                }
                break;
        }
    }

    // Activate widget
    activate() {
        console.log(`Widget ${this.name} activated`);
        // Override in subclasses for specific activation behavior
    }

    // Enable widget
    enable() {
        this.enabled = true;
        this.visible = true;
        
        if (this.element) {
            this.element.style.display = 'block';
        }
        
        // Start update cycle
        this.startUpdating();
        
        console.log(`✅ Widget ${this.name} enabled`);
    }

    // Disable widget
    disable() {
        this.enabled = false;
        this.visible = false;
        
        if (this.element) {
            this.element.style.display = 'none';
        }
        
        // Stop update cycle
        this.stopUpdating();
        
        console.log(`🚫 Widget ${this.name} disabled`);
    }

    // Toggle widget visibility
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    // Start updating widget data
    startUpdating() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        if (this.enabled) {
            this.updateTimer = setInterval(() => {
                if (this.enabled) {
                    this.update();
                }
            }, this.updateInterval);
        }
    }

    // Stop updating widget data
    stopUpdating() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    // Update widget content (override in subclasses)
    async update() {
        // Override this method in subclasses
        console.log(`🔄 Updating widget ${this.name}`);
    }

    // Destroy widget
    destroy() {
        this.stopUpdating();
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
        
        console.log(`💥 Widget ${this.name} destroyed`);
    }
}

// Export the Widget class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Widget;
} else {
    window.Widget = Widget;
}