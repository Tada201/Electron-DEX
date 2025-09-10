// eDEX Chatbot - LM Studio Configuration
// Configuration constants for LM Studio integration

/**
 * Base URL for LM Studio API
 * @type {string}
 */
export const LMSTUDIO_BASE_URL = process.env.LMSTUDIO_URL || "http://localhost:1234/v1";

/**
 * API key for LM Studio
 * @type {string}
 */
export const LMSTUDIO_API_KEY = process.env.LMSTUDIO_API_KEY || "lm-studio";