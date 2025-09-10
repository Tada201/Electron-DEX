// Test script for LM Studio integration
const express = require('express');
const axios = require('axios');

// Test the LM Studio provider
const lmstudioProvider = require('../providers/lmstudio');

async function testLMStudio() {
  console.log('🧪 Testing LM Studio Integration');
  
  // Test provider properties
  console.log('\n📋 Provider Information:');
  console.log('  Name:', lmstudioProvider.name);
  console.log('  Display Name:', lmstudioProvider.displayName);
  console.log('  Base URL:', lmstudioProvider.baseUrl);
  console.log('  Requires API Key:', lmstudioProvider.requiresApiKey);
  
  // Test configuration
  console.log('\n⚙️  Configuration Status:');
  console.log('  Configured:', lmstudioProvider.isConfigured());
  
  // Test available models
  console.log('\n🤖 Available Models:');
  const models = lmstudioProvider.getAvailableModels();
  models.forEach(model => {
    console.log(`  - ${model.name} (${model.id})`);
  });
  
  // Test connection (this will fail if LM Studio is not running)
  console.log('\n🔌 Connection Test:');
  try {
    const testResult = await lmstudioProvider.testConnection();
    console.log('  Success:', testResult.success);
    console.log('  Response Time:', testResult.responseTime, 'ms');
    if (testResult.error) {
      console.log('  Error:', testResult.error);
    }
  } catch (error) {
    console.log('  Error:', error.message);
  }
  
  console.log('\n✅ LM Studio Integration Test Completed');
}

// Run the test
testLMStudio().catch(console.error);