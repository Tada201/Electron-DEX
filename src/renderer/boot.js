// src/renderer/boot.js - Boot sequence
import { _delay } from './utils.js';

let bootIndex = 0;
let bootLines = [];

export async function loadBootLog() {
    try {
        const response = await fetch('./assets/misc/boot_log.txt');
        const bootText = await response.text();
        bootLines = bootText.split('\n').filter(line => line.trim());
    } catch (e) {
        // Fallback boot sequence
        bootLines = [
            "Welcome to eDEX Chatbot!",
            "vm_page_bootstrap: 987323 free pages and 53061 wired pages",
            "eDEX Chatbot Interface v1.0.0 - Quantum Neural Networks Online",
            "Initializing AI consciousness protocols...",
            "Loading cybernetic interface drivers...",
            "Neural pathways established. Ready for interaction.",
            "Boot Complete"
        ];
    }
}

export function displayBootLine() {
    try {
        let bootScreen = document.getElementById("boot_screen");
        
        if (!bootScreen) {
            console.error("❌ Boot screen element not found");
            // Emergency fallback
            const appContainer = document.getElementById("app_container");
            if (appContainer) appContainer.style.display = "flex";
            return;
        }
        
        if (typeof bootLines[bootIndex] === "undefined") {
            setTimeout(displayBootLine, 300);
            return;
        }

        if (bootLines[bootIndex] === "Boot Complete") {
            // Add audio effect here if needed
            // Transition to main UI after boot is complete
            setTimeout(() => {
                try {
                    displayTitleScreen();
                } catch (e) {
                    console.error("❌ Failed to display title screen", e);
                    // Emergency fallback
                    bootScreen.style.display = "none";
                    const appContainer = document.getElementById("app_container");
                    if (appContainer) appContainer.style.display = "flex";
                }
            }, 500);
            return;
        }
        
        bootScreen.innerHTML += bootLines[bootIndex] + "<br/>";
        bootIndex++;

        // Exact timing from eDEX UI
        switch(true) {
            case bootIndex < 10:
                setTimeout(displayBootLine, 100);
                break;
            case bootIndex < 20:
                setTimeout(displayBootLine, 50);
                break;
            case bootIndex < 30:
                setTimeout(displayBootLine, 30);
                break;
            case bootIndex < 50:
                setTimeout(displayBootLine, 20);
                break;
            case bootIndex < 70:
                setTimeout(displayBootLine, 15);
                break;
            case bootIndex < bootLines.length - 5:
                setTimeout(displayBootLine, 10);
                break;
            case bootIndex >= bootLines.length - 5 && bootIndex < bootLines.length:
                setTimeout(displayBootLine, 200);
                break;
            default:
                setTimeout(displayBootLine, Math.pow(1 - (bootIndex/1000), 3)*25);
        }
    } catch (error) {
        console.error("❌ Boot sequence error", error);
        // Emergency fallback to show UI
        const bootScreen = document.getElementById("boot_screen");
        if (bootScreen) bootScreen.style.display = "none";
        const appContainer = document.getElementById("app_container");
        if (appContainer) appContainer.style.display = "flex";
    }
}

export async function displayTitleScreen() {
    try {
        let bootScreen = document.getElementById("boot_screen");
        if (bootScreen === null) {
            bootScreen = document.createElement("section");
            bootScreen.setAttribute("id", "boot_screen");
            bootScreen.setAttribute("style", "z-index: 9999999");
            document.body.appendChild(bootScreen);
        }
        bootScreen.innerHTML = "";

        await _delay(400);

        document.body.setAttribute("class", "");
        bootScreen.setAttribute("class", "center");
        bootScreen.innerHTML = "<h1>eDEX CHATBOT</h1>";
        let title = document.querySelector("section > h1");

        await _delay(200);

        document.body.setAttribute("class", "solidBackground");
        // Safe theme access with fallback
        const themeColor = window.theme?.colors?.black || "#000000";
        const r = window.theme?.colors?.r || 170;
        const g = window.theme?.colors?.g || 207;
        const b = window.theme?.colors?.b || 209;
        document.body.style.backgroundColor = themeColor;

        await _delay(100);

        title.setAttribute("style", `background-color: rgb(${r}, ${g}, ${b});border-bottom: 5px solid rgb(${r}, ${g}, ${b});`);

        await _delay(300);

        title.setAttribute("style", `border: 5px solid rgb(${r}, ${g}, ${b});`);

        await _delay(100);

        title.setAttribute("style", "");
        title.setAttribute("class", "glitch");

        await _delay(500);

        document.body.setAttribute("class", "");
        title.setAttribute("class", "");
        title.setAttribute("style", `border: 5px solid rgb(${r}, ${g}, ${b});`);

        await _delay(1000);
        
        bootScreen.remove();
        // Initialize UI after boot sequence
        try {
            const { initUI } = await import('./ui.js');
            await initUI();
        } catch (e) {
            console.error("❌ Failed to initialize UI", e);
            // Emergency fallback: show basic UI
            const appContainer = document.getElementById("app_container");
            if (appContainer) appContainer.style.display = "flex";
        }
    } catch (error) {
        console.error("❌ Title screen error", error);
        // Emergency fallback: skip to UI
        const bootScreen = document.getElementById("boot_screen");
        if (bootScreen) bootScreen.style.display = "none";
        const appContainer = document.getElementById("app_container");
        if (appContainer) appContainer.style.display = "flex";
    }
}