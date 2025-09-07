// Database initialization and setup
const db = require('../models');

async function initializeDatabase() {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models to database
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');

    // Create default user if none exists
    const userCount = await db.User.count();
    if (userCount === 0) {
      const defaultUser = await db.User.create({
        email: 'default@edex.chat',
        name: 'Default User',
        role: 'admin',
        meta: {
          createdAt: new Date().toISOString()
        }
      });
      console.log('✅ Default user created:', defaultUser.email);
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

module.exports = {
  initializeDatabase,
  db
};