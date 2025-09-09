// src/renderer/apiSettings.js - API settings management
import { showToast } from './utils.js';

export function loadApiSettings() {
    const settings = JSON.parse(localStorage.getItem('apiSettings'));
    if (settings) {
        window.apiSettings = settings;
        const providers = ["openai", "anthropic", "google", "mistral", "groq", "xai"];
        providers.forEach(provider => {
            const apiKeyInput = document.getElementById(`${provider}_api_key`);
            const modelSelect = document.getElementById(`${provider}_model`);
            if (apiKeyInput) apiKeyInput.value = settings[provider].apiKey;
            if (modelSelect) modelSelect.value = settings[provider].model;

            if (provider === "openai") {
                const tempSlider = document.getElementById("openai_temperature");
                const tempValue = document.getElementById("openai_temp_value");
                const maxTokensInput = document.getElementById("openai_max_tokens");

                if (tempSlider && window.apiSettings.openai.temperature) {
                    tempSlider.value = window.apiSettings.openai.temperature;
                    if (tempValue) tempValue.textContent = window.apiSettings.openai.temperature;
                }

                if (maxTokensInput && window.apiSettings.openai.maxTokens) {
                    maxTokensInput.value = window.apiSettings.openai.maxTokens;
                }
            } else if (provider === "anthropic") {
                const maxTokensInput = document.getElementById("anthropic_max_tokens");
                if (maxTokensInput && window.apiSettings.anthropic.maxTokens) {
                    maxTokensInput.value = window.apiSettings.anthropic.maxTokens;
                }
            }
        }); // Fixed: Added missing closing parenthesis and curly brace
    } // Added missing closing brace for the if (settings) block

    // Populate tools settings
    if (window.apiSettings.enableTools !== undefined) {
        const enableToolsCheckbox = document.getElementById("enable_tools");
        if (enableToolsCheckbox) {
            enableToolsCheckbox.checked = window.apiSettings.enableTools;
        }
    }

    // Update tools list
    updateToolsList();
}

