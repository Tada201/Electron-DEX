// eDEX Chatbot - Configuration Routes
const express = require('express');
const router = express.Router();

// Get available models for all providers
router.get('/models', async (req, res) => {
  try {
    const modelsConfig = {
      openai: [
        { id: 'gpt-4o', name: 'GPT-4o', contextLength: 128000, multimodal: true },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextLength: 128000, multimodal: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextLength: 128000, multimodal: true },
        { id: 'gpt-4', name: 'GPT-4', contextLength: 8192, multimodal: false },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextLength: 16385, multimodal: false },
      ],
      anthropic: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextLength: 200000, multimodal: true },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextLength: 200000, multimodal: true },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextLength: 200000, multimodal: true },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', contextLength: 200000, multimodal: true },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', contextLength: 200000, multimodal: true },
      ],
      google: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextLength: 2000000, multimodal: true },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextLength: 1000000, multimodal: true },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', contextLength: 30720, multimodal: false },
      ],
      mistral: [
        { id: 'mistral-large-latest', name: 'Mistral Large', contextLength: 128000, multimodal: false },
        { id: 'mistral-medium', name: 'Mistral Medium', contextLength: 32768, multimodal: false },
        { id: 'mistral-small', name: 'Mistral Small', contextLength: 32768, multimodal: false },
        { id: 'open-mistral-7b', name: 'Open Mistral 7B', contextLength: 32768, multimodal: false },
        { id: 'open-mixtral-8x7b', name: 'Open Mixtral 8x7B', contextLength: 32768, multimodal: false },
        { id: 'open-mixtral-8x22b', name: 'Open Mixtral 8x22B', contextLength: 65536, multimodal: false },
      ],
      groq: [
        { id: 'llama3-70b-8192', name: 'Llama 3 70B', contextLength: 8192, multimodal: false },
        { id: 'llama3-8b-8192', name: 'Llama 3 8B', contextLength: 8192, multimodal: false },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextLength: 32768, multimodal: false },
        { id: 'gemma-7b-it', name: 'Gemma 7B IT', contextLength: 8192, multimodal: false },
        { id: 'llama2-70b-4096', name: 'Llama 2 70B', contextLength: 4096, multimodal: false },
      ],
      xai: [
        { id: 'grok-beta', name: 'Grok Beta', contextLength: 131072, multimodal: false },
        { id: 'grok-2', name: 'Grok 2', contextLength: 131072, multimodal: false },
        { id: 'grok-2-mini', name: 'Grok 2 Mini', contextLength: 131072, multimodal: false },
      ]
    };

    res.json({
      success: true,
      models: modelsConfig,
      totalProviders: Object.keys(modelsConfig).length,
      totalModels: Object.values(modelsConfig).reduce((sum, models) => sum + models.length, 0)
    });
  } catch (error) {
    console.error('❌ Error getting models config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models configuration',
      message: error.message
    });
  }
});

// Get models for specific provider
router.get('/models/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const allModels = {
      openai: [
        { id: 'gpt-4o', name: 'GPT-4o', contextLength: 128000, multimodal: true },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextLength: 128000, multimodal: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextLength: 128000, multimodal: true },
        { id: 'gpt-4', name: 'GPT-4', contextLength: 8192, multimodal: false },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextLength: 16385, multimodal: false },
      ],
      anthropic: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextLength: 200000, multimodal: true },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextLength: 200000, multimodal: true },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextLength: 200000, multimodal: true },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', contextLength: 200000, multimodal: true },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', contextLength: 200000, multimodal: true },
      ],
      google: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextLength: 2000000, multimodal: true },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextLength: 1000000, multimodal: true },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', contextLength: 30720, multimodal: false },
      ],
      mistral: [
        { id: 'mistral-large-latest', name: 'Mistral Large', contextLength: 128000, multimodal: false },
        { id: 'mistral-medium', name: 'Mistral Medium', contextLength: 32768, multimodal: false },
        { id: 'mistral-small', name: 'Mistral Small', contextLength: 32768, multimodal: false },
        { id: 'open-mistral-7b', name: 'Open Mistral 7B', contextLength: 32768, multimodal: false },
        { id: 'open-mixtral-8x7b', name: 'Open Mixtral 8x7B', contextLength: 32768, multimodal: false },
        { id: 'open-mixtral-8x22b', name: 'Open Mixtral 8x22B', contextLength: 65536, multimodal: false },
      ],
      groq: [
        { id: 'llama3-70b-8192', name: 'Llama 3 70B', contextLength: 8192, multimodal: false },
        { id: 'llama3-8b-8192', name: 'Llama 3 8B', contextLength: 8192, multimodal: false },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextLength: 32768, multimodal: false },
        { id: 'gemma-7b-it', name: 'Gemma 7B IT', contextLength: 8192, multimodal: false },
        { id: 'llama2-70b-4096', name: 'Llama 2 70B', contextLength: 4096, multimodal: false },
      ],
      xai: [
        { id: 'grok-beta', name: 'Grok Beta', contextLength: 131072, multimodal: false },
        { id: 'grok-2', name: 'Grok 2', contextLength: 131072, multimodal: false },
        { id: 'grok-2-mini', name: 'Grok 2 Mini', contextLength: 131072, multimodal: false },
      ]
    };

    if (!allModels[providerId]) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
        message: `Provider '${providerId}' does not exist`,
        availableProviders: Object.keys(allModels)
      });
    }

    res.json({
      success: true,
      provider: providerId,
      models: allModels[providerId],
      count: allModels[providerId].length
    });
  } catch (error) {
    console.error(`❌ Error getting models for ${req.params.providerId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get provider models',
      message: error.message
    });
  }
});

// Get system configuration
router.get('/system', async (req, res) => {
  try {
    res.json({
      success: true,
      system: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        features: {
          rateLimiting: true,
          cors: true,
          helmet: true,
          multiProvider: true,
          configValidation: true
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting system config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system configuration',
      message: error.message
    });
  }
});

module.exports = router;