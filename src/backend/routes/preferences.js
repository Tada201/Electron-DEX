// eDEX Chatbot - Preference Routes
const express = require('express');
const router = express.Router();

// Database models
const { db } = require('../utils/database');

// Get all preferences for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const preferences = await db.Preference.findAll({
      where: { userId },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
    
    res.json({
      success: true,
      preferences: preferences.map(preference => preference.toJSON())
    });
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences',
      message: error.message
    });
  }
});

// Get preference by user ID and key
router.get('/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    
    const preference = await db.Preference.findOne({
      where: { userId, key }
    });
    
    if (!preference) {
      return res.status(404).json({
        success: false,
        error: 'Preference not found',
        message: 'Preference with specified user ID and key does not exist'
      });
    }
    
    res.json({
      success: true,
      preference: preference.toJSON()
    });
  } catch (error) {
    console.error('❌ Error fetching preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preference',
      message: error.message
    });
  }
});

// Create or update preference
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      key,
      value,
      category
    } = req.body;
    
    // Validate required fields
    if (!userId || !key) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'User ID and key are required'
      });
    }
    
    // Check if preference already exists
    const existingPreference = await db.Preference.findOne({
      where: { userId, key }
    });
    
    let preference;
    if (existingPreference) {
      // Update existing preference
      preference = await existingPreference.update({
        value: value !== undefined ? value : existingPreference.value,
        category: category || existingPreference.category
      });
    } else {
      // Create new preference
      preference = await db.Preference.create({
        userId,
        key,
        value: value !== undefined ? value : null,
        category: category || 'general'
      });
    }
    
    res.status(201).json({
      success: true,
      message: existingPreference ? 'Preference updated successfully' : 'Preference created successfully',
      preference: preference.toJSON()
    });
  } catch (error) {
    console.error('❌ Error creating/updating preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update preference',
      message: error.message
    });
  }
});

// Update preference
router.put('/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const { value, category } = req.body;
    
    // Find preference
    const preference = await db.Preference.findOne({
      where: { userId, key }
    });
    
    if (!preference) {
      return res.status(404).json({
        success: false,
        error: 'Preference not found',
        message: 'Preference with specified user ID and key does not exist'
      });
    }
    
    // Update preference
    await preference.update({
      value: value !== undefined ? value : preference.value,
      category: category || preference.category
    });
    
    res.json({
      success: true,
      message: 'Preference updated successfully',
      preference: preference.toJSON()
    });
  } catch (error) {
    console.error('❌ Error updating preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preference',
      message: error.message
    });
  }
});

// Delete preference
router.delete('/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    
    // Find preference
    const preference = await db.Preference.findOne({
      where: { userId, key }
    });
    
    if (!preference) {
      return res.status(404).json({
        success: false,
        error: 'Preference not found',
        message: 'Preference with specified user ID and key does not exist'
      });
    }
    
    // Delete preference
    await preference.destroy();
    
    res.json({
      success: true,
      message: 'Preference deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete preference',
      message: error.message
    });
  }
});

// Get preferences by category
router.get('/:userId/category/:category', async (req, res) => {
  try {
    const { userId, category } = req.params;
    
    const preferences = await db.Preference.findAll({
      where: { userId, category },
      order: [['key', 'ASC']]
    });
    
    res.json({
      success: true,
      preferences: preferences.map(preference => preference.toJSON())
    });
  } catch (error) {
    console.error('❌ Error fetching preferences by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences by category',
      message: error.message
    });
  }
});

// Bulk update preferences
router.put('/:userId/bulk', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body; // Array of { key, value, category } objects
    
    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format',
        message: 'Preferences must be an array of objects with key and value properties'
      });
    }
    
    // Process each preference
    const results = [];
    for (const pref of preferences) {
      const { key, value, category } = pref;
      
      if (!key) {
        continue; // Skip invalid preferences
      }
      
      // Check if preference already exists
      const existingPreference = await db.Preference.findOne({
        where: { userId, key }
      });
      
      let preference;
      if (existingPreference) {
        // Update existing preference
        preference = await existingPreference.update({
          value: value !== undefined ? value : existingPreference.value,
          category: category || existingPreference.category
        });
      } else {
        // Create new preference
        preference = await db.Preference.create({
          userId,
          key,
          value: value !== undefined ? value : null,
          category: category || 'general'
        });
      }
      
      results.push(preference.toJSON());
    }
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: results
    });
  } catch (error) {
    console.error('❌ Error bulk updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update preferences',
      message: error.message
    });
  }
});

module.exports = router;