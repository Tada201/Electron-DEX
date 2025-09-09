// src/renderer/profile.js - Profile management
import { showToast } from './utils.js';

export async function loadDefaultProfile() {
    try {
        const response = await fetch('http://localhost:3001/api/profiles');
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                // Find the default profile
                const defaultProfile = result.profiles.find(profile => profile.isDefault);
                
                if (defaultProfile) {
                    // Apply default profile settings
                    applyProfileSettings(defaultProfile);
                    // Update persona selector to show the default profile (removed persona selector)
                    /*
                    const personaSelector = document.getElementById("persona_selector");
                    if (personaSelector) {
                        personaSelector.value = defaultProfile.id;
                    }
                    */
                }
            } else {
                console.warn('Backend returned unsuccessful response:', result);
                applyDefaultProfileSettings();
            }
        } else if (response.status === 500) {
            console.error('Backend server error (500) when loading profiles');
            applyDefaultProfileSettings();
        } else if (response.status === 503) {
            console.error('Service unavailable when loading profiles');
            applyDefaultProfileSettings();
        } else {
            console.error('Unexpected response status:', response.status);
            applyDefaultProfileSettings();
        }
    } catch (error) {
        console.error('Failed to load default profile:', error);
        // Apply default settings if there's an error
        applyDefaultProfileSettings();
    }
}

// Load profile settings and apply them to the chat component
async function loadProfileSettings(profileId) {
    try {
        const response = await fetch(`http://localhost:3001/api/profiles/${profileId}`);
        const result = await response.json();
        
        if (result.success) {
            const profile = result.profile;
            applyProfileSettings(profile);
        }
    } catch (error) {
        console.error('Failed to load profile settings:', error);
        showToast("Failed to load profile settings", "error");
    }
}

// Apply profile settings to the chat component
export function applyProfileSettings(profile) {
    // Update model selector
    const modelSelector = document.getElementById("model_selector");
    if (modelSelector && profile.model) {
        modelSelector.value = profile.model;
    }
    
    // Update provider and model in chat component
    if (window.chat) {
        window.chat.setProvider(profile.provider, profile.model);
        
        // Apply profile-specific settings
        window.chat.setProfileSettings({
            temperature: profile.temperature,
            maxTokens: profile.maxTokens,
            systemPrompt: profile.systemPrompt
        });
    }
    
    // Update avatar if available
    updateProfileAvatar(profile.avatar);
    
    console.log("Applied profile settings:", profile);
    try {
        console.log("About to call showToast with message:", `Applied settings for profile: ${profile.name}`, "type:", "success");
        showToast(`Applied settings for profile: ${profile.name}`, "success");
        console.log("showToast call succeeded");
    } catch (error) {
        console.error("showToast failed:", error);
    }
}

// Apply default profile settings
export function applyDefaultProfileSettings() {
    // Reset to default model
    const modelSelector = document.getElementById("model_selector");
    if (modelSelector) {
        modelSelector.value = "gpt-4o-mini";
    }
    
    // Reset provider and model in chat component
    if (window.chat) {
        window.chat.currentProvider = "openai";
        window.chat.currentModel = "gpt-4o-mini";
    }
    
    // Reset avatar to default
    updateProfileAvatar(null);
    
    console.log("Applied default profile settings");
    try {
        console.log("About to call showToast with message:", "Applied default profile settings", "type:", "success");
        showToast("Applied default profile settings", "success");
        console.log("showToast call succeeded");
    } catch (error) {
        console.error("showToast failed:", error);
    }
}

// Update profile avatar in UI
function updateProfileAvatar(avatar) {
    // For now, we'll just update a placeholder element
    // In a full implementation, we would update the UI with the avatar
    const avatarDisplay = document.getElementById("profile_avatar_display");
    if (avatarDisplay) {
        if (avatar) {
            avatarDisplay.textContent = avatar;
        } else {
            avatarDisplay.textContent = "👤"; // Default avatar
        }
    }
    console.log("Profile avatar:", avatar);
}

// Set a profile as default
export async function setDefaultProfile(profileId) {
    try {
        const response = await fetch(`http://localhost:3001/api/profiles/${profileId}/default`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log("Default profile set successfully");
            // Update the persona selector to show this profile as selected
            const personaSelector = document.getElementById("persona_selector");
            if (personaSelector) {
                personaSelector.value = profileId;
            }
            // Apply the default profile settings
            applyProfileSettings(result.profile);
        } else {
            showToast(result.message || "Failed to set default profile", "error");
        }
    } catch (error) {
        console.error('Failed to set default profile:', error);
        showToast("Failed to set default profile", "error");
    }
}

