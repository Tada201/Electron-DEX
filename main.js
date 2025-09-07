const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

// Import backend routes
const providerRoutes = require('./src/backend/routes/providers');
const chatRoutes = require('./src/backend/routes/chat');
const configRoutes = require('./src/backend/routes/config');
const tagsRoutes = require('./src/backend/routes/tags');
const foldersRoutes = require('./src/backend/routes/folders');

// Database initialization
const { initializeDatabase } = require('./src/backend/utils/database');

// Keep a global reference of the window object
let mainWindow;
let backendServer;

// Backend server setup
function startBackendServer() {
  const expressApp = express();
  const PORT = process.env.PORT || 3001;

  // Security middleware
  expressApp.use(helmet());

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

  // CORS configuration - Allow Electron renderer
  expressApp.use(cors({
    origin: ['http://localhost:5000', 'file://', 'app://'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }));

  // Body parsing middleware
  expressApp.use(bodyParser.json({ limit: '10mb' }));
  expressApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Apply rate limiting to API routes
  expressApp.use('/api/', rateLimitMiddleware);

  // Routes
  expressApp.use('/api/providers', providerRoutes);
  expressApp.use('/api/chat', chatRoutes);
  expressApp.use('/api/config', configRoutes);
  expressApp.use('/api/tags', tagsRoutes);
  expressApp.use('/api/folders', foldersRoutes);

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    });
  });

  // Root endpoint
  expressApp.get('/', (req, res) => {
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
  expressApp.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // 404 handler
  expressApp.use('*', (req, res) => {
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
  backendServer = expressApp.listen(PORT, 'localhost', () => {
    console.log(`🚀 eDEX Backend Server running on http://localhost:${PORT}`);
  });

  return backendServer;
}

function createWindow() {
  console.log('🔧 Creating Electron window...');
  
  // Start backend server first
  startBackendServer();

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Allow local file access
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: add an icon
    frame: true,
    titleBarStyle: 'default'
  });

  console.log('📁 Loading UI file...');
  // Load the DEX UI
  mainWindow.loadFile('src/ui.html');

  // Disable devtools in production, enable in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  } else {
    // Disable devtools context menu in production
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    console.log('🚪 Window closed');
    // Dereference the window object
    mainWindow = null;
    // Close backend server
    if (backendServer) {
      backendServer.close();
    }
  });
  
  console.log('✅ Window created successfully');
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('⚡ Electron app is ready');
  createWindow();

  app.on('activate', () => {
    console.log('🔄 App activated');
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  console.log('🚪 All windows closed');
  // Close backend server
  if (backendServer) {
    backendServer.close();
  }
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (e, url) => {
    e.preventDefault();
    // shell.openExternal(url);
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
  
  // Disable devtools context menu
  contents.on('before-input-event', (event, input) => {
    // Disable F12 and Ctrl+Shift+I
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      event.preventDefault();
    }
  });
});