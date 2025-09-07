// eDEX Chatbot Backend Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

// Database initialization
const { initializeDatabase } = require('./utils/database');

const providerRoutes = require('./routes/providers');
const chatRoutes = require('./routes/chat');
const configRoutes = require('./routes/config');
const tagsRoutes = require('./routes/tags');
const foldersRoutes = require('./routes/folders');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
});

const rateLimitMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please slow down your requests'
      });
    });
};

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'https://*.replit.dev', 'https://*.replit.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api/', rateLimitMiddleware);

// Routes
app.use('/api/providers', providerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/config', configRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/folders', foldersRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'eDEX Chatbot Backend',
    version: '1.0.0',
    description: 'Backend server for eDEX-UI style chatbot with multiple LLM providers',
    endpoints: {
      health: '/health',
      providers: '/api/providers',
      chat: '/api/chat',
      config: '/api/config',
      tags: '/api/tags',
      folders: '/api/folders'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize database
initializeDatabase().then(() => {
  console.log('✅ Database initialized');
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 eDEX Chatbot Backend Server Started
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
⚡ Server running at: http://0.0.0.0:${PORT}
🏥 Health check: http://0.0.0.0:${PORT}/health

📡 Available Endpoints:
   • GET  /health - Health check
   • GET  /api/providers - List available providers
   • POST /api/providers/test - Test provider connection  
   • POST /api/chat/send - Send message to LLM
   • POST /api/chat/completions - OpenAI-compatible chat completions
   • POST /api/chat/new - Create new chat
   • GET  /api/chat/:id - Get chat by ID
   • GET  /api/chat - Get all chats
   • PUT  /api/chat/:id - Update chat
   • DELETE /api/chat/:id - Delete chat
   • GET  /api/config/models - Get available models
   • GET  /api/tags - Get all tags
   • POST /api/tags - Create new tag
   • DELETE /api/tags/:id - Delete tag
   • POST /api/tags/:chatId/tag/:tagId - Add tag to chat
   • DELETE /api/tags/:chatId/tag/:tagId - Remove tag from chat
   • GET  /api/folders - Get all folders
   • POST /api/folders - Create new folder
   • PUT  /api/folders/:id - Update folder
   • DELETE /api/folders/:id - Delete folder
   • POST /api/folders/:folderId/chat/:chatId - Move chat to folder
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('💤 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

module.exports = app;