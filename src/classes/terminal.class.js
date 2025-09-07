// Terminal class adapted for Tauri chatbot interface
class Terminal {
    constructor(opts) {
        if (!opts.parentId) throw "Missing parentId option";
        
        // Import xterm modules
        this.Terminal = window.Terminal || import('@xterm/xterm').Terminal;
        
        this.parentId = opts.parentId;
        this.onmessage = opts.onmessage || (() => {});
        this.messages = [];
        
        this._initializeTerminal();
    }
    
    async _initializeTerminal() {
        // Load xterm dynamically if needed
        if (!window.Terminal) {
            const xtermModule = await import('@xterm/xterm');
            const { FitAddon } = await import('@xterm/addon-fit');
            const { WebglAddon } = await import('@xterm/addon-webgl');
            
            this.Terminal = xtermModule.Terminal;
            this.FitAddon = FitAddon;
            this.WebglAddon = WebglAddon;
        }
        
        // Get theme colors
        const themeColor = `rgb(${window.theme?.r || 170}, ${window.theme?.g || 207}, ${window.theme?.b || 209})`;
        
        // Initialize xterm terminal
        this.term = new this.Terminal({
            cols: 80,
            rows: 24,
            cursorBlink: true,
            cursorStyle: "block",
            allowTransparency: false,
            fontFamily: window.theme?.terminal?.fontFamily || "Fira Mono, monospace",
            fontSize: window.theme?.terminal?.fontSize || 14,
            fontWeight: "normal",
            letterSpacing: 0,
            lineHeight: 1,
            scrollback: 1500,
            bellStyle: "none",
            theme: {
                foreground: window.theme?.terminal?.foreground || "#aacfd1",
                background: window.theme?.terminal?.background || "#05080d",
                cursor: window.theme?.terminal?.cursor || "#aacfd1",
                cursorAccent: window.theme?.terminal?.cursorAccent || "#aacfd1",
                selection: window.theme?.terminal?.selection || "rgba(170,207,209,0.3)",
                black: "#000000",
                red: "#cc0000", 
                green: "#4e9a06",
                yellow: "#c4a000",
                blue: "#3465a4",
                magenta: "#75507b",
                cyan: "#06989a",
                white: "#d3d7cf"
            }
        });
        
        // Add addons
        if (this.FitAddon) {
            this.fitAddon = new this.FitAddon();
            this.term.loadAddon(this.fitAddon);
        }
        
        if (this.WebglAddon) {
            try {
                this.term.loadAddon(new this.WebglAddon());
            } catch (e) {
                console.warn("WebGL addon failed to load:", e);
            }
        }
        
        // Mount terminal to DOM
        const container = document.getElementById(this.parentId);
        if (container) {
            this.term.open(container);
            this.fit();
        }
        
        // Disable input to make it read-only (chat display only)
        this.term.attachCustomKeyEventHandler(() => false);
        
        // Initialize with welcome message
        this.writeln("\x1b[1meDEX Chatbot Interface v1.0.0\x1b[0m");
        this.writeln("\x1b[36mSystem initialized. Ready for chat.\x1b[0m");
        this.writeln("");
    }
    
    fit() {
        if (this.fitAddon) {
            this.fitAddon.fit();
        }
    }
    
    write(text) {
        if (this.term) {
            this.term.write(text);
        }
    }
    
    writeln(text) {
        if (this.term) {
            this.term.writeln(text);
        }
    }
    
    addMessage(type, content) {
        const timestamp = new Date().toLocaleTimeString();
        this.messages.push({ type, content, timestamp });
        
        switch(type) {
            case 'user':
                this.writeln(`\x1b[32m[${timestamp}] USER>\x1b[0m ${content}`);
                break;
            case 'assistant':
                this.writeln(`\x1b[36m[${timestamp}] AI  >\x1b[0m ${content}`);
                break;
            case 'system':
                this.writeln(`\x1b[33m[${timestamp}] SYS >\x1b[0m ${content}`);
                break;
            case 'error':
                this.writeln(`\x1b[31m[${timestamp}] ERR >\x1b[0m ${content}`);
                break;
        }
        
        // Auto-scroll to bottom
        this.term.scrollToBottom();
    }
    
    clear() {
        if (this.term) {
            this.term.clear();
        }
        this.messages = [];
    }
    
    resize(cols, rows) {
        if (this.term) {
            this.term.resize(cols, rows);
        }
    }
}