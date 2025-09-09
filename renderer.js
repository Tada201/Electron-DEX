// Renderer process script
document.addEventListener('DOMContentLoaded', () => {
    // Display version information
    updateVersionInfo();
    
    // Set up event listeners
    setupEventListeners();
    
    // Welcome animation
    showWelcomeMessage();
});

function updateVersionInfo() {
    const electronVersionEl = document.getElementById('electron-version');
    const nodeVersionEl = document.getElementById('node-version');
    const chromeVersionEl = document.getElementById('chrome-version');
    
    if (!electronVersionEl || !nodeVersionEl || !chromeVersionEl) {
        console.warn('Version display elements not found in DOM');
        return;
    }
    
    const maxRetries = 3;
    let retryCount = 0;
    
    const fetchVersions = () => {
        retryCount++;
        
        if (window.electronAPI && window.electronAPI.sendAsync) {
            window.electronAPI.sendAsync('get-versions')
                .then(versions => {
                    electronVersionEl.textContent = versions.electron || 'Unknown';
                    nodeVersionEl.textContent = versions.node || 'Unknown';
                    chromeVersionEl.textContent = versions.chrome || 'Unknown';
                    console.log('✅ Versions fetched successfully');
                })
                .catch(error => {
                    console.error(`Failed to fetch versions (attempt ${retryCount}):`, error);
                    if (retryCount < maxRetries) {
                        setTimeout(fetchVersions, retryCount * 1000);
                    } else {
                        setVersionFallback();
                    }
                });
        } else {
            console.warn('electronAPI not available, falling back to ipcRenderer');
            if (window.require) {
                try {
                    const { ipcRenderer } = window.require('electron');
                    ipcRenderer.invoke('get-versions')
                        .then(versions => {
                            electronVersionEl.textContent = versions.electron || 'Unknown';
                            nodeVersionEl.textContent = versions.node || 'Unknown';
                            chromeVersionEl.textContent = versions.chrome || 'Unknown';
                            console.log('✅ Versions fetched via fallback');
                        })
                        .catch(error => {
                            console.error(`Failed to fetch versions via fallback (attempt ${retryCount}):`, error);
                            if (retryCount < maxRetries) {
                                setTimeout(fetchVersions, retryCount * 1000);
                            } else {
                                setVersionFallback();
                            }
                        });
                } catch (e) {
                    setVersionFallback();
                }
            } else {
                setVersionFallback();
            }
        }
    };
    
    // Start fetching with shorter initial delay
    setTimeout(fetchVersions, 500);
    
    function setVersionFallback() {
        electronVersionEl.textContent = 'N/A';
        nodeVersionEl.textContent = 'N/A';
        chromeVersionEl.textContent = 'N/A';
    }
}

function setupEventListeners() {
    // Demo button - with null check
    const demoBtn = document.getElementById('demo-btn');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            showMessage('Hello from Electron! 🎉', 'success');
            
            // Add some visual feedback
            demoBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                demoBtn.style.transform = '';
            }, 150);
        });
    }
    
    // Notification button - with null check
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showNotification();
        });
    }
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    if (!messageEl) {
        console.warn('Message element not found, using console instead:', text);
        console.log(`[${type.toUpperCase()}] ${text}`);
        return;
    }
    
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}

function showNotification() {
    // Check if notifications are supported
    if ('Notification' in window) {
        // Request permission if needed
        if (Notification.permission === 'granted') {
            createNotification();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    createNotification();
                }
            });
        } else {
            showMessage('Notifications are blocked. Please enable them in your browser settings.', 'info');
        }
    } else {
        showMessage('Notifications are not supported in this environment.', 'info');
    }
}

function createNotification() {
    const notification = new Notification('Electron DEX', {
        body: 'Hello from your Electron app! 👋',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTMgM0MxMy41NTIzIDMgMTQgMy40NDc3MiAxNCA0VjEwLjU4NThMMTUuNzA3MSA5LjI5Mjg5QzE2LjA5NzYgOC45MDIzNyAxNi43MzA4IDguOTAyMzcgMTcuMTIxMyA5LjI5Mjg5QzE3LjUxMTggOS42ODM0MiAxNy41MTE4IDEwLjMxNjYgMTcuMTIxMyAxMC43MDcxTDE0LjQxNDIgMTMuNDE0MkMxNC4wMjM3IDEzLjgwNDcgMTMuMzkwNSAxMy44MDQ3IDEzIDEzLjQxNDJMMTAuMjkyOSAxMC43MDcxQzkuOTAyMzcgMTAuMzE2NiA5LjkwMjM3IDkuNjgzNDIgMTAuMjkyOSA5LjI5Mjg5QzEwLjY4MzQgOC45MDIzNyAxMS4zMTY2IDguOTAyMzcgMTEuNzA3MSA5LjI5Mjg5TDEzIDEwLjU4NThWNEM5LjY4NjI5IDQgNyA2LjY4NjI5IDcgMTBDNyAxMy4zMTM3IDkuNjg2MjkgMTYgMTMgMTZDMTYuMzEzNyAxNiAxOSAxMy4zMTM3IDE5IDEwQzE5IDYuNjg2MjkgMTYuMzEzNyA0IDEzIDRWM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4='
    });
    
    // Auto-close notification after 4 seconds
    setTimeout(() => {
        notification.close();
    }, 4000);
    
    showMessage('Notification sent! 📨', 'success');
}

function showWelcomeMessage() {
    // Show a welcome message after a short delay
    setTimeout(() => {
        console.log('🚀 Electron DEX is ready!');
        console.log('Welcome to your new Electron application!');
        console.log('Press Ctrl+Shift+D to toggle demo controls');
    }, 500);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+R or F5 to reload
    if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        location.reload();
    }
    
    // Ctrl+Shift+I to toggle DevTools (handled by main process)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        // This will be handled by the main process
        console.log('DevTools toggle requested');
    }
    
    // Ctrl+Shift+D to toggle demo section
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const demoSection = document.getElementById('demo_section');
        if (demoSection) {
            demoSection.style.display = demoSection.style.display === 'none' ? 'block' : 'none';
        }
    }
});

// Handle app focus/blur
window.addEventListener('focus', () => {
    console.log('App focused');
});

window.addEventListener('blur', () => {
    console.log('App blurred');
});