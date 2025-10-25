/*
 * =============================================================================
 * INTEGRATION FACTORY & REGISTRY
 * =============================================================================
 * This file is the central hub for all exchange rate provider integrations.
 * 
 * What it does:
 * 1. Factory Pattern: Creates the right integration class based on provider name
 * 2. Provider Registry: Lists all supported providers with their metadata
 * 3. Frontend Support: Provides data for UI dropdowns and forms
 * 
 * Think of it as a phone book - when the system needs to talk to "exchangerate-api",
 * this factory looks it up and creates the correct ExchangeRateAPI object.
 * =============================================================================
 */

import ExchangeRateAPI from './ExchangeRateAPI.js';
import FixerIO from './FixerIO.js';
import CurrencyLayer from './CurrencyLayer.js';
import MockIntegration from './MockIntegration.js';

/**
 * Factory function: Given a provider name, create the right integration instance
 * Example: createIntegration({provider: 'exchangerate-api', ...}) → ExchangeRateAPI object
 * @param {Object} config - Integration configuration
 * @param {string} config.provider - Provider identifier
 * @returns {Object} Integration instance
 */
export const createIntegration = (config) => {
  const provider = config.provider.toLowerCase();

  switch (provider) {
    case 'exchangerate-api':
      return new ExchangeRateAPI(config);
    
    case 'fixer':
    case 'fixer.io':  // Support both "fixer" and "fixer.io" names
      return new FixerIO(config);
    
    case 'currencylayer':
      return new CurrencyLayer(config);
    
    case 'mock':
      return new MockIntegration(config);
    
    default:
      // If someone tries to use a provider we don't support, throw an error
      throw new Error(`Unknown integration provider: ${provider}`);
  }
};

/**
 * Return metadata about all supported providers
 * This is used by the frontend to populate dropdown menus and show helpful info
 * @returns {Array<Object>} Array of provider metadata objects
 */
export const getSupportedProviders = () => {
  return [
    {
      name: 'exchangerate-api',                             // Internal identifier
      displayName: 'ExchangeRate-API',                     // User-friendly name
      defaultBaseUrl: 'https://v6.exchangerate-api.com',   // API endpoint
      freeTierLimit: 1500,                                 // Free monthly requests
      description: 'Best free tier with 1,500 requests/month'  // Help text
    },
    {
      name: 'fixer',
      displayName: 'Fixer.io',
      defaultBaseUrl: 'http://data.fixer.io/api',
      freeTierLimit: 100,
      description: 'EUR base only on free tier'
    },
    {
      name: 'currencylayer',
      displayName: 'CurrencyLayer',
      defaultBaseUrl: 'http://api.currencylayer.com',
      freeTierLimit: 100,
      description: 'USD base only on free tier'
    },
    {
      name: 'mock',
      displayName: 'Mock Provider',
      defaultBaseUrl: 'http://localhost',
      freeTierLimit: 1000,
      description: 'No API key needed - perfect for testing'
    }
  ];
};

// Export all integration classes for direct import if needed
export { ExchangeRateAPI, FixerIO, CurrencyLayer, MockIntegration };
