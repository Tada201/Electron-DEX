// Database initialization and setup
const path = require('path');

// Try to initialize SQLite database
let sequelize, DataTypes;
let dbModuleAvailable = true;

try {
  const sequelizeModule = require('sequelize');
  Sequelize = sequelizeModule.Sequelize;
  DataTypes = sequelizeModule.DataTypes;
  
  // Initialize SQLite database
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/chatbot.db'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  });
} catch (error) {
  console.warn('⚠️ Sequelize not available, using mock database:', error);
  dbModuleAvailable = false;
  
  // Mock implementation
  sequelize = {
    authenticate: () => Promise.resolve(),
    sync: () => Promise.resolve(),
    define: () => ({
      findOne: () => Promise.resolve(null),
      create: () => Promise.resolve()
    })
  };
  
  DataTypes = {
    UUID: 'UUID',
    UUIDV4: 'UUIDV4',
    STRING: 'STRING',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    INTEGER: 'INTEGER'
  };
}

// Import models using the same pattern as models/index.js
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

if (dbModuleAvailable) {
  try {
    // Import models
    const ChatModel = require('../models/chat.model');
    db.Chat = ChatModel(sequelize, DataTypes);

    const MessageModel = require('../models/message.model');
    db.Message = MessageModel(sequelize, DataTypes);

    const TagModel = require('../models/tag.model');
    db.Tag = TagModel(sequelize, DataTypes);

    const FolderModel = require('../models/folder.model');
    db.Folder = FolderModel(sequelize, DataTypes);

    const ProfileModel = require('../models/profile.model');
    db.Profile = ProfileModel(sequelize, DataTypes);

    const PreferenceModel = require('../models/preference.model');
    db.Preference = PreferenceModel(sequelize, DataTypes);

    const ToolModel = require('../models/tool.model');
    db.Tool = ToolModel(sequelize, DataTypes);

    // Chat-Tag association table
    db.ChatTag = sequelize.define('ChatTag', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      chatId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id'
        }
      },
      tagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id'
        }
      }
    }, {
      timestamps: true
    });

    // Define associations
    db.Chat.belongsTo(db.Folder, { foreignKey: 'folderId' });
    db.Folder.hasMany(db.Chat, { foreignKey: 'folderId' });

    db.Message.belongsTo(db.Chat, { foreignKey: 'chatId' });
    db.Chat.hasMany(db.Message, { foreignKey: 'chatId', as: 'messages' });

    db.Chat.belongsToMany(db.Tag, { through: db.ChatTag, foreignKey: 'chatId', otherKey: 'tagId' });
    db.Tag.belongsToMany(db.Chat, { through: db.ChatTag, foreignKey: 'tagId', otherKey: 'chatId' });

    // Unique index for preferences is defined in the model definition
    
    console.log('✅ Database models loaded successfully');
  } catch (error) {
    console.warn('⚠️ Error loading database models:', error);
    // Set dbModuleAvailable to false to use mock database
    dbModuleAvailable = false;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    if (dbModuleAvailable) {
      // Create default profile if none exists
      try {
        const defaultProfile = await db.Profile.findOne({ where: { isDefault: true } });
        if (!defaultProfile) {
          await db.Profile.create({
            name: 'Default Profile',
            description: 'Default chatbot profile with balanced settings',
            provider: 'openai',
            model: 'gpt-4o-mini',
            systemPrompt: 'You are a helpful AI assistant.',
            isDefault: true
          });
          console.log('✅ Default profile created');
        }
      } catch (error) {
        console.warn('⚠️ Error creating default profile:', error);
      }
      
      // Wait a bit for models to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create sample tools
      try {
        const { createSampleTools } = require('./sample_tools');
        await createSampleTools();
      } catch (error) {
        console.warn('⚠️ Sample tools not available:', error);
      }
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Don't throw the error to allow the app to continue running
    return sequelize;
  }
}

module.exports = { initializeDatabase, db, sequelize };