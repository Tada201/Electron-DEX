// Sample tools for eDEX Chatbot
const { db } = require('./database');

/**
 * Create sample tools in the database
 */
async function createSampleTools() {
  try {
    // Check if database models are available
    if (!db.Tool) {
      console.warn('⚠️ Database models not available, skipping sample tools creation');
      return;
    }
    // Weather tool
    await db.Tool.findOrCreate({
      where: { name: 'get_weather' },
      defaults: {
        name: 'get_weather',
        description: 'Get current weather information for a location',
        content: `
def get_weather(location):
    """
    Get current weather information for a location
    :param location: City name or coordinates
    :return: Weather information
    """
    # This is a mock implementation
    return {
        "location": location,
        "temperature": 22,
        "condition": "Sunny",
        "humidity": 65,
        "wind_speed": 10
    }
`,
        userId: 'default',
        meta: {
          createdAt: new Date().toISOString(),
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'City name or coordinates'
              }
            },
            required: ['location']
          }
        }
      }
    });

    // Calculator tool
    await db.Tool.findOrCreate({
      where: { name: 'calculate' },
      defaults: {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        content: `
def calculate(expression):
    """
    Perform mathematical calculations
    :param expression: Mathematical expression to evaluate
    :return: Result of the calculation
    """
    # This is a mock implementation
    try:
        # In a real implementation, you would use a safe math evaluator
        # For demonstration, we'll just return a mock result
        return {
            "expression": expression,
            "result": eval(expression)  # Note: eval is unsafe, use a proper math library in production
        }
    except Exception as e:
        return {
            "expression": expression,
            "error": str(e)
        }
`,
        userId: 'default',
        meta: {
          createdAt: new Date().toISOString(),
          parameters: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: 'Mathematical expression to evaluate'
              }
            },
            required: ['expression']
          }
        }
      }
    });

    // Web search tool
    await db.Tool.findOrCreate({
      where: { name: 'web_search' },
      defaults: {
        name: 'web_search',
        description: 'Search the web for information',
        content: `
def web_search(query):
    """
    Search the web for information
    :param query: Search query
    :return: Search results
    """
    # This is a mock implementation
    return {
        "query": query,
        "results": [
            {
                "title": "Sample search result 1",
                "url": "https://example.com/1",
                "snippet": "This is a sample search result snippet..."
            },
            {
                "title": "Sample search result 2",
                "url": "https://example.com/2",
                "snippet": "This is another sample search result snippet..."
            }
        ]
    }
`,
        userId: 'default',
        meta: {
          createdAt: new Date().toISOString(),
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              }
            },
            required: ['query']
          }
        }
      }
    });

    console.log('✅ Sample tools created');
  } catch (error) {
    console.error('❌ Error creating sample tools:', error);
  }
}

module.exports = { createSampleTools };