// preload.js - Expose protected methods to renderer
const { contextBridge, ipcRenderer } = require('electron');

try {
  // Expose protected methods to renderer
  contextBridge.exposeInMainWorld('electronAPI', {
    // IPC communication
    send: (channel, data) => ipcRenderer.send(channel, data),
    sendSync: (channel, data) => ipcRenderer.sendSync(channel, data),
    sendAsync: (channel, data) => ipcRenderer.invoke(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    
    // System information
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    getPath: (name) => ipcRenderer.invoke('get-path', name),
    
    // App control
    focusApp: () => ipcRenderer.invoke('focus-app'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    
    // Logging
    log: (level, message) => ipcRenderer.send('log', level, message),
    
    // System information proxy
    systemInformationCall: (prop, id, ...args) => ipcRenderer.send('systeminformation-call', prop, id, ...args),
    onSystemInformationReply: (id, func) => ipcRenderer.on(`systeminformation-reply-${id}`, (event, res) => func(res)),
    
    // Theme override
    getThemeOverride: () => ipcRenderer.invoke('get-theme-override'),
    getKbOverride: () => ipcRenderer.invoke('get-kb-override'),
    
    // Audio management
    playAudio: (sound) => ipcRenderer.send('play-audio', sound),
    
    // File operations
    readFile: (path) => ipcRenderer.invoke('read-file', path),
    writeFile: (path, data) => ipcRenderer.invoke('write-file', path, data),
    fileExists: (path) => ipcRenderer.invoke('file-exists', path)
  });
} catch (error) {
  console.error('Failed to expose electronAPI:', error);
  // Fallback for when contextBridge is not available
  window.electronAPI = {
    // Basic fallback implementations
    send: () => console.warn('IPC not available'),
    sendSync: () => null,
    sendAsync: async () => null,
    receive: () => console.warn('IPC not available'),
    removeAllListeners: () => {},
    getAppPath: async () => '.',
    getUserDataPath: async () => '.',
    getPath: async () => '.',
    focusApp: async () => {},
    quitApp: async () => {},
    log: () => {},
    systemInformationCall: () => {},
    onSystemInformationReply: () => {},
    getThemeOverride: async () => null,
    getKbOverride: async () => null,
    playAudio: () => {},
    readFile: async () => '',
    writeFile: async () => false,
    fileExists: async () => false
  };
}