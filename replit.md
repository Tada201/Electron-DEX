# eDEX Chatbot

A comprehensive eDEX-UI style chatbot application with multi-provider LLM support and cyberpunk-themed interface.

## Overview
This is a cyberpunk-themed chatbot interface inspired by eDEX-UI, featuring:
- Modern chat interface with session management
- eDEX-UI authentic styling and boot sequence  
- Terminal-style UI with neon effects
- **Comprehensive LLM Provider Support** (6+ major providers)
- Session persistence and search
- Mobile-responsive design

## Current State
✅ **FULLY OPERATIONAL** - Multi-tier architecture running successfully
- **Frontend Server**: Port 5000 (eDEX-UI interface)
- **Backend API**: Port 3001 (LLM provider orchestration)
- All dependencies installed and working
- Servers configured for Replit proxy (0.0.0.0 binding)
- Deployment configuration set up for autoscale

## Project Architecture
- **Frontend**: HTML/CSS/JS with eDEX-UI styling
- **Frontend Server**: http-server (Node.js) on port 5000
- **Backend API**: Express.js server on port 3001
- **LLM Providers**: Modular provider architecture supporting:
  - OpenAI (GPT-4o, GPT-4 Turbo, GPT-3.5)
  - Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus)
  - Google Gemini (1.5 Pro, 1.5 Flash, 1.0 Pro)
  - Mistral AI (Large, Medium, Small, Open variants)
  - Groq (Llama 3, Mixtral, Gemma models)
  - xAI (Grok Beta, Grok 2, Grok 2 Mini)
- **Styling**: Custom CSS with cyberpunk themes
- **Features**: Session management, markdown support, provider switching

## Recent Changes
- 2025-09-07: **MAJOR ARCHITECTURE UPDATE**
  - Implemented comprehensive Node.js Express backend (port 3001)
  - Added 6 major LLM provider integrations with full model support
  - Created modular provider structure for easy expansion
  - Updated frontend to communicate via HTTP API instead of Tauri
  - Enhanced model selection with latest available models from each provider
  - Added robust error handling and response formatting
  - Implemented health check and provider status endpoints

## User Preferences
- Project prefers authentic eDEX-UI styling and functionality
- Uses cyberpunk/terminal aesthetic
- **Multi-provider LLM support** with expandable architecture
- HTTP-based backend communication for cross-platform compatibility

## Development Commands
- `npm run dev` - Start frontend development server (port 5000)
- `cd backend && npm start` - Start backend API server (port 3001)
- `npm run build` - Build application for production

## File Structure
- `src/` - Frontend application files (eDEX-UI interface)
- `backend/` - Node.js Express API server
  - `providers/` - Individual LLM provider implementations
  - `routes/` - API route handlers (chat, providers, config)
  - `utils/` - Backend utility functions and helpers
- `assets/` - CSS, fonts, themes, and static assets
- `classes/` - JavaScript classes for frontend functionality
- `utils/` - Frontend utility functions

## API Integration
- **Backend Endpoints**: 
  - `GET /health` - Server health check
  - `GET /api/providers` - List available LLM providers
  - `POST /api/chat/send` - Send message to selected provider
  - `GET /api/config/models` - Get available models per provider
- **Provider Support**: Ready for API key integration via environment variables
- **Error Handling**: Comprehensive user-friendly error messages