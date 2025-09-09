// eDEX Chatbot - Profile Routes
const express = require('express');
const router = express.Router();

// Database models
const { db } = require('../utils/database');

// Get all profiles
router.get('/', async (req, res) => {
  try {
    // Check if database models are available
    if (!db.Profile) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Database models not initialized. Please try again later.'
      });
    }
    
    const profiles = await db.Profile.findAll({
      order: [['isDefault', 'DESC'], ['name', 'ASC']]
    });
    
    res.json({
      success: true,
      profiles: profiles.map(profile => profile.toJSON())
    });
  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profiles',
      message: error.message
    });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await db.Profile.findByPk(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        message: 'Profile with specified ID does not exist'
      });
    }
    
    res.json({
      success: true,
      profile: profile.toJSON()
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Create new profile
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      personality,
      systemPrompt,
      avatar,
      provider,
      model,
      temperature,
      maxTokens,
      userId,
      isDefault
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: 'Profile name is required'
      });
    }
    
    // If setting as default, unset current default profile
    if (isDefault) {
      await db.Profile.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }
    
    // Create new profile
    const profile = await db.Profile.create({
      name,
      description: description || '',
      personality: personality || '',
      systemPrompt: systemPrompt || '',
      avatar: avatar || '',
      provider: provider || 'openai',
      model: model || 'gpt-4o-mini',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 2048,
      userId: userId || 'default',
      isDefault: isDefault || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile: profile.toJSON()
    });
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create profile',
      message: error.message
    });
  }
});

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      personality,
      systemPrompt,
      avatar,
      provider,
      model,
      temperature,
      maxTokens,
      userId,
      isDefault
    } = req.body;
    
    // Find profile
    const profile = await db.Profile.findByPk(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        message: 'Profile with specified ID does not exist'
      });
    }
    
    // If setting as default, unset current default profile
    if (isDefault) {
      await db.Profile.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }
    
    // Update profile
    await profile.update({
      name: name || profile.name,
      description: description !== undefined ? description : profile.description,
      personality: personality !== undefined ? personality : profile.personality,
      systemPrompt: systemPrompt !== undefined ? systemPrompt : profile.systemPrompt,
      avatar: avatar !== undefined ? avatar : profile.avatar,
      provider: provider || profile.provider,
      model: model || profile.model,
      temperature: temperature !== undefined ? temperature : profile.temperature,
      maxTokens: maxTokens !== undefined ? maxTokens : profile.maxTokens,
      userId: userId || profile.userId,
      isDefault: isDefault !== undefined ? isDefault : profile.isDefault
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profile.toJSON()
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Delete profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find profile
    const profile = await db.Profile.findByPk(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        message: 'Profile with specified ID does not exist'
      });
    }
    
    // Prevent deletion of default profile
    if (profile.isDefault) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete default profile',
        message: 'Default profile cannot be deleted. Set another profile as default first.'
      });
    }
    
    // Delete profile
    await profile.destroy();
    
    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete profile',
      message: error.message
    });
  }
});

// Set default profile
router.post('/:id/default', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find profile
    const profile = await db.Profile.findByPk(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        message: 'Profile with specified ID does not exist'
      });
    }
    
    // Unset current default profile
    await db.Profile.update(
      { isDefault: false },
      { where: { isDefault: true } }
    );
    
    // Set this profile as default
    await profile.update({ isDefault: true });
    
    res.json({
      success: true,
      message: 'Default profile updated successfully',
      profile: profile.toJSON()
    });
  } catch (error) {
    console.error('❌ Error setting default profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set default profile',
      message: error.message
    });
  }
});

module.exports = router;