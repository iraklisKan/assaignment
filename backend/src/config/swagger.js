import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Currency Exchange Rate API',
      version: '1.0.0',
      description: `
A comprehensive currency exchange rate management system that provides:
- Real-time exchange rates from multiple providers
- Historical rate tracking and visualization
- Currency conversion with cross-rate support
- Integration management for external API providers
- Usage monitoring and analytics

## Features
- ✅ Multi-provider support (ExchangeRate-API, Fixer.io, CurrencyLayer)
- ✅ Automated rate fetching with configurable intervals
- ✅ Redis caching for fast lookups
- ✅ Encrypted API key storage
- ✅ Comprehensive monitoring and logging
      `.trim(),
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3001',
        description: 'Docker environment'
      }
    ],
    tags: [
      {
        name: 'Rates',
        description: 'Exchange rate operations - fetch latest rates, historical data, and available currencies'
      },
      {
        name: 'Conversion',
        description: 'Currency conversion with direct and cross-rate support'
      },
      {
        name: 'Integrations',
        description: 'Manage external API provider integrations'
      },
      {
        name: 'Monitoring',
        description: 'System health, usage statistics, and analytics'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message description'
            },
            statusCode: {
              type: 'integer',
              example: 400
            }
          }
        },
        Rate: {
          type: 'object',
          properties: {
            pair: {
              type: 'string',
              example: 'USD-EUR'
            },
            base: {
              type: 'string',
              example: 'USD'
            },
            target: {
              type: 'string',
              example: 'EUR'
            },
            rate: {
              type: 'number',
              example: 0.85
            },
            fetched_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-26T10:30:00Z'
            }
          }
        },
        Integration: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'ExchangeRate API - Production'
            },
            provider: {
              type: 'string',
              enum: ['exchangerate-api', 'fixer', 'currencylayer', 'mock'],
              example: 'exchangerate-api'
            },
            active: {
              type: 'boolean',
              example: true
            },
            priority: {
              type: 'integer',
              example: 1
            },
            poll_interval_seconds: {
              type: 'integer',
              example: 60
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/index.js'] // Path to API route files
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
