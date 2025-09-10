// eDEX Chatbot - Provider Routes
const express = require('express');
const router = express.Router();

const openaiProvider = require('../providers/openai');
const anthropicProvider = require('../providers/anthropic');
const googleProvider = require('../providers/google');
const mistralProvider = require('../providers/mistral');
const groqProvider = require('../providers/groq');
const xaiProvider = require('../providers/xai');

// Provider map
const providers = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  mistral: mistralProvider,
  groq: groqProvider,
  xai: xaiProvider,
};

// Get list of available providers
router.get('/', async (req, res) => {
  try {
    const providerList = Object.keys(providers).map(key => {
      const provider = providers[key];
      return {
        id: key,
        name: provider.name,
        displayName: provider.displayName,
        description: provider.description,
        models: provider.getAvailableModels(),
        requiresApiKey: provider.requiresApiKey,
        status: provider.isConfigured() ? 'configured' : 'not_configured'
      };
    });

    res.json({
      success: true,
      providers: providerList,
      total: providerList.length
    });
  } catch (error) {
    console.error('❌ Error listing providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list providers',
      message: error.message
    });
  }
});

// Get specific provider details
router.get('/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    if (!providers[providerId]) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
        message: `Provider '${providerId}' does not exist`
      });
    }

    const provider = providers[providerId];
    
    res.json({
      success: true,
      provider: {
        id: providerId,
        name: provider.name,
        displayName: provider.displayName,
        description: provider.description,
        models: provider.getAvailableModels(),
        requiresApiKey: provider.requiresApiKey,
        status: provider.isConfigured() ? 'configured' : 'not_configured',
        baseUrl: provider.baseUrl,
        documentation: provider.documentationUrl
      }
    });
  } catch (error) {
    console.error(`❌ Error getting provider ${req.params.providerId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get provider details',
      message: error.message
    });
  }
});

// Test provider connection
router.post('/test', async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Missing provider',
        message: 'Provider name is required'
      });
    }

    if (!providers[provider]) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
        message: `Provider '${provider}' does not exist`
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing API key',
        message: 'API key is required for testing'
      });
    }

    console.log(`🧪 Testing connection to ${provider}`);

    // Test connection with provided API key
    const testResult = await providers[provider].testConnection(apiKey, model);

    if (testResult.success) {
      console.log(`✅ Connection test successful for ${provider}`);
      res.json({
        success: true,
        message: `Connection to ${provider} successful! ✅`,
        provider,
        model: model || 'default',
        responseTime: testResult.responseTime
      });
    } else {
      console.log(`❌ Connection test failed for ${provider}: ${testResult.error}`);
      res.status(400).json({
        success: false,
        error: 'Connection test failed',
        message: testResult.error || `Failed to connect to ${provider}`,
        provider
      });
    }

  } catch (error) {
    console.error('❌ Connection test error:', error);
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      message: error.message,
      provider: req.body.provider
    });
  }
});

module.exports = router;