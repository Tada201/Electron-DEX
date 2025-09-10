const OpenAIProvider = require('../providers/openai');
const AnthropicProvider = require('../providers/anthropic');
const GoogleProvider = require('../providers/google');
const MistralProvider = require('../providers/mistral');
const GroqProvider = require('../providers/groq');
const XAIProvider = require('../providers/xai');

describe('Provider Streaming Support', () => {
  describe('OpenAI Provider', () => {
    it('should support streaming', () => {
      expect(OpenAIProvider.supportsStreaming()).toBe(true);
    });

    it('should have streamMessage method', () => {
      expect(typeof OpenAIProvider.streamMessage).toBe('function');
    });
  });

  describe('Anthropic Provider', () => {
    it('should support streaming', () => {
      expect(AnthropicProvider.supportsStreaming()).toBe(true);
    });

    it('should have streamMessage method', () => {
      expect(typeof AnthropicProvider.streamMessage).toBe('function');
    });
  });

  describe('Google Provider', () => {
    it('should support streaming', () => {
      expect(GoogleProvider.supportsStreaming()).toBe(true);
    });

    it('should have streamMessage method', () => {
      expect(typeof GoogleProvider.streamMessage).toBe('function');
    });
  });

  describe('Mistral Provider', () => {
    it('should support streaming', () => {
      expect(MistralProvider.supportsStreaming()).toBe(true);
    });

    it('should have streamMessage method', () => {
      expect(typeof MistralProvider.streamMessage).toBe('function');
    });
  });

  describe('Groq Provider', () => {
    it('should support streaming', () => {
      expect(GroqProvider.supportsStreaming()).toBe(true);
    });

    it('should have streamMessage method', () => {
      expect(typeof GroqProvider.streamMessage).toBe('function');
    });
  });

  describe('xAI Provider', () => {
    it('should support streaming', () => {
      expect(XAIProvider.supportsStreaming()).toBe(true);
    });

    it('should have streamMessage method', () => {
      expect(typeof XAIProvider.streamMessage).toBe('function');
    });
  });
});