/**
 * Simple test script to verify streaming functionality
 * Run with: node test-streaming.js
 */

const http = require('http');
const { spawn } = require('child_process');

console.log('🧪 Testing Streaming Functionality...\n');

// Test 1: Check if all providers support streaming
console.log('📋 Test 1: Provider Streaming Support');
const providers = [
  './backend/providers/openai',
  './backend/providers/anthropic',
  './backend/providers/google',
  './backend/providers/mistral',
  './backend/providers/groq',
  './backend/providers/xai'
];

let allProvidersSupportStreaming = true;

providers.forEach(providerPath => {
  try {
    const provider = require(providerPath);
    const supportsStreaming = provider.supportsStreaming && provider.supportsStreaming();
    const hasStreamMethod = typeof provider.streamMessage === 'function';
    
    console.log(`  ${provider.name || providerPath}: ${supportsStreaming ? '✅' : '❌'} Supports streaming, ${hasStreamMethod ? '✅' : '❌'} Has streamMessage method`);
    
    if (!supportsStreaming || !hasStreamMethod) {
      allProvidersSupportStreaming = false;
    }
  } catch (error) {
    console.log(`  ${providerPath}: ❌ Error loading provider - ${error.message}`);
    allProvidersSupportStreaming = false;
  }
});

console.log(`\n${allProvidersSupportStreaming ? '✅' : '❌'} All providers streaming test: ${allProvidersSupportStreaming ? 'PASSED' : 'FAILED'}\n`);

// Test 2: Check if settings include token rendering
console.log('📋 Test 2: Settings Token Rendering Toggle');
try {
  const fs = require('fs');
  const mainJs = fs.readFileSync('./src/main.js', 'utf8');
  
  const hasTokenRenderingSetting = mainJs.includes('token_rendering') || mainJs.includes('tokenRendering');
  const hasSettingsSave = mainJs.includes('tokenRendering');
  
  console.log(`  Token rendering toggle in settings: ${hasTokenRenderingSetting ? '✅' : '❌'}`);
  console.log(`  Token rendering saved in settings: ${hasSettingsSave ? '✅' : '❌'}`);
  
  console.log(`\n${(hasTokenRenderingSetting && hasSettingsSave) ? '✅' : '❌'} Settings token rendering test: ${(hasTokenRenderingSetting && hasSettingsSave) ? 'PASSED' : 'FAILED'}\n`);
} catch (error) {
  console.log(`  ❌ Error checking settings - ${error.message}\n`);
}

// Test 3: Check if frontend has streaming implementation
console.log('📋 Test 3: Frontend Streaming Implementation');
try {
  const fs = require('fs');
  const mainJs = fs.readFileSync('./src/main.js', 'utf8');
  
  const hasStreamMessageFunction = mainJs.includes('streamMessage') && mainJs.includes('EventSource');
  const hasStopButton = mainJs.includes('stop-button') || mainJs.includes('STOP');
  const hasErrorHandling = mainJs.includes('onerror') && mainJs.includes('error');
  
  console.log(`  Stream message function: ${hasStreamMessageFunction ? '✅' : '❌'}`);
  console.log(`  Stop button implementation: ${hasStopButton ? '✅' : '❌'}`);
  console.log(`  Error handling: ${hasErrorHandling ? '✅' : '❌'}`);
  
  console.log(`\n${(hasStreamMessageFunction && hasStopButton && hasErrorHandling) ? '✅' : '❌'} Frontend streaming test: ${(hasStreamMessageFunction && hasStopButton && hasErrorHandling) ? 'PASSED' : 'FAILED'}\n`);
} catch (error) {
  console.log(`  ❌ Error checking frontend - ${error.message}\n`);
}

// Test 4: Check if backend has streaming endpoint
console.log('📋 Test 4: Backend Streaming Endpoint');
try {
  const fs = require('fs');
  const chatRoutes = fs.readFileSync('./backend/routes/chat.js', 'utf8');
  
  const hasStreamEndpoint = chatRoutes.includes('/stream') && chatRoutes.includes('router.get');
  const hasSSEHeaders = chatRoutes.includes('text/event-stream');
  const hasErrorHandling = chatRoutes.includes('try') && chatRoutes.includes('catch');
  
  console.log(`  Stream endpoint: ${hasStreamEndpoint ? '✅' : '❌'}`);
  console.log(`  SSE headers: ${hasSSEHeaders ? '✅' : '❌'}`);
  console.log(`  Error handling: ${hasErrorHandling ? '✅' : '❌'}`);
  
  console.log(`\n${(hasStreamEndpoint && hasSSEHeaders && hasErrorHandling) ? '✅' : '❌'} Backend streaming test: ${(hasStreamEndpoint && hasSSEHeaders && hasErrorHandling) ? 'PASSED' : 'FAILED'}\n`);
} catch (error) {
  console.log(`  ❌ Error checking backend - ${error.message}\n`);
}

console.log('🏁 Streaming Functionality Tests Complete!');
console.log('\nTo run full Jest tests:');
console.log('  cd backend && npm test');
console.log('  cd src && npm test');