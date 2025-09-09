// eDEX Chatbot - Data Management Routes
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Database models
const { db } = require('../utils/database');

// Supabase integration
const { 
  supabase, 
  fetchChats, 
  saveChat, 
  getChatById, 
  deleteChat 
} = require('../utils/supabase');

// Export chat data with format support
router.get('/export/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId = 'default', format = 'json' } = req.query;
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      const chat = await getChatById(chatId, userId);
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Chat not found'
        });
      }
      
      // Prepare export data
      const exportData = {
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.created_at
        }))
      };
      
      if (format === 'json') {
        // Set appropriate headers for JSON export
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.json"`);
        
        // Send export data
        res.json({
          success: true,
          data: exportData
        });
      } else if (format === 'txt') {
        // Convert to plain text format
        let textContent = `Chat: ${exportData.title}\n`;
        textContent += `Created: ${new Date(exportData.createdAt).toLocaleString()}\n`;
        textContent += `Updated: ${new Date(exportData.updatedAt).toLocaleString()}\n\n`;
        
        exportData.messages.forEach(msg => {
          textContent += `[${msg.role.toUpperCase()}] ${new Date(msg.createdAt).toLocaleString()}\n`;
          textContent += `${msg.content}\n\n`;
        });
        
        // Set appropriate headers for text export
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.txt"`);
        
        // Send text content
        res.send(textContent);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Unsupported format. Supported formats: json, txt'
        });
      }
    } else {
      // Find chat with messages
      const chat = await db.Chat.findByPk(chatId, {
        where: { userId },
        include: [{
          model: db.Message,
          as: 'messages',
          order: [['createdAt', 'ASC']]
        }]
      });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Chat not found'
        });
      }
      
      // Prepare export data
      const exportData = {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          model: msg.model,
          provider: msg.provider,
          tokens: msg.tokens,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        }))
      };
      
      if (format === 'json') {
        // Set appropriate headers for JSON export
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.json"`);
        
        // Send export data
        res.json({
          success: true,
          data: exportData
        });
      } else if (format === 'txt') {
        // Convert to plain text format
        let textContent = `Chat: ${exportData.title}\n`;
        textContent += `Created: ${new Date(exportData.createdAt).toLocaleString()}\n`;
        textContent += `Updated: ${new Date(exportData.updatedAt).toLocaleString()}\n\n`;
        
        exportData.messages.forEach(msg => {
          textContent += `[${msg.role.toUpperCase()}] ${new Date(msg.createdAt).toLocaleString()}\n`;
          textContent += `${msg.content}\n\n`;
        });
        
        // Set appropriate headers for text export
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.txt"`);
        
        // Send text content
        res.send(textContent);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Unsupported format. Supported formats: json, txt'
        });
      }
    }
  } catch (error) {
    console.error('❌ Chat export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export chat data'
    });
  }
});

