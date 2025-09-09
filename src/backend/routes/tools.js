// eDEX Chatbot - Tools Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Database models
const { db } = require('../utils/database');

// Get all tools
router.get('/', async (req, res) => {
  try {
    // Check if database models are available
    if (!db.Tool) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Database models not initialized. Please try again later.'
      });
    }
    
    const tools = await db.Tool.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      tools: tools.map(tool => tool.toJSON())
    });
  } catch (error) {
    console.error('❌ Error fetching tools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tools',
      message: error.message
    });
  }
});

// Get tool by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tool = await db.Tool.findByPk(id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found',
        message: 'Tool with specified ID does not exist'
      });
    }
    
    res.json({
      success: true,
      tool: tool.toJSON()
    });
  } catch (error) {
    console.error('❌ Error fetching tool:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tool',
      message: error.message
    });
  }
});

// Create new tool
router.post('/', async (req, res) => {
  try {
    const { name, description, content, userId = 'default' } = req.body;
    
    // Validate input
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Tool name is required and must be a string'
      });
    }
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Tool content is required and must be a string'
      });
    }
    
    // Create new tool
    const tool = await db.Tool.create({
      name,
      description: description || '',
      content,
      userId,
      meta: {
        createdAt: new Date().toISOString()
      }
    });
    
    res.json({
      success: true,
      tool: tool.toJSON()
    });
  } catch (error) {
    console.error('❌ Tool creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tool',
      message: error.message
    });
  }
});

// Update tool
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content } = req.body;
    
    const tool = await db.Tool.findByPk(id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    // Update tool
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (content !== undefined) updates.content = content;
    
    const [updated] = await db.Tool.update(updates, {
      where: { id }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    const updatedTool = await db.Tool.findByPk(id);
    
    res.json({
      success: true,
      tool: updatedTool.toJSON()
    });
  } catch (error) {
    console.error('❌ Tool update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tool',
      message: error.message
    });
  }
});

// Delete tool
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db.Tool.destroy({
      where: { id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Tool deleted successfully'
    });
  } catch (error) {
    console.error('❌ Tool deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tool',
      message: error.message
    });
  }
});

// Execute tool
router.post('/execute/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { parameters = {} } = req.body;
    
    const tool = await db.Tool.findByPk(id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    // Here we would normally execute the tool's code
    // For now, we'll simulate execution with a simple response
    const result = {
      toolId: id,
      toolName: tool.name,
      parameters,
      result: `Executed tool "${tool.name}" with parameters: ${JSON.stringify(parameters)}`,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('❌ Tool execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute tool',
      message: error.message
    });
  }
});

module.exports = router;