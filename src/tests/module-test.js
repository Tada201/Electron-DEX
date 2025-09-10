// Test file to verify module imports are working correctly
console.log('Module test started');

// Test importing chatbot class
import('../classes/chatbot.class.js')
  .then(() => {
    console.log('✅ Chatbot class imported successfully');
  })
  .catch(error => {
    console.error('❌ Error importing Chatbot class:', error);
  });

// Test importing lmstudio service
import('../services/lmstudioService.js')
  .then(() => {
    console.log('✅ LM Studio service imported successfully');
  })
  .catch(error => {
    console.error('❌ Error importing LM Studio service:', error);
  });

// Test importing markdown renderer
import('../utils/markdown.js')
  .then(() => {
    console.log('✅ Markdown renderer imported successfully');
  })
  .catch(error => {
    console.error('❌ Error importing Markdown renderer:', error);
  });

console.log('Module test completed');