export function saveApiSettings() {
    // Collect settings from all provider forms
    const providers = ["openai", "anthropic", "google", "mistral", "groq", "xai"];
    const settings = {};
    
    providers.forEach(provider => {
        const apiKeyInput = document.getElementById(`${provider}_api_key`);
        const modelSelect = document.getElementById(`${provider}_model`);
        
        settings[provider] = {
            apiKey: apiKeyInput && apiKeyInput.dataset.originalValue ? 
                   apiKeyInput.dataset.originalValue : 
                   (apiKeyInput ? apiKeyInput.value : ''),
            model: modelSelect ? modelSelect.value : ''
        };
        
        // Add provider-specific settings
        if (provider === "openai") {
            const tempSlider = document.getElementById("openai_temperature");
            const maxTokensInput = document.getElementById("openai_max_tokens");
            
            settings.openai.temperature = tempSlider ? parseFloat(tempSlider.value) : 0.7;
            settings.openai.maxTokens = maxTokensInput ? parseInt(maxTokensInput.value) : 2048;
        } else if (provider === "anthropic") {
            const maxTokensInput = document.getElementById("anthropic_max_tokens");
            settings.anthropic.maxTokens = maxTokensInput ? parseInt(maxTokensInput.value) : 4096;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('apiSettings', JSON.stringify(settings));
    window.apiSettings = settings;
    
    // Handle tools settings
    const enableToolsCheckbox = document.getElementById('enable_tools');
    if (enableToolsCheckbox) {
        const enableTools = enableToolsCheckbox.checked;
        if (window.chat) {
            window.chat.setToolsEnabled(enableTools);
        }
        // Save tools preference
        settings.enableTools = enableTools;
    }
    
    // Hide modal
    document.getElementById("api_settings_modal").style.display = "none";
    
    showToast("API settings saved successfully", "success");
}

async function testApiConnection() {
    // Get current provider settings
    const activeTab = document.querySelector(".provider-tab.active");
    if (!activeTab) return;
    
    const provider = activeTab.dataset.provider;
    const apiKeyInput = document.getElementById(`${provider}_api_key`);
    const modelSelect = document.getElementById(`${provider}_model`);
    
    if (!apiKeyInput || !apiKeyInput.value) {
        showToast("Please enter an API key", "error");
        return;
    }
    
    // Show testing status
    const statusDisplay = document.getElementById("connection_status");
    if (statusDisplay) {
        statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Testing connection...</span>';
    }
    
    try {
        const response = await fetch(`http://localhost:3001/api/providers/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: provider,
                apiKey: apiKeyInput.value,
                model: modelSelect ? modelSelect.value : null
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (statusDisplay) {
                statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Connection successful! ✅</span>';
            }
            showToast(result.message, "success");
        } else {
            if (statusDisplay) {
                statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Connection failed ❌</span>';
            }
            showToast(result.message || "Connection test failed", "error");
        }
    } catch (error) {
        if (statusDisplay) {
            statusDisplay.innerHTML = '<span class="status-text">[SYSTEM] Connection failed ❌</span>';
        }
        showToast(`Connection test error: ${error.message}`, "error");
    }
}

async function updateToolsList() {
    try {
        const response = await fetch('http://localhost:3001/api/tools');
        if (response.ok) {
            const toolsData = await response.json();
            window.tools = toolsData.tools || [];
            
            // Update tools list in API settings modal
            const toolsListContainer = document.getElementById('tools_list');
            if (toolsListContainer) {
                toolsListContainer.innerHTML = '';
                
                if (window.tools.length === 0) {
                    toolsListContainer.innerHTML = '<div class="no-tools">No tools available. Tools will be available once the database is initialized.</div>';
                } else {
                    window.tools.forEach(tool => {
                        const toolElement = document.createElement('div');
                        toolElement.className = 'tool-item';
                        toolElement.innerHTML = `
                            <div class="tool-info">
                                <div class="tool-name">${tool.name}</div>
                                <div class="tool-description">${tool.description || 'No description'}</div>
                            </div>
                            <div class="tool-actions">
                                <button class="neon_button tool-edit" onclick="editTool('${tool.id}')">EDIT</button>
                                <button class="neon_button tool-delete" onclick="deleteTool('${tool.id}')">DELETE</button>
                            </div>
                        `;
                        toolsListContainer.appendChild(toolElement);
                    });
                }
            }
            
            // Update tools in chat instance
            if (window.chat) {
                window.chat.setTools(window.tools);
            }
        } else if (response.status === 500) {
            console.error('Backend server error (500) when fetching tools');
            const toolsListContainer = document.getElementById('tools_list');
            if (toolsListContainer) {
                toolsListContainer.innerHTML = '<div class="no-tools">Backend server error. Please try again later.</div>';
            }
        } else if (response.status === 503) {
            console.error('Service unavailable when fetching tools');
            const toolsListContainer = document.getElementById('tools_list');
            if (toolsListContainer) {
                toolsListContainer.innerHTML = '<div class="no-tools">Service temporarily unavailable. Database is initializing.</div>';
            }
        }
    } catch (error) {
        console.error('Error updating tools list:', error);
        const toolsListContainer = document.getElementById('tools_list');
        if (toolsListContainer) {
            toolsListContainer.innerHTML = '<div class="no-tools">Failed to load tools. Please check backend server connection.</div>';
        }
    }
}

function setupSettingsModalListeners() {
    // Close button
    const closeBtn = document.getElementById("api_modal_close");
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("api_settings_modal").style.display = "none";
        };
    }
    
    // Cancel button
    const cancelBtn = document.getElementById("api_modal_cancel");
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            document.getElementById("api_settings_modal").style.display = "none";
        };
    }
    
    // Provider tabs
    const providerTabs = document.querySelectorAll(".provider-tab");
    providerTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs
            providerTabs.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            tab.classList.add("active");
            
            // Show corresponding config panel
            const provider = tab.dataset.provider;
            const configPanels = document.querySelectorAll(".config-panel");
            configPanels.forEach(panel => {
                panel.classList.remove("active");
                if (panel.dataset.provider === provider) {
                    panel.classList.add("active");
                }
            });
        });
    });
    
    // Toggle visibility buttons for API keys
    const toggleButtons = document.querySelectorAll(".toggle-visibility");
    toggleButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    button.textContent = "🙈";
                } else {
                    input.type = "password";
                    button.textContent = "👁";
                }
            }
        });
    });
    
    // Save settings button
    const saveBtn = document.getElementById("api_save_settings");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            saveApiSettings();
        });
    }
    
    // Test connection button
    const testBtn = document.getElementById("api_test_connection");
    if (testBtn) {
        testBtn.addEventListener("click", () => {
            testApiConnection();
        });
    }
    
    // Temperature slider updates
    const tempSliders = document.querySelectorAll(".form-slider");
    tempSliders.forEach(slider => {
        slider.addEventListener("input", () => {
            const valueDisplay = document.getElementById(`${slider.id}_value`);
            if (valueDisplay) {
                valueDisplay.textContent = slider.value;
            }
        });
    });
    
    // Tools management
    const addToolBtn = document.getElementById("add_tool_btn");
    if (addToolBtn) {
        addToolBtn.addEventListener("click", () => {
            createNewTool();
        });
    }
    
    const newToolBtn = document.getElementById("new_tool_btn");
    if (newToolBtn) {
        newToolBtn.addEventListener("click", () => {
            createNewTool();
        });
    }
    
    const toolForm = document.getElementById("tool_form");
    if (toolForm) {
        toolForm.addEventListener("submit", (e) => {
            e.preventDefault();
            saveTool();
        });
    }
    
    const toolCancelBtn = document.getElementById("tool_cancelBtn");
    if (toolCancelBtn) {
        toolCancelBtn.addEventListener("click", () => {
            document.getElementById("tools_management_modal").style.display = "none";
        });
    }
    
    const toolDeleteBtn = document.getElementById("tool_delete_btn");
    if (toolDeleteBtn) {
        toolDeleteBtn.addEventListener("click", () => {
            const toolId = document.getElementById("tool_id").value;
            if (toolId) {
                deleteTool(toolId);
            }
        });
    }
    
    const toolsModalClose = document.getElementById("tools_modal_close");
    if (toolsModalClose) {
        toolsModalClose.addEventListener("click", () => {
            document.getElementById("tools_management_modal").style.display = "none";
        });
    }
    
    // Enable tools checkbox
    const enableToolsCheckbox = document.getElementById("enable_tools");
    if (enableToolsCheckbox) {
        enableToolsCheckbox.addEventListener("change", () => {
            if (window.chat) {
                window.chat.setToolsEnabled(enableToolsCheckbox.checked);
            }
        });
    }
}

function populateApiSettingsModal() {
    // Populate modal with saved settings
    const providers = ["openai", "anthropic", "google", "mistral", "groq", "xai"];
    
    providers.forEach((provider) => {
        // Set API key if saved
        const apiKeyInput = document.getElementById(`${provider}_api_key`);
        if (apiKeyInput && window.apiSettings[provider] && window.apiSettings[provider].apiKey) {
            // Mask the API key for security
            const maskedKey = window.apiSettings[provider].apiKey.substring(0, 4) + '...' + 
                             window.apiSettings[provider].apiKey.substring(window.apiSettings[provider].apiKey.length - 4);
            apiKeyInput.value = maskedKey;
            apiKeyInput.dataset.originalValue = window.apiSettings[provider].apiKey;
        }
        
        // Set model if saved
        const modelSelect = document.getElementById(`${provider}_model`);
        if (modelSelect && window.apiSettings[provider] && window.apiSettings[provider].model) {
            modelSelect.value = window.apiSettings[provider].model;
        }
        
        // Set additional settings if they exist
        if (window.apiSettings[provider]) {
            if (provider === "openai") {
                const tempSlider = document.getElementById("openai_temperature");
                const tempValue = document.getElementById("openai_temp_value");
                const maxTokensInput = document.getElementById("openai_max_tokens");
                
                if (tempSlider && window.apiSettings.openai.temperature) {
                    tempSlider.value = window.apiSettings.openai.temperature;
                    if (tempValue) tempValue.textContent = window.apiSettings.openai.temperature;
                }
                
                if (maxTokensInput && window.apiSettings.openai.maxTokens) {
                    maxTokensInput.value = window.apiSettings.openai.maxTokens;
                }
            } else if (provider === "anthropic") {
                const maxTokensInput = document.getElementById("anthropic_max_tokens");
                if (maxTokensInput && window.apiSettings.anthropic.maxTokens) {
                    maxTokensInput.value = window.apiSettings.anthropic.maxTokens;
                }
            }
        }
    });
}

function updateToolsUI() {
    const toolsList = document.getElementById('tools_list_container');
    if (!toolsList) return;
    
    // Clear existing tools
    toolsList.innerHTML = '';
    
    // Add tools to list
    window.tools.forEach(tool => {
        const toolElement = document.createElement('div');
        toolElement.className = 'profile-item';
        toolElement.innerHTML = `
            <div class="profile-item-header">
                <span class="profile-name">${tool.name}</span>
            </div>
            <div class="profile-item-description">${tool.description || 'No description'}</div>
            <div class="profile-item-actions">
                <button class="modal-button edit" onclick="editTool('${tool.id}')">EDIT</button>
                <button class="modal-button delete" onclick="deleteTool('${tool.id}')">DELETE</button>
            </div>
        `;
        toolsList.appendChild(toolElement);
    });
}

function editTool(toolId) {
    const tool = window.tools.find(t => t.id === toolId);
    if (!tool) return;
    
    document.getElementById('tool_id').value = tool.id;
    document.getElementById('tool_name').value = tool.name;
    document.getElementById('tool_description').value = tool.description || '';
    document.getElementById('tool_content').value = tool.content || '';
    
    document.getElementById('tool_editor_title').textContent = 'Edit Tool';
    document.getElementById('tool_delete_btn').style.display = 'inline-block';
    
    // Show tools modal
    document.getElementById('tools_management_modal').style.display = 'flex';
}

async function deleteTool(toolId) {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    
    try {
        const response = await fetch(`http://localhost:3001/api/tools/${toolId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove tool from local array
            window.tools = window.tools.filter(tool => tool.id !== toolId);
            // Update UI
            updateToolsUI();
            showToast('Tool deleted successfully', 'success');
        } else {
            const error = await response.json();
            showToast(`Error deleting tool: ${error.message}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting tool:', error);
        showToast('Error deleting tool', 'error');
    }
}

function createNewTool() {
    document.getElementById('tool_id').value = '';
    document.getElementById('tool_name').value = '';
    document.getElementById('tool_description').value = '';
    document.getElementById('tool_content').value = '';
    
    document.getElementById('tool_editor_title').textContent = 'Create New Tool';
    document.getElementById('tool_delete_btn').style.display = 'none';
    
    // Show tools modal
    document.getElementById('tools_management_modal').style.display = 'flex';
}

async function saveTool() {
    const toolId = document.getElementById('tool_id').value;
    const name = document.getElementById('tool_name').value;
    const description = document.getElementById('tool_description').value;
    const content = document.getElementById('tool_content').value;
    
    if (!name || !content) {
        showToast('Name and content are required', 'error');
        return;
    }
    
    try {
        const method = toolId ? 'PUT' : 'POST';
        const url = toolId ? 
            `http://localhost:3001/api/tools/${toolId}` : 
            'http://localhost:3001/api/tools';
            
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, content })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (toolId) {
                // Update existing tool
                const index = window.tools.findIndex(t => t.id === toolId);
                if (index !== -1) {
                    window.tools[index] = result.tool;
                }
            } else {
                // Add new tool
                window.tools.push(result.tool);
            }
            
            // Update UI
            updateToolsUI();
            
            // Close modal
            document.getElementById('tools_management_modal').style.display = 'none';
            
            showToast('Tool saved successfully', 'success');
        } else {
            const error = await response.json();
            showToast(`Error saving tool: ${error.message}`, 'error');
        }
    } catch (error) {
        console.error('Error saving tool:', error);
        showToast('Error saving tool', 'error');
    }
}