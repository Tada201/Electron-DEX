// LM Studio Provider Test
const lmstudioProvider = require('../providers/lmstudio');

console.log('🧪 Testing LM Studio Provider');

// Test provider properties
console.log('Provider Name:', lmstudioProvider.name);
console.log('Display Name:', lmstudioProvider.displayName);
console.log('Base URL:', lmstudioProvider.baseUrl);
console.log('Requires API Key:', lmstudioProvider.requiresApiKey);

// Test isConfigured method
console.log('Is Configured:', lmstudioProvider.isConfigured());

// Test getAvailableModels method
console.log('Available Models:', lmstudioProvider.getAvailableModels());

// Test testConnection method
lmstudioProvider.testConnection()
  .then(result => {
    console.log('Connection Test Result:', result);
  })
  .catch(error => {
    console.error('Connection Test Error:', error.message);
  });

console.log('✅ LM Studio Provider test completed');