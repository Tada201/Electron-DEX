import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, MessageSquare, Palette, Bot, Terminal, ChevronRight, Zap, Clock, Monitor, Code, Database } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState({
    language: 'en',
    dateFormat: '24h',
    inputMode: 'text',
    typingIndicator: true,
    historyDays: 30,
    notifications: true,
    autoscroll: true,
    tokenRendering: true,
    markdownRendering: true,
    theme: 'dark',
    fontSize: 14,
    chatStyle: 'terminal',
    background: 'grid',
    model: 'gpt-4o-mini',
    responseStyle: 'balanced',
    temperature: 0.7,
    maxTokens: 2048,
    developerMode: false,
    debugLogs: false,
    shortcuts: {},
    experimental: false,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('edex-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('edex-settings', JSON.stringify(newSettings));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">SYSTEM CONFIGURATION</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">LANGUAGE</label>
            <select 
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="lmstudio-form-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
            <p className="lmstudio-description">Interface language preference for system components</p>
          </div>
          <div>
            <label className="lmstudio-form-label">DATE FORMAT</label>
            <select 
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="lmstudio-form-select"
            >
              <option value="24h">24-hour format</option>
              <option value="12h">12-hour format</option>
            </select>
            <p className="lmstudio-description">Time display format for system timestamps</p>
          </div>
        </div>
      </div>

      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">INPUT CONFIGURATION</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">INPUT MODE</label>
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => updateSetting('inputMode', 'text')}
                className={`lmstudio-button ${settings.inputMode === 'text' ? 'active' : ''}`}
              >
                TEXT
              </button>
              <button 
                onClick={() => updateSetting('inputMode', 'voice')}
                className={`lmstudio-button ${settings.inputMode === 'voice' ? 'active' : ''}`}
              >
                VOICE
              </button>
            </div>
            <p className="lmstudio-description">Primary input method for user interaction</p>
          </div>
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">TYPING INDICATOR</label>
            <div 
              onClick={() => updateSetting('typingIndicator', !settings.typingIndicator)}
              className={`lmstudio-toggle ${settings.typingIndicator ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">Display visual feedback during text composition</p>
        </div>
      </div>
    </div>
  );

  const renderChatSettings = () => (
    <div className="space-y-4">
      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">HISTORY MANAGEMENT</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">HISTORY RETENTION</label>
            <input 
              type="range" 
              min="1" 
              max="365" 
              value={settings.historyDays}
              onChange={(e) => updateSetting('historyDays', parseInt(e.target.value))}
              className="lmstudio-slider"
            />
            <p className="lmstudio-description">{settings.historyDays} days - Automatic cleanup threshold</p>
          </div>
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">AUTOSYNC HISTORY</label>
            <div 
              onClick={() => updateSetting('autoscroll', !settings.autoscroll)}
              className={`lmstudio-toggle ${settings.autoscroll ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">Automatically scroll to latest messages</p>
        </div>
      </div>

      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">NOTIFICATION SYSTEM</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">ENABLE NOTIFICATIONS</label>
            <div 
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`lmstudio-toggle ${settings.notifications ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">System alerts and message notifications</p>
          
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">TOKEN-BY-TOKEN RENDERING</label>
            <div 
              onClick={() => updateSetting('tokenRendering', !settings.tokenRendering)}
              className={`lmstudio-toggle ${settings.tokenRendering ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">Display content as it's generated</p>
          
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">MARKDOWN RENDERING</label>
            <div 
              onClick={() => updateSetting('markdownRendering', !settings.markdownRendering)}
              className={`lmstudio-toggle ${settings.markdownRendering ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">Parse and format markdown content</p>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-4">
      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">THEME CONFIGURATION</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">INTERFACE THEME</label>
            <select 
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="lmstudio-form-select"
            >
              <option value="dark">DARK MODE</option>
              <option value="light">LIGHT MODE</option>
              <option value="system">SYSTEM DEFAULT</option>
            </select>
            <p className="lmstudio-description">Color scheme for the entire interface</p>
          </div>
          <div>
            <label className="lmstudio-form-label">FONT SIZE</label>
            <input 
              type="range" 
              min="10" 
              max="20" 
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="lmstudio-slider"
            />
            <p className="lmstudio-description">{settings.fontSize}px - Text scaling factor</p>
          </div>
          <div>
            <label className="lmstudio-form-label">CHAT BUBBLE STYLE</label>
            <select 
              value={settings.chatStyle}
              onChange={(e) => updateSetting('chatStyle', e.target.value)}
              className="lmstudio-form-select"
            >
              <option value="terminal">TERMINAL</option>
              <option value="modern">MODERN</option>
            </select>
            <p className="lmstudio-description">Visual presentation of chat messages</p>
          </div>
        </div>
      </div>

      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">BACKGROUND CONFIGURATION</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">BACKGROUND STYLE</label>
            <select 
              value={settings.background}
              onChange={(e) => updateSetting('background', e.target.value)}
              className="lmstudio-form-select"
            >
              <option value="grid">GRID PATTERN</option>
              <option value="solid">SOLID COLOR</option>
              <option value="gradient">GRADIENT</option>
              <option value="custom">CUSTOM WALLPAPER</option>
            </select>
            <p className="lmstudio-description">Desktop background appearance</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBehaviorSettings = () => (
    <div className="space-y-4">
      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">MODEL SELECTION</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">AI MODEL</label>
            <select 
              value={settings.model}
              onChange={(e) => updateSetting('model', e.target.value)}
              className="lmstudio-form-select"
            >
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="llama3-70b-8192">Llama 3 70B</option>
            </select>
            <p className="lmstudio-description">Primary AI model for generating responses</p>
          </div>
        </div>
      </div>

      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">RESPONSE CONFIGURATION</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">RESPONSE STYLE</label>
            <select 
              value={settings.responseStyle}
              onChange={(e) => updateSetting('responseStyle', e.target.value)}
              className="lmstudio-form-select"
            >
              <option value="concise">CONCISE</option>
              <option value="detailed">DETAILED</option>
              <option value="balanced">BALANCED</option>
            </select>
            <p className="lmstudio-description">AI response verbosity and detail level</p>
          </div>
          <div>
            <label className="lmstudio-form-label">CREATIVITY LEVEL</label>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
              className="lmstudio-slider"
            />
            <p className="lmstudio-description">Temperature: {settings.temperature} - Response randomness</p>
          </div>
          <div>
            <label className="lmstudio-form-label">MAX RESPONSE LENGTH</label>
            <input 
              type="number" 
              min="100" 
              max="32000" 
              value={settings.maxTokens}
              onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
              className="lmstudio-form-input"
            />
            <p className="lmstudio-description">Maximum tokens per response: {settings.maxTokens}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-4">
      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">DEVELOPER OPTIONS</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">DEVELOPER MODE</label>
            <div 
              onClick={() => updateSetting('developerMode', !settings.developerMode)}
              className={`lmstudio-toggle ${settings.developerMode ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">Enable advanced features and debugging tools</p>
          
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">DEBUG LOGGING</label>
            <div 
              onClick={() => updateSetting('debugLogs', !settings.debugLogs)}
              className={`lmstudio-toggle ${settings.debugLogs ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">Generate detailed system logs for troubleshooting</p>
        </div>
      </div>

      <div className="lmstudio-settings-group">
        <h4 className="lmstudio-group-title">SYSTEM CONFIGURATION</h4>
        <div className="space-y-3">
          <div>
            <label className="lmstudio-form-label">SHORTCUT KEY CONFIG</label>
            <button className="lmstudio-button">
              CONFIGURE SHORTCUTS
            </button>
            <p className="lmstudio-description">Customize keyboard bindings and hotkeys</p>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="lmstudio-form-label">EXPERIMENTAL FEATURES</label>
            <div 
              onClick={() => updateSetting('experimental', !settings.experimental)}
              className={`lmstudio-toggle ${settings.experimental ? 'active' : ''}`}
            >
              <div className="lmstudio-toggle-slider" />
            </div>
          </div>
          <p className="lmstudio-description">Enable beta features and experimental functionality</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'general': return renderGeneralSettings();
      case 'chat': return renderChatSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'behavior': return renderBehaviorSettings();
      case 'advanced': return renderAdvancedSettings();
      default: return renderGeneralSettings();
    }
  };

  const categories = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'chat', name: 'Chat Experience', icon: MessageSquare },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'behavior', name: 'AI Behavior', icon: Bot },
    { id: 'advanced', name: 'Advanced', icon: Terminal },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lmstudio-modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="lmstudio-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grid Background */}
            <div className="lmstudio-grid-bg" />
            
            {/* Header */}
            <div className="lmstudio-header">
              <div>
                <h2 className="lmstudio-title">SYSTEM CONFIGURATION</h2>
                <p className="lmstudio-subtitle">LM Studio Interface Settings</p>
              </div>
              <button
                onClick={onClose}
                className="lmstudio-close-btn"
              >
                ✕
              </button>
            </div>

            {/* Body - Split Panel Layout */}
            <div className="lmstudio-body">
              {/* Left Navigation Rail */}
              <div className="lmstudio-nav-rail">
                <h3 className="lmstudio-nav-header">NAVIGATION</h3>
                <nav className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`lmstudio-nav-item ${activeCategory === category.id ? 'active' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="lmstudio-nav-icon" />
                        <span>{category.name}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              {/* Right Content Panel */}
              <div className="lmstudio-content-panel">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="lmstudio-section-header">
                      {categories.find(c => c.id === activeCategory)?.name.toUpperCase()}
                    </h2>
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;