// Export all chats data with format support
router.get('/export-all', async (req, res) => {
  try {
    const { userId = 'default', format = 'json' } = req.query;
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      const chats = await fetchChats(userId);
      
      // Prepare export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        userId: userId,
        chats: chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.created_at,
          updatedAt: chat.updated_at,
          messages: chat.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at
          }))
        }))
      };
      
      if (format === 'json') {
        // Set appropriate headers for JSON export
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="all-chats-${userId}-${Date.now()}.json"`);
        
        // Send export data
        res.json({
          success: true,
          data: exportData
        });
      } else if (format === 'txt') {
        // Convert to plain text format
        let textContent = `All Chats Export\n`;
        textContent += `Exported: ${new Date().toISOString()}\n\n`;
        
        exportData.chats.forEach(chat => {
          textContent += `=== ${chat.title} ===\n`;
          textContent += `Created: ${new Date(chat.createdAt).toLocaleString()}\n`;
          textContent += `Updated: ${new Date(chat.updatedAt).toLocaleString()}\n\n`;
          
          chat.messages.forEach(msg => {
            textContent += `[${msg.role.toUpperCase()}] ${new Date(msg.createdAt).toLocaleString()}\n`;
            textContent += `${msg.content}\n\n`;
          });
          
          textContent += `--- End of ${chat.title} ---\n\n`;
        });
        
        // Set appropriate headers for text export
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="all-chats-${userId}-${Date.now()}.txt"`);
        
        // Send text content
        res.send(textContent);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Unsupported format. Supported formats: json, txt'
        });
      }
    } else {
      // Find all chats with messages
      const chats = await db.Chat.findAll({
        where: { userId },
        include: [{
          model: db.Message,
          as: 'messages',
          order: [['createdAt', 'ASC']]
        }],
        order: [['updatedAt', 'DESC']]
      });
      
      // Prepare export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        userId: userId,
        chats: chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messages: chat.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            model: msg.model,
            provider: msg.provider,
            tokens: msg.tokens,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
          }))
        }))
      };
      
      if (format === 'json') {
        // Set appropriate headers for JSON export
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="all-chats-${userId}-${Date.now()}.json"`);
        
        // Send export data
        res.json({
          success: true,
          data: exportData
        });
      } else if (format === 'txt') {
        // Convert to plain text format
        let textContent = `All Chats Export\n`;
        textContent += `Exported: ${new Date().toISOString()}\n\n`;
        
        exportData.chats.forEach(chat => {
          textContent += `=== ${chat.title} ===\n`;
          textContent += `Created: ${new Date(chat.createdAt).toLocaleString()}\n`;
          textContent += `Updated: ${new Date(chat.updatedAt).toLocaleString()}\n\n`;
          
          chat.messages.forEach(msg => {
            textContent += `[${msg.role.toUpperCase()}] ${new Date(msg.createdAt).toLocaleString()}\n`;
            textContent += `${msg.content}\n\n`;
          });
          
          textContent += `--- End of ${chat.title} ---\n\n`;
        });
        
        // Set appropriate headers for text export
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="all-chats-${userId}-${Date.now()}.txt"`);
        
        // Send text content
        res.send(textContent);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Unsupported format. Supported formats: json, txt'
        });
      }
    }
  } catch (error) {
    console.error('❌ All chats export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export all chats data'
    });
  }
});

// Import chat data
router.post('/import', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const { chatData } = req.body;
    
    // Validate import data
    if (!chatData || !chatData.title) {
      return res.status(400).json({
        success: false,
        error: 'Invalid chat data format'
      });
    }
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      // Create new chat from imported data
      const { data, error } = await supabase
        .from('chats')
        .insert({
          title: chatData.title,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      const chat = data[0];
      
      // Import messages if provided
      if (chatData.messages && Array.isArray(chatData.messages)) {
        const messagesToCreate = chatData.messages.map(msg => ({
          id: msg.id,
          chat_id: chat.id,
          role: msg.role,
          content: msg.content,
          created_at: msg.createdAt || new Date().toISOString()
        }));
        
        const { error: messagesError } = await supabase
          .from('messages')
          .insert(messagesToCreate);
        
        if (messagesError) {
          console.error('❌ Failed to import messages:', messagesError);
        }
      }
      
      res.json({
        success: true,
        chat: {
          id: chat.id,
          title: chat.title,
          createdAt: chat.created_at,
          updatedAt: chat.updated_at
        },
        message: 'Chat imported successfully'
      });
    } else {
      // Create new chat from imported data
      const chat = await db.Chat.create({
        title: chatData.title,
        userId: userId,
        meta: {
          importedAt: new Date().toISOString(),
          source: 'import'
        }
      });
      
      // Import messages if provided
      if (chatData.messages && Array.isArray(chatData.messages)) {
        const messagesToCreate = chatData.messages.map(msg => ({
          chatId: chat.id,
          role: msg.role,
          content: msg.content,
          model: msg.model,
          provider: msg.provider,
          tokens: msg.tokens,
          createdAt: msg.createdAt || new Date(),
          updatedAt: msg.updatedAt || new Date()
        }));
        
        await db.Message.bulkCreate(messagesToCreate);
      }
      
      res.json({
        success: true,
        chat: {
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        },
        message: 'Chat imported successfully'
      });
    }
  } catch (error) {
    console.error('❌ Chat import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import chat data'
    });
  }
});

