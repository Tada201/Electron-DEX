// Test script for LM Studio UI integration

// Test that the LM Studio tab exists
function testLMStudioUITab() {
  console.log('🧪 Testing LM Studio UI Integration');
  
  // Check if LM Studio tab exists
  const lmstudioTab = document.querySelector('.provider-tab[data-provider="lmstudio"]');
  if (lmstudioTab) {
    console.log('✅ LM Studio tab found in UI');
    console.log('  Tab text:', lmstudioTab.textContent.trim());
  } else {
    console.log('❌ LM Studio tab not found in UI');
  }
  
  // Check if LM Studio config panel exists
  const lmstudioPanel = document.querySelector('.config-panel[data-provider="lmstudio"]');
  if (lmstudioPanel) {
    console.log('✅ LM Studio config panel found in UI');
    
    // Check for key elements
    const apiKeyInput = lmstudioPanel.querySelector('#lmstudio_api_key');
    const baseUrlInput = lmstudioPanel.querySelector('#lmstudio_base_url');
    const modelSelect = lmstudioPanel.querySelector('#lmstudio_model');
    
    if (apiKeyInput) console.log('  ✅ API key input found');
    if (baseUrlInput) console.log('  ✅ Base URL input found');
    if (modelSelect) console.log('  ✅ Model select found');
  } else {
    console.log('❌ LM Studio config panel not found in UI');
  }
  
  console.log('\n✅ LM Studio UI Integration Test Completed');
}

// Run the test when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testLMStudioUITab);
} else {
  testLMStudioUITab();
}