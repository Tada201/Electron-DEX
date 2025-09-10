const request = require('supertest');
const express = require('express');
const chatRoutes = require('../routes/chat');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/chat', chatRoutes);

// Mock providers
jest.mock('../providers/openai', () => ({
  sendMessage: jest.fn(),
  streamMessage: jest.fn(),
  supportsStreaming: jest.fn(() => true)
}));

jest.mock('../providers/anthropic', () => ({
  sendMessage: jest.fn(),
  streamMessage: jest.fn(),
  supportsStreaming: jest.fn(() => true)
}));

describe('Chat Streaming API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/chat/stream', () => {
    it('should stream response from OpenAI provider', async () => {
      const mockStreamMessage = require('../providers/openai').streamMessage;
      mockStreamMessage.mockImplementation((model, message, config, onChunk, onComplete) => {
        // Simulate streaming chunks
        setTimeout(() => onChunk({ content: 'Hello' }), 10);
        setTimeout(() => onChunk({ content: ' world' }), 20);
        setTimeout(() => onComplete(), 30);
      });

      const response = await request(app)
        .get('/api/chat/stream')
        .query({
          message: 'Hello',
          provider: 'openai',
          model: 'gpt-4o'
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(mockStreamMessage).toHaveBeenCalledWith(
        'gpt-4o',
        'Hello',
        expect.objectContaining({
          conversationId: expect.any(String)
        }),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should simulate streaming for providers without native streaming', async () => {
      const mockSendMessage = require('../providers/anthropic').sendMessage;
      mockSendMessage.mockResolvedValue({
        content: 'This is a test response',
        usage: { prompt_tokens: 5, completion_tokens: 10 },
        finishReason: 'stop'
      });

      const response = await request(app)
        .get('/api/chat/stream')
        .query({
          message: 'Test',
          provider: 'anthropic',
          model: 'claude-3-haiku-20240307'
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(mockSendMessage).toHaveBeenCalledWith(
        'claude-3-haiku-20240307',
        'Test',
        expect.objectContaining({
          conversationId: expect.any(String)
        })
      );
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .get('/api/chat/stream')
        .query({
          message: '', // Empty message should fail validation
          provider: 'openai',
          model: 'gpt-4o'
        })
        .expect(200);

      expect(response.text).toContain('data: {"error":"Invalid input"');
    });

    it('should handle unsupported providers', async () => {
      const response = await request(app)
        .get('/api/chat/stream')
        .query({
          message: 'Hello',
          provider: 'unsupported-provider',
          model: 'test-model'
        })
        .expect(200);

      expect(response.text).toContain('data: {"error":"Invalid provider"');
    });

    it('should handle provider errors gracefully', async () => {
      const mockStreamMessage = require('../providers/openai').streamMessage;
      mockStreamMessage.mockImplementation((model, message, config, onChunk, onComplete) => {
        throw new Error('Provider error');
      });

      const response = await request(app)
        .get('/api/chat/stream')
        .query({
          message: 'Hello',
          provider: 'openai',
          model: 'gpt-4o'
        })
        .expect(200);

      expect(response.text).toContain('data: {"error":"Provider error"');
    });
  });
});