// Search chats by content with filtering capabilities
router.get('/search', async (req, res) => {
  try {
    const { userId = 'default', query, limit = 20, dateFrom, dateTo, provider, model } = req.query;
    
    if (!query && !dateFrom && !dateTo && !provider && !model) {
      return res.status(400).json({
        success: false,
        error: 'At least one search parameter is required'
      });
    }
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      // Build Supabase query
      let supabaseQuery = supabase
        .from('chats')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          messages (id, content, provider, model, created_at)
        `)
        .eq('user_id', userId);
      
      // Add date filters
      if (dateFrom) {
        supabaseQuery = supabaseQuery.gte('created_at', new Date(dateFrom).toISOString());
      }
      
      if (dateTo) {
        supabaseQuery = supabaseQuery.lte('created_at', new Date(dateTo).toISOString());
      }
      
      // Add search query
      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,messages.content.ilike.%${query}%`);
      }
      
      // Add limit
      supabaseQuery = supabaseQuery.limit(parseInt(limit));
      
      const { data: chats, error } = await supabaseQuery;
      
      if (error) throw error;
      
      // Filter by provider and model if needed
      let filteredChats = chats;
      if (provider || model) {
        filteredChats = chats.filter(chat => {
          if (!chat.messages || chat.messages.length === 0) return false;
          
          return chat.messages.some(msg => {
            if (provider && msg.provider !== provider) return false;
            if (model && msg.model !== model) return false;
            return true;
          });
        });
      }
      
      // Format results
      const results = filteredChats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        matchingMessages: chat.messages ? chat.messages.length : 0
      }));
      
      res.json({
        success: true,
        results: results,
        total: results.length
      });
    } else {
      // Build Sequelize query conditions
      const whereConditions = { userId: userId };
      
      // Add date filters
      if (dateFrom || dateTo) {
        whereConditions.createdAt = {};
        if (dateFrom) {
          whereConditions.createdAt[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereConditions.createdAt[Op.lte] = new Date(dateTo);
        }
      }
      
      // Add search query to where conditions
      if (query) {
        whereConditions[Op.or] = [
          { title: { [Op.like]: `%${query}%` } }
        ];
      }
      
      // Build include conditions for messages
      const includeConditions = [{
        model: db.Message,
        as: 'messages',
        required: false
      }];
      
      // Add message search if query provided
      if (query) {
        includeConditions[0].where = {
          content: { [Op.like]: `%${query}%` }
        };
      }
      
      // Add provider/model filters to message include
      if (provider || model) {
        const messageWhere = {};
        if (provider) {
          messageWhere.provider = provider;
        }
        if (model) {
          messageWhere.model = model;
        }
        
        if (includeConditions[0].where) {
          includeConditions[0].where = {
            [Op.and]: [
              includeConditions[0].where,
              messageWhere
            ]
          };
        } else {
          includeConditions[0].where = messageWhere;
        }
      }
      
      // Search in chat titles and message content
      const chats = await db.Chat.findAll({
        where: whereConditions,
        include: includeConditions,
        order: [['updatedAt', 'DESC']],
        limit: parseInt(limit)
      });
      
      // Format results
      const results = chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        matchingMessages: chat.messages ? chat.messages.length : 0
      }));
      
      res.json({
        success: true,
        results: results,
        total: results.length
      });
    }
  } catch (error) {
    console.error('❌ Chat search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search chats'
    });
  }
});

