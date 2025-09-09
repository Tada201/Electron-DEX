// Database models index file
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'chatbot.db'),
  logging: false // Set to console.log to see SQL queries
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

// Initialize models
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Chat = require('./chat.model')(sequelize, DataTypes);
db.Message = require('./message.model')(sequelize, DataTypes);
db.Tag = require('./tag.model')(sequelize, DataTypes);
db.Folder = require('./folder.model')(sequelize, DataTypes);
db.User = require('./user.model')(sequelize, DataTypes);
db.Profile = require('./profile.model')(sequelize, DataTypes);
db.Preference = require('./preference.model')(sequelize, DataTypes);

// Define associations
// Chat to Message (One-to-Many)
db.Chat.hasMany(db.Message, {
  foreignKey: 'chatId',
  as: 'messages'
});
db.Message.belongsTo(db.Chat, {
  foreignKey: 'chatId',
  as: 'chat'
});

// Chat to Tag (Many-to-Many)
db.Chat.belongsToMany(db.Tag, {
  through: 'ChatTags',
  foreignKey: 'chatId',
  otherKey: 'tagId',
  as: 'tags'
});
db.Tag.belongsToMany(db.Chat, {
  through: 'ChatTags',
  foreignKey: 'tagId',
  otherKey: 'chatId',
  as: 'chats'
});

// Chat to Folder (Many-to-One)
db.Folder.hasMany(db.Chat, {
  foreignKey: 'folderId',
  as: 'chats'
});
db.Chat.belongsTo(db.Folder, {
  foreignKey: 'folderId',
  as: 'folder'
});

// User to Chat (One-to-Many)
db.User.hasMany(db.Chat, {
  foreignKey: 'userId',
  as: 'chats'
});
db.Chat.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
});

// User to Folder (One-to-Many)
db.User.hasMany(db.Folder, {
  foreignKey: 'userId',
  as: 'folders'
});
db.Folder.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
});

// User to Tag (One-to-Many)
db.User.hasMany(db.Tag, {
  foreignKey: 'userId',
  as: 'tags'
});
db.Tag.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
});

// User to Profile (One-to-Many)
db.User.hasMany(db.Profile, {
  foreignKey: 'userId',
  as: 'profiles'
});
db.Profile.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
});

// User to Preference (One-to-Many)
db.User.hasMany(db.Preference, {
  foreignKey: 'userId',
  as: 'preferences'
});
db.Preference.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = db;