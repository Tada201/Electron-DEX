// eDEX Chatbot - Tools Provider
const axios = require('axios');
const { db } = require('../utils/database');
const vm = require('vm');

class ToolsProvider {
  constructor() {
    this.name = 'tools';
    this.displayName = 'Tools Provider';
    this.description = 'Provider for executing tools and functions';
    this.baseUrl = '';
    this.requiresApiKey = false;
    this.documentationUrl = '';
  }

  /**
   * Check if the provider is configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return true; // Tools provider doesn't require configuration
  }

  /**
   * Get available tools
   * @returns {Array} List of available tools
   */
  async getAvailableTools() {
    try {
      const tools = await db.Tool.findAll({
        order: [['name', 'ASC']]
      });
      
      return tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description || tool.name,
        parameters: tool.meta?.parameters || this.extractParametersFromContent(tool.content)
      }));
    } catch (error) {
      console.error('❌ Error fetching tools:', error);
      return [];
    }
  }

  /**
   * Extract parameters from tool content
   * @param {string} content - Tool content
   * @returns {object} Parameters schema
   */
  extractParametersFromContent(content) {
    // Parse Python-style function definitions to extract parameters
    const paramRegex = /def\s+\w+\s*\(([^)]*)\)/;
    const match = content.match(paramRegex);
    
    if (match && match[1]) {
      const params = match[1].split(',').map(p => p.trim()).filter(p => p);
      const properties = {};
      const required = [];
      
      params.forEach(param => {
        // Handle default values: param=default
        const [name, defaultValue] = param.split('=').map(p => p.trim());
        properties[name] = {
          type: defaultValue ? typeof JSON.parse(defaultValue) : 'string',
          description: `Parameter ${name}`
        };
        
        // If no default value, it's required
        if (defaultValue === undefined) {
          required.push(name);
        }
      });
      
      return {
        type: 'object',
        properties,
        required
      };
    }
    
    // Default schema if no parameters found
    return {
      type: 'object',
      properties: {},
      required: []
    };
  }

  /**
   * Execute a tool
   * @param {string} toolId - Tool ID
   * @param {object} parameters - Tool parameters
   * @returns {object} Execution result
   */
  async executeTool(toolId, parameters = {}) {
    try {
      const tool = await db.Tool.findByPk(toolId);
      
      if (!tool) {
        throw new Error(`Tool with ID ${toolId} not found`);
      }
      
      // For demonstration purposes, we'll simulate execution of sample tools
      // In a production environment, you would implement secure execution
      let result;
      
      switch (tool.name) {
        case 'get_weather':
          result = {
            location: parameters.location,
            temperature: Math.floor(Math.random() * 30) + 5, // Random temp between 5-35°C
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 50) + 30, // Random humidity 30-80%
            wind_speed: Math.floor(Math.random() * 20) + 5 // Random wind speed 5-25 km/h
          };
          break;
        case 'calculate':
          try {
            // Simple calculation (in a real implementation, use a safe math library)
            const expression = parameters.expression;
            // This is a simplified example - in production, use a proper math expression parser
            const allowedChars = /^[0-9+\-*/(). ]+$/;
            if (allowedChars.test(expression)) {
              // eslint-disable-next-line no-eval
              result = eval(expression);
            } else {
              throw new Error('Invalid expression');
            }
          } catch (e) {
            result = `Error calculating: ${e.message}`;
          }
          break;
        case 'web_search':
          result = {
            query: parameters.query,
            results: [
              {
                title: `Search result for ${parameters.query} - 1`,
                url: 'https://example.com/result1',
                snippet: 'This is a sample search result snippet for your query.'
              },
              {
                title: `Search result for ${parameters.query} - 2`,
                url: 'https://example.com/result2',
                snippet: 'Another sample search result that matches your query.'
              }
            ]
          };
          break;
        default:
          // For custom tools, we'll return a simulated result
          result = `Executed tool "${tool.name}" with parameters: ${JSON.stringify(parameters)}`;
      }
      
      return {
        toolId: tool.id,
        toolName: tool.name,
        parameters,
        result: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Tool execution error:', error);
      throw error;
    }
  }

  /**
   * Generate tool calling prompt
   * @param {Array} tools - Available tools
   * @returns {string} Tool calling prompt
   */
  generateToolCallingPrompt(tools) {
    if (!tools || tools.length === 0) return '';
    
    const toolDescriptions = tools.map(tool => {
      let paramDesc = '';
      if (tool.parameters && tool.parameters.properties) {
        const props = tool.parameters.properties;
        const required = tool.parameters.required || [];
        paramDesc = Object.keys(props).map(name => {
          const prop = props[name];
          const requiredMarker = required.includes(name) ? ' (required)' : '';
          return `    ${name}: ${prop.description || prop.type || 'parameter'}${requiredMarker}`;
        }).join('\n');
      }
      
      return `- ${tool.name}: ${tool.description || tool.name}\n${paramDesc ? `  Parameters:\n${paramDesc}\n` : ''}`;
    }).join('\n');
    
    return `You have access to the following tools:
${toolDescriptions}

To use a tool, respond with a JSON object in the following format:
{
  "tool_calls": [
    {
      "name": "tool_name",
      "parameters": {
        "param1": "value1",
        "param2": "value2"
      }
    }
  ]
}

If no tools are needed, respond normally.`;
  }

  /**
   * Process tool calls from LLM response
   * @param {string} response - LLM response
   * @returns {object|null} Tool calls or null if none found
   */
  processToolCalls(response) {
    try {
      // Try to extract JSON from the response
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = response.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonString);
        
        if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
          return parsed;
        }
        
        // Also check for direct tool call format
        if (parsed.name && parsed.parameters) {
          return {
            tool_calls: [parsed]
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error parsing tool calls:', error);
      return null;
    }
  }

  /**
   * Test connection to tools provider
   * @returns {object} Test result
   */
  async testConnection() {
    const startTime = Date.now();
    
    try {
      const tools = await this.getAvailableTools();
      
      return {
        success: true,
        responseTime: Date.now() - startTime,
        toolsCount: tools.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }
}

module.exports = new ToolsProvider();