// Bulk delete chats
router.delete('/bulk-delete', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const { chatIds } = req.body;
    
    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Chat IDs array is required'
      });
    }
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      // Delete messages for all chats
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('chat_id', chatIds);
      
      if (messagesError) throw messagesError;
      
      // Delete chats
      const { error: chatsError } = await supabase
        .from('chats')
        .delete()
        .in('id', chatIds)
        .eq('user_id', userId);
      
      if (chatsError) throw chatsError;
      
      res.json({
        success: true,
        message: `Successfully deleted chats`,
        deletedCount: chatIds.length
      });
    } else {
      // Delete messages for all chats
      await db.Message.destroy({
        where: {
          chatId: { [Op.in]: chatIds },
          '$chat.userId$': userId
        },
        include: [{ model: db.Chat, as: 'chat' }]
      });
      
      // Delete chats
      const deletedCount = await db.Chat.destroy({
        where: {
          id: { [Op.in]: chatIds },
          userId: userId
        }
      });
      
      res.json({
        success: true,
        message: `Successfully deleted ${deletedCount} chats`,
        deletedCount: deletedCount
      });
    }
  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chats'
    });
  }
});

// Bulk move chats to folder
router.post('/bulk-move', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const { chatIds, folderId } = req.body;
    
    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Chat IDs array is required'
      });
    }
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      // Update chats
      const { error } = await supabase
        .from('chats')
        .update({ folder_id: folderId || null, updated_at: new Date().toISOString() })
        .in('id', chatIds)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: `Successfully moved chats`,
        updatedCount: chatIds.length
      });
    } else {
      // Validate folder if provided
      if (folderId) {
        const folder = await db.Folder.findOne({
          where: { id: folderId, userId }
        });
        
        if (!folder) {
          return res.status(404).json({
            success: false,
            error: 'Folder not found'
          });
        }
      }
      
      // Update chats
      const [updatedCount] = await db.Chat.update(
        { folderId: folderId || null },
        {
          where: {
            id: { [Op.in]: chatIds },
            userId: userId
          }
        }
      );
      
      res.json({
        success: true,
        message: `Successfully moved ${updatedCount} chats`,
        updatedCount: updatedCount
      });
    }
  } catch (error) {
    console.error('❌ Bulk move error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move chats'
    });
  }
});

// Get chat statistics
router.get('/statistics', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    
    // Use Supabase if available, otherwise use SQLite
    if (supabase) {
      // Get total chats count
      const { count: totalChats, error: chatsError } = await supabase
        .from('chats')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      if (chatsError) throw chatsError;
      
      // Get total messages count
      const { count: totalMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      if (messagesError) throw messagesError;
      
      // For simplicity, we'll return basic stats with Supabase
      res.json({
        success: true,
        statistics: {
          totalChats: totalChats || 0,
          totalMessages: totalMessages || 0,
          recentChats: [],
          messagesByRole: []
        }
      });
    } else {
      // Get total chats count
      const totalChats = await db.Chat.count({ where: { userId } });
      
      // Get total messages count
      const totalMessages = await db.Message.count({
        include: [{
          model: db.Chat,
          as: 'chat',
          where: { userId }
        }]
      });
      
      // Get chats by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentChats = await db.Chat.findAll({
        where: {
          userId: userId,
          createdAt: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          [db.sequelize.fn('date', db.sequelize.col('createdAt')), 'date'],
          [db.sequelize.fn('count', db.sequelize.col('id')), 'count']
        ],
        group: [db.sequelize.fn('date', db.sequelize.col('createdAt'))],
        order: [[db.sequelize.fn('date', db.sequelize.col('createdAt')), 'ASC']]
      });
      
      // Get message counts by role
      const messagesByRole = await db.Message.findAll({
        attributes: [
          'role',
          [db.sequelize.fn('count', db.sequelize.col('id')), 'count']
        ],
        include: [{
          model: db.Chat,
          as: 'chat',
          where: { userId }
        }],
        group: ['role']
      });
      
      res.json({
        success: true,
        statistics: {
          totalChats: totalChats,
          totalMessages: totalMessages,
          recentChats: recentChats.map(item => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count)
          })),
          messagesByRole: messagesByRole.map(item => ({
            role: item.role,
            count: parseInt(item.dataValues.count)
          }))
        }
      });
    }
  } catch (error) {
    console.error('❌ Statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

module.exports = router;