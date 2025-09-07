// eDEX Chatbot - Folders Routes
const express = require('express');
const router = express.Router();

// Database models
const { db } = require('../utils/database');

// Get all folders for a user
router.get('/', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    const folders = await db.Folder.findAll({
      where: { userId },
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      folders: folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        color: folder.color,
        createdAt: folder.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Folders retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve folders'
    });
  }
});

// Create new folder
router.post('/', async (req, res) => {
  try {
    const { name, parentId = null, color = '#007bff', userId = 'default' } = req.body;
    
    // Validate input
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required and must be a string'
      });
    }
    
    // Create new folder
    const folder = await db.Folder.create({
      name,
      parentId,
      color,
      userId
    });
    
    res.json({
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        color: folder.color,
        createdAt: folder.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Folder creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create folder'
    });
  }
});

// Update folder
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId = null, color, userId = 'default' } = req.body;
    
    // Check if folder exists and belongs to user
    const folder = await db.Folder.findOne({
      where: { 
        id,
        userId 
      }
    });
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }
    
    // Update folder
    const updates = {};
    if (name) updates.name = name;
    if (parentId !== undefined) updates.parentId = parentId;
    if (color) updates.color = color;
    
    await folder.update(updates);
    
    res.json({
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        color: folder.color,
        createdAt: folder.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Folder update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update folder'
    });
  }
});

// Delete folder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 'default' } = req.query;
    
    // Check if folder exists and belongs to user
    const folder = await db.Folder.findOne({
      where: { 
        id,
        userId 
      }
    });
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }
    
    // Delete folder and move all chats to root
    await db.Chat.update(
      { folderId: null },
      { where: { folderId: id } }
    );
    
    await folder.destroy();
    
    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('❌ Folder deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete folder'
    });
  }
});

// Move chat to folder
router.post('/:folderId/chat/:chatId', async (req, res) => {
  try {
    const { folderId, chatId } = req.params;
    const { userId = 'default' } = req.query;
    
    // Check if folder exists and belongs to user
    if (folderId !== 'null') {
      const folder = await db.Folder.findOne({
        where: { 
          id: folderId,
          userId 
        }
      });
      
      if (!folder) {
        return res.status(404).json({
          success: false,
          error: 'Folder not found'
        });
      }
    }
    
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
    
    // Move chat to folder
    await chat.update({ folderId: folderId === 'null' ? null : folderId });
    
    res.json({
      success: true,
      message: 'Chat moved to folder successfully'
    });
  } catch (error) {
    console.error('❌ Chat move error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move chat to folder'
    });
  }
});

module.exports = router;