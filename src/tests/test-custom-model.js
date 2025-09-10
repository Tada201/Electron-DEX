// Test script for custom model input functionality

function testCustomModelInput() {
  console.log('🧪 Testing Custom Model Input Functionality');
  
  // Check if LM Studio custom model elements exist
  const modelSelect = document.getElementById('lmstudio_model_select');
  const customModelGroup = document.getElementById('lmstudio_custom_model_group');
  const customModelInput = document.getElementById('lmstudio_custom_model');
  
  if (modelSelect && customModelGroup && customModelInput) {
    console.log('✅ All custom model elements found');
    
    // Test the custom model selection functionality
    console.log('🔄 Testing custom model selection...');
    
    // Simulate selecting custom model option
    const customOption = Array.from(modelSelect.options).find(option => option.value === '__custom__');
    if (customOption) {
      modelSelect.value = '__custom__';
      const event = new Event('change', { bubbles: true });
      modelSelect.dispatchEvent(event);
      
      if (customModelGroup.style.display === 'block') {
        console.log('✅ Custom model group correctly shown when "__custom__" is selected');
      } else {
        console.log('❌ Custom model group not shown when "__custom__" is selected');
      }
      
      // Test entering a custom model
      customModelInput.value = 'liquid/lfm2-1.2b';
      console.log('📝 Custom model input value:', customModelInput.value);
      
      // Simulate selecting a standard model
      modelSelect.value = 'lmstudio-community/Meta-Llama-3-8B-Instruct';
      modelSelect.dispatchEvent(event);
      
      if (customModelGroup.style.display === 'none') {
        console.log('✅ Custom model group correctly hidden when standard model is selected');
      } else {
        console.log('❌ Custom model group not hidden when standard model is selected');
      }
    } else {
      console.log('❌ Custom model option ("__custom__") not found in select element');
    }
  } else {
    console.log('❌ Missing custom model elements:');
    if (!modelSelect) console.log('  - lmstudio_model_select');
    if (!customModelGroup) console.log('  - lmstudio_custom_model_group');
    if (!customModelInput) console.log('  - lmstudio_custom_model');
  }
  
  console.log('\n✅ Custom Model Input Test Completed');
}

// Run the test when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testCustomModelInput);
} else {
  testCustomModelInput();
}