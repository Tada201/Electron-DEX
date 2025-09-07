# Electron DEX

A sophisticated Electron-based DEX-UI chatbot application with multiple AI provider support and cyberpunk aesthetics.

## Features

- 🚀 Modern Electron-based architecture
- 🎨 Authentic eDEX-UI cyberpunk styling and animations
- 🤖 Multiple AI provider support (OpenAI, Anthropic, Google, Mistral, Groq, xAI)
- 💬 Advanced session management with search and filtering
- 📱 Responsive design for all screen sizes
- 🔔 Desktop notifications
- ⌨️ Slash commands for enhanced productivity
- 🛡️ Security best practices and rate limiting
- 🎯 Real-time status monitoring and statistics
- 📊 Token usage tracking
- 🌈 Customizable themes and color schemes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install main dependencies:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   npm run install-backend
   ```
4. Configure API keys in `backend/.env` (copy from `backend/.env.example`)

### Running the Application

#### Development Mode
```bash
npm start
```

This will start both the Electron app and the integrated backend server on port 3001.

#### Backend Only (for testing)
```bash
npm run backend-dev
```

## Project Structure

```
electron-dex/
├── main.js              # Main Electron process with integrated backend
├── src/                 # Frontend DEX-UI application
│   ├── index.html      # Main HTML interface
│   ├── main.js         # Frontend application logic
│   ├── assets/         # CSS, fonts, themes, and static assets
│   ├── classes/        # JavaScript classes (Chatbot, Session, Terminal)
│   └── utils/          # Utility functions (Markdown renderer)
├── backend/            # Express.js backend server
│   ├── server.js       # Main server file
│   ├── routes/         # API routes (chat, providers, config)
│   ├── providers/      # AI provider implementations
│   └── utils/          # Backend utilities
├── package.json        # Project configuration
└── README.md          # This file
```

## Available Scripts

- `npm start` - Start the full Electron application with integrated backend
- `npm run dev` - Start with development tools enabled
- `npm run backend` - Start backend server only
- `npm run backend-dev` - Start backend in development mode with auto-reload
- `npm run install-backend` - Install backend dependencies
- `npm run build` - Build the app for distribution (requires electron-builder)

## Keyboard Shortcuts

- `Ctrl+R` or `F5` - Reload the application
- `Ctrl+Shift+I` - Toggle Developer Tools (in development mode)
- `Enter` - Send message
- `Shift+Enter` - New line in message input
- `/` - Trigger slash commands

## Slash Commands

- `/help` - Show available commands
- `/clear` - Clear current chat session
- `/summarize` - Summarize the conversation
- `/translate [text]` - Translate text
- `/explain [topic]` - Explain a topic
- `/code [task]` - Generate code
- `/debug [issue]` - Help debug issues
- `/export` - Export chat history

## AI Providers Configuration

The application supports multiple AI providers. Configure your API keys in `backend/.env`:

### Supported Providers

1. **OpenAI** (GPT models)
   - Get your API key from [platform.openai.com](https://platform.openai.com)
   - Models: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo

2. **Anthropic** (Claude models)
   - Get your API key from [console.anthropic.com](https://console.anthropic.com)
   - Models: Claude 3.5 Sonnet, Claude 3 Opus

3. **Google Gemini**
   - Get your API key from [Google AI Studio](https://makersuite.google.com)
   - Models: Gemini 1.5 Pro, Gemini 1.5 Flash

4. **Mistral**
   - Get your API key from [console.mistral.ai](https://console.mistral.ai)
   - Models: Mistral Large, Mixtral 8x7B

5. **Groq** (Fast inference)
   - Get your API key from [console.groq.com](https://console.groq.com)
   - Models: Llama 3 70B, Mixtral 8x7B

6. **xAI** (Grok models)
   - Get your API key from [console.x.ai](https://console.x.ai)
   - Models: Grok Beta, Grok 2

## Security Features

- Content Security Policy (CSP) configured
- Rate limiting on API endpoints
- Input sanitization and validation
- Secure API key management
- CORS protection

## Customization

### Changing Themes
The application includes multiple cyberpunk themes:
- Tron (default)
- Blade Runner
- Matrix
- Cyberpunk
- Navy Disrupted
- And more...

### Adding New AI Providers
1. Create a new provider file in `backend/providers/`
2. Add route configuration in `backend/routes/providers.js`
3. Update the frontend provider selector

### Modifying the UI
- Edit `src/assets/css/` files for styling changes
- Modify `src/index.html` for layout changes
- Update `src/main.js` for functionality changes

## Building for Distribution

To build the app for distribution, install electron-builder:

```bash
npm install --save-dev electron-builder
```

Then run:
```bash
npm run build
```

## Technologies Used

- **Electron** - Cross-platform desktop framework
- **Express.js** - Backend web framework
- **HTML5/CSS3** - Modern web technologies
- **JavaScript (ES6+)** - Application logic
- **WebGL** - Hardware-accelerated graphics
- **FontFace API** - Custom font loading
- **Fetch API** - HTTP requests
- **LocalStorage** - Data persistence

## License

MIT License - feel free to use this template for your projects!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please create an issue in the repository.

I also taken inspiration from the original design creator edex-UI
Links Here: https://github.com/GitSquared/edex-ui