// Load profiles
export async function loadProfiles() {
    try {
        const response = await fetch('http://localhost:3001/api/profiles');
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                /*
                // Update persona selector dropdown
                const personaSelector = document.getElementById("persona_selector");
                if (personaSelector) {
                    // Clear existing options
                    personaSelector.innerHTML = '';
                    
                    // Add default option
                    const defaultOption = document.createElement("option");
                    defaultOption.value = "default";
                    defaultOption.textContent = "DEFAULT";
                    personaSelector.appendChild(defaultOption);
                    
                    // Add profiles
                    result.profiles.forEach(profile => {
                        const option = document.createElement("option");
                        option.value = profile.id;
                        option.textContent = profile.name;
                        personaSelector.appendChild(option);
                    });
                }
                */
                
                // Update profile list in management modal
                updateProfileList(result.profiles);
            } else {
                showToast(result.message || "Failed to load profiles", "error");
            }
        } else if (response.status === 500) {
            console.error('Backend server error (500) when loading profiles');
            showToast("Backend server error. Please try again later.", "error");
        } else if (response.status === 503) {
            console.error('Service unavailable when loading profiles');
            showToast("Service temporarily unavailable. Database is initializing.", "error");
        } else {
            console.error('Unexpected response status:', response.status);
            showToast("Failed to load profiles", "error");
        }
    } catch (error) {
        console.error('Failed to load profiles:', error);
        showToast("Failed to load profiles", "error");
    }
}

function updateProfileList(profiles) {
    const profileList = document.getElementById("profile_list");
    if (!profileList) return;
    
    profileList.innerHTML = '';
    
    profiles.forEach(profile => {
        const profileItem = document.createElement("div");
        profileItem.className = "profile-item";
        profileItem.dataset.profileId = profile.id;
        
        profileItem.innerHTML = `
            <div class="profile-item-header">
                <span class="profile-name">${profile.name}</span>
                ${profile.isDefault ? '<span class="profile-default-tag">DEFAULT</span>' : ''}
            </div>
            <div class="profile-item-description">${profile.description || 'No description'}</div>
            <div class="profile-item-actions">
                <button class="profile-edit-btn neon_button" data-profile-id="${profile.id}">EDIT</button>
                ${profile.isDefault ? '' : `<button class="profile-delete-btn neon_button" data-profile-id="${profile.id}">DELETE</button>`}
                ${profile.isDefault ? '' : `<button class="profile-set-default-btn neon_button" data-profile-id="${profile.id}">SET AS DEFAULT</button>`}
            </div>
        `;
        
        profileList.appendChild(profileItem);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".profile-edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const profileId = e.target.dataset.profileId;
            editProfile(profileId);
        });
    });
    
    document.querySelectorAll(".profile-delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const profileId = e.target.dataset.profileId;
            deleteProfile(profileId);
        });
    });
    
    // Add event listeners to set default buttons
    document.querySelectorAll(".profile-set-default-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const profileId = e.target.dataset.profileId;
            await setDefaultProfile(profileId);
            // Reload profiles to update the UI
            loadProfiles();
        });
    });
}

async function editProfile(profileId) {
    try {
        const response = await fetch(`http://localhost:3001/api/profiles/${profileId}`);
        const result = await response.json();
        
        if (result.success) {
            const profile = result.profile;
            
            // Populate form fields
            document.getElementById("profile_id").value = profile.id;
            document.getElementById("profile_name").value = profile.name;
            document.getElementById("profile_description").value = profile.description || '';
            document.getElementById("profile_personality").value = profile.personality || '';
            document.getElementById("profile_system_prompt").value = profile.systemPrompt || '';
            document.getElementById("profile_avatar").value = profile.avatar || '';
            document.getElementById("profile_provider").value = profile.provider;
            document.getElementById("profile_model").value = profile.model;
            document.getElementById("profile_temperature").value = profile.temperature;
            document.getElementById("profile_temp_value").textContent = profile.temperature;
            document.getElementById("profile_max_tokens").value = profile.maxTokens;
            document.getElementById("profile_is_default").checked = profile.isDefault;
            
            // Update avatar preview
            updateAvatarPreview();
            
            // Show delete button
            document.getElementById("profile_delete_btn").style.display = "inline-block";
            
            // Update title
            document.getElementById("profile_editor_title").textContent = "Edit Profile";
            
            // Show modal
            document.getElementById("profile_management_modal").style.display = "flex";
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        showToast("Failed to load profile", "error");
    }
}

function updateAvatarPreview() {
    const avatarInput = document.getElementById("profile_avatar");
    const avatarPreviewContainer = document.getElementById("avatar_preview_container");
    const avatarPreview = document.getElementById("avatar_preview");
    
    if (!avatarInput || !avatarPreviewContainer || !avatarPreview) return;
    
    const value = avatarInput.value.trim();
    
    if (!value) {
        avatarPreviewContainer.style.display = "none";
        return;
    }
    
    avatarPreviewContainer.style.display = "block";
    
    // Check if it's a URL (image)
    if (value.startsWith('http') && (value.includes('.png') || value.includes('.jpg') || value.includes('.jpeg') || value.includes('.gif') || value.includes('.webp'))) {
        avatarPreview.innerHTML = `<img src="${value}" alt="Avatar">`;
    } else {
        // Treat as text/emoji
        avatarPreview.textContent = value;
    }
}

function deleteProfile(profileId) {
    // Implementation would go here
    console.log("Delete profile:", profileId);
}