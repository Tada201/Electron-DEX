// SettingsBridge.js - Bridge between vanilla JS and React components
console.log('SettingsBridge.js loaded');

class SettingsBridge {
    constructor() {
        this.isOpen = false;
        this.root = null;
        this.container = null;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 100;
    }

    init() {
        console.log('SettingsBridge.init() called');
        // Check if React and ReactDOM are available
        if (typeof window.React === 'undefined' || typeof window.ReactDOM === 'undefined') {
            this.retryCount++;
            if (this.retryCount > this.maxRetries) {
                console.error('React or ReactDOM not available after maximum retries. Aborting initialization.');
                this.showFallbackUI();
                return;
            }
            if (this.retryCount % 10 === 0) {
                console.warn(`React or ReactDOM not available yet (attempt ${this.retryCount}/${this.maxRetries}), retrying in 200ms`);
            }
            setTimeout(() => this.init(), 200);
            return;
        }

        const React = window.React;
        const ReactDOM = window.ReactDOM;
        const isReact18 = typeof ReactDOM.createRoot !== 'undefined';
        console.log('React and ReactDOM available, isReact18:', isReact18);

        // Import the styled-components based components
        // These will be loaded dynamically
        this.loadComponents().then(() => {
            console.log('Components loaded successfully');
            // Create modal container
            this.container = document.createElement('div');
            this.container.id = 'settings-modal-container';
            document.body.appendChild(this.container);

            // Setup event listener for settings button
            const settingsBtn = document.getElementById('settings_btn');
            console.log('Settings button element:', settingsBtn);
            if (settingsBtn) {
                // Clear existing content
                settingsBtn.innerHTML = '';

                // Create trigger container
                const triggerContainer = document.createElement('div');
                triggerContainer.id = 'settings-trigger-container';
                triggerContainer.className = 'w-full'; // Ensure it takes full width
                settingsBtn.appendChild(triggerContainer);

                // Render the SettingsTrigger component
                try {
                    console.log('Attempting to render SettingsTrigger component');
                    if (isReact18) {
                        this.root = ReactDOM.createRoot(triggerContainer);
                        this.root.render(
                            React.createElement(window.SettingsTrigger, {
                                onClick: () => this.open()
                            })
                        );
                    } else {
                        ReactDOM.render(
                            React.createElement(window.SettingsTrigger, {
                                onClick: () => this.open()
                            }),
                            triggerContainer
                        );
                    }
                    this.isInitialized = true;
                    console.log('SettingsBridge initialized successfully');
                } catch (error) {
                    console.error('Failed to render SettingsTrigger:', error);
                    this.showFallbackUI();
                }
            } else {
                this.retryCount++;
                if (this.retryCount > this.maxRetries) {
                    console.error('Settings button not found after maximum retries. Aborting initialization.');
                    this.showFallbackUI();
                    return;
                }
                if (this.retryCount % 10 === 0) {
                    console.log(`Settings button not found (attempt ${this.retryCount}/${this.maxRetries}), retrying in 200ms`);
                }
                setTimeout(() => this.init(), 200);
            }
        }).catch(error => {
            console.error('Failed to load components:', error);
            this.showFallbackUI();
        });
    }

    async loadComponents() {
        // Dynamically import the styled-components based components
        // Add cache-busting timestamp to avoid MIME type issues
        const timestamp = Date.now();
        try {
            console.log('Loading SettingsTrigger.js');
            const { default: SettingsTrigger } = await import(`./SettingsTrigger.js?t=${timestamp}`);
            console.log('Loading SettingsModal.js');
            const { default: SettingsModal } = await import(`./SettingsModal.js?t=${timestamp}`);

            window.SettingsTrigger = SettingsTrigger;
            window.SettingsModal = SettingsModal;
            console.log('Components loaded and assigned to window object');
        } catch (error) {
            console.error('Failed to load styled components:', error);
            throw error;
        }
    }

    open() {
        if (this.isOpen || !this.isInitialized) return;

        try {
            this.isOpen = true;
            if (this.root) {
                this.root.unmount();
                this.root = null;
            }

            const React = window.React;
            const ReactDOM = window.ReactDOM;
            const isReact18 = typeof ReactDOM.createRoot !== 'undefined';

            if (isReact18) {
                this.root = ReactDOM.createRoot(this.container);
                this.root.render(
                    React.createElement(window.SettingsModal, {
                        isOpen: true,
                        onClose: () => this.close()
                    })
                );
            } else {
                ReactDOM.render(
                    React.createElement(window.SettingsModal, {
                        isOpen: true,
                        onClose: () => this.close()
                    }),
                    this.container
                );
            }
        } catch (error) {
            console.error('Failed to open settings modal:', error);
        }
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        if (this.root) {
            this.root.unmount();
            this.root = null;
        } else if (this.container) {
            window.ReactDOM.unmountComponentAtNode(this.container);
        }
    }

    showFallbackUI() {
        console.log('Showing fallback UI');
        const settingsBtn = document.getElementById('settings_btn');
        if (settingsBtn) {
            settingsBtn.innerHTML = `
                <button style="
                    width: 100%;
                    padding: 8px;
                    background: transparent;
                    border: 1px solid #00ffff;
                    color: #00ffff;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " onmouseover="this.style.background='rgba(0, 255, 255, 0.1)';" onmouseout="this.style.background='transparent';">
                    <span style="margin-right: 8px;">⚙</span>
                    <span>SETTINGS</span>
                </button>
            `;

            const fallbackButton = settingsBtn.querySelector('button');
            if (fallbackButton) {
                fallbackButton.addEventListener('click', () => {
                    alert('Settings functionality is currently unavailable. Please try again later.');
                });
            }
        }
    }
}

// Export for global use - DO NOT initialize here
window.SettingsBridge = new SettingsBridge();

// Note: Initialization should be handled by the main application
// to ensure proper order and avoid conflicts