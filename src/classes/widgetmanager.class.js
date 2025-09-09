// Widget Manager for eDEX-UI style widgets
class WidgetManager {
    constructor() {
        this.widgets = new Map();
        this.widgetClasses = new Map();
        this.settings = this.loadSettings();
    }

    // Register a widget class
    registerWidget(name, widgetClass) {
        this.widgetClasses.set(name, widgetClass);
        console.log(`✅ Registered widget: ${name}`);
    }

    // Create and initialize a widget
    async createWidget(name, options = {}) {
        const WidgetClass = this.widgetClasses.get(name);
        if (!WidgetClass) {
            throw new Error(`Widget class '${name}' not registered`);
        }

        // Merge with saved settings
        const widgetSettings = this.settings.widgets?.[name] || {};
        const widgetOptions = { ...widgetSettings, ...options };

        // Create widget instance
        const widget = new WidgetClass(widgetOptions);
        
        // Initialize widget
        await widget.init();
        
        // Store widget
        this.widgets.set(widget.id, widget);
        
        return widget;
    }

    // Add widget to UI
    addWidgetToUI(widget, containerId = 'system_panels') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container '${containerId}' not found`);
            return;
        }

        // Add widget element to container
        if (widget.element) {
            container.appendChild(widget.element);
        }
    }

    // Remove widget from UI
    removeWidgetFromUI(widget) {
        if (widget.element && widget.element.parentNode) {
            widget.element.parentNode.removeChild(widget.element);
        }
    }

    // Enable a widget
    async enableWidget(name, options = {}) {
        // Check if widget already exists
        let widget = Array.from(this.widgets.values()).find(w => w.constructor.name === name);
        
        if (!widget) {
            // Create new widget
            widget = await this.createWidget(name, options);
        } else {
            widget.enable();
        }

        // Add to UI
        this.addWidgetToUI(widget);
        
        return widget;
    }

    // Disable a widget
    disableWidget(name) {
        const widget = Array.from(this.widgets.values()).find(w => w.constructor.name === name);
        if (widget) {
            widget.disable();
            this.removeWidgetFromUI(widget);
        }
    }

    // Toggle widget visibility
    toggleWidget(name) {
        const widget = Array.from(this.widgets.values()).find(w => w.constructor.name === name);
        if (widget) {
            widget.toggle();
        }
    }

    // Update all enabled widgets
    async updateAll() {
        for (const widget of this.widgets.values()) {
            if (widget.enabled) {
                await widget.update();
            }
        }
    }

    // Destroy all widgets
    destroyAll() {
        for (const widget of this.widgets.values()) {
            widget.destroy();
        }
        this.widgets.clear();
    }

    // Save widget settings
    saveSettings() {
        const settings = {
            widgets: {}
        };

        // Save each widget's configuration
        for (const widget of this.widgets.values()) {
            settings.widgets[widget.constructor.name] = {
                enabled: widget.enabled,
                visible: widget.visible,
                position: widget.position,
                size: widget.size
            };
        }

        localStorage.setItem('widgetSettings', JSON.stringify(settings));
        console.log('✅ Widget settings saved');
    }

    // Load widget settings
    loadSettings() {
        try {
            const settings = localStorage.getItem('widgetSettings');
            return settings ? JSON.parse(settings) : { widgets: {} };
        } catch (error) {
            console.error('Failed to load widget settings:', error);
            return { widgets: {} };
        }
    }

    // Get available widget types
    getAvailableWidgets() {
        return Array.from(this.widgetClasses.keys());
    }

    // Get active widgets
    getActiveWidgets() {
        return Array.from(this.widgets.values());
    }
}

// Export the WidgetManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetManager;
} else {
    window.WidgetManager = WidgetManager;
}