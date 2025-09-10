// eDEX Chatbot - LM Studio Service
// Service for communication with LM Studio API

import axios from "axios";
import { LMSTUDIO_BASE_URL, LMSTUDIO_API_KEY } from "../config/lmstudio.js";
import { createHttpConfig } from "../utils/helpers.js";

/**
 * Query LM Studio model with a prompt
 * @param {string} prompt - The prompt to send to the model
 * @param {object} options - Additional options for the request
 * @returns {Promise<object>} The response from LM Studio
 */
export async function queryModel(prompt, options = {}) {
  const config = createHttpConfig(LMSTUDIO_BASE_URL);
  const client = axios.create(config);
  
  try {
    const response = await client.post(
      "/chat/completions",
      {
        model: options.model || "lmstudio-community/Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      },
      {
        headers: {
          "Authorization": `Bearer ${LMSTUDIO_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(`LM Studio API error: ${error.message}`);
  }
}

/**
 * Get available models from LM Studio
 * @returns {Promise<Array>} List of available models
 */
export async function getAvailableModels() {
  const config = createHttpConfig(LMSTUDIO_BASE_URL);
  const client = axios.create(config);
  
  try {
    const response = await client.get("/models", {
      headers: {
        "Authorization": `Bearer ${LMSTUDIO_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch LM Studio models: ${error.message}`);
  }
}