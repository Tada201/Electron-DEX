// eDEX Chatbot - Tags Routes
const express = require('express');
const router = express.Router();

// Database models
const { db } = require('../utils/database');

// Get all tags for a user
router.get('/', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    const tags = await db.Tag.findAll({
      where: { userId },
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Tags retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tags'
    });
  }
});

// Create new tag
router.post('/', async (req, res) => {
  try {
    const { name, color = '#007bff', userId = 'default' } = req.body;
    
    // Validate input
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Tag name is required and must be a string'
      });
    }
    
    // Check if tag already exists
    const existingTag = await db.Tag.findOne({
      where: { 
        name: name.toLowerCase(),
        userId 
      }
    });
    
    if (existingTag) {
      return res.status(400).json({
        success: false,
        error: 'Tag already exists'
      });
    }
    
    // Create new tag
    const tag = await db.Tag.create({
      name: name.toLowerCase(),
      color,
      userId
    });
    
    res.json({
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Tag creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tag'
    });
  }
});

// Delete tag
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 'default' } = req.query;
    
    // Check if tag exists and belongs to user
    const tag = await db.Tag.findOne({
      where: { 
        id,
        userId 
      }
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    // Delete tag
    await tag.destroy();
    
    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('❌ Tag deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tag'
    });
  }
});

// Add tag to chat
router.post('/:chatId/tag/:tagId', async (req, res) => {
  try {
    const { chatId, tagId } = req.params;
    const { userId = 'default' } = req.query;
    
    // Check if chat exists and belongs to user
    const chat = await db.Chat.findOne({
      where: { 
        id: chatId,
        userId 
      }
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }
    
    // Check if tag exists and belongs to user
    const tag = await db.Tag.findOne({
      where: { 
        id: tagId,
        userId 
      }
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    // Add tag to chat (create association)
    await chat.addTag(tag);
    
    res.json({
      success: true,
      message: 'Tag added to chat successfully'
    });
  } catch (error) {
    console.error('❌ Tag addition error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add tag to chat'
    });
  }
});

// Remove tag from chat
router.delete('/:chatId/tag/:tagId', async (req, res) => {
  try {
    const { chatId, tagId } = req.params;
    const { userId = 'default' } = req.query;
    
    // Check if chat exists and belongs to user
    const chat = await db.Chat.findOne({
      where: { 
        id: chatId,
        userId 
      }
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }
    
    // Check if tag exists and belongs to user
    const tag = await db.Tag.findOne({
      where: { 
        id: tagId,
        userId 
      }
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    // Remove tag from chat (remove association)
    await chat.removeTag(tag);
    
    res.json({
      success: true,
      message: 'Tag removed from chat successfully'
    });
  } catch (error) {
    console.error('❌ Tag removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove tag from chat'
    });
  }
});

module.exports = router;