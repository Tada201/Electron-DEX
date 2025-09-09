// src/renderer/test.js - Test functions for modular components

export function runTests() {
    console.log("🧪 Running renderer tests...");
    
    // Test electronAPI availability
    if (typeof window.electronAPI !== 'undefined') {
        console.log("✅ electronAPI is available");
        
        // Test basic API functions
        try {
            // Test getPath
            if (typeof window.electronAPI.getPath === 'function') {
                window.electronAPI.getPath('userData').then(path => {
                    console.log("✅ getPath API working, userData path:", path);
                }).catch(err => {
                    console.log("⚠️ getPath API error:", err);
                });
            } else {
                console.log("⚠️ getPath function not available");
            }
            
            // Test getAppPath
            if (typeof window.electronAPI.getAppPath === 'function') {
                window.electronAPI.getAppPath().then(path => {
                    console.log("✅ getAppPath API working, app path:", path);
                }).catch(err => {
                    console.log("⚠️ getAppPath API error:", err);
                });
            } else {
                console.log("⚠️ getAppPath function not available");
            }
            
            console.log("✅ Electron API tests completed");
        } catch (error) {
            console.error("❌ Error testing Electron APIs:", error);
        }
    } else {
        console.log("❌ electronAPI is not available - this is expected in Vite dev server");
    }
    
    console.log("✅ Renderer tests completed");
}