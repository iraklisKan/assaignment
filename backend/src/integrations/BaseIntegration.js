/*
 * =============================================================================
 * BASE INTEGRATION CLASS
 * =============================================================================
 * This is the foundation for all exchange rate API integrations.
 * Think of it as a template that other providers (ExchangeRate-API, Fixer, etc.) 
 * must follow to work with our system.
 * 
 * What it provides:
 * - Common configuration setup (API keys, URLs, timeouts)
 * - Automatic retry logic when API calls fail
 * - Health checking to verify the integration works
 * - A standard format for returning exchange rate data
 * =============================================================================
 */

export class BaseIntegration {
  constructor(config) {
    // Store all the configuration needed to talk to the external API
    this.config = config;
    this.name = config.name;              // User-friendly name like "My ExchangeRate API"
    this.provider = config.provider;      // Provider type: "exchangerate-api", "fixer", etc.
    this.baseUrl = config.base_url;       // API endpoint URL
    this.apiKey = config.api_key;         // Decrypted API key (ready to use)
    this.timeout = 5000;                  // Wait max 5 seconds for API response
    this.maxRetries = 2;                  // Try up to 3 times total (1 initial + 2 retries)
  }

  // Every provider MUST implement this method to fetch exchange rates
  // This is just a placeholder that throws an error if not overridden
  async fetchLatestRates(options = {}) {
    throw new Error('fetchLatestRates must be implemented');
  }

  // Get information about API usage limits (how many calls left, when it resets)
  // Providers can override this if they expose usage data in their API
  async getUsageMetrics() {
    return {
      callsRemaining: null,  // How many API calls you have left (null if unknown)
      limit: null,           // Total monthly/daily limit (null if unknown)
      resetAt: null          // When the limit resets (null if unknown)
    };
  }

  // Quick test to see if this integration is working properly
  // Attempts to fetch USD rates - if it succeeds, integration is healthy
  async healthCheck() {
    try {
      await this.fetchLatestRates({ base: 'USD' });
      return true;  // Success! Integration is working
    } catch (error) {
      console.error(`Health check failed for ${this.name}:`, error.message);
      return false;  // Something is wrong (bad API key, network issue, etc.)
    }
  }

  // Smart retry system: if an API call fails, try again with increasing delays
  // Example: First fail → wait 1s → try again → fail → wait 2s → try again → fail → give up
  async retry(fn, retries = this.maxRetries) {
    try {
      return await fn();  // Try to execute the function
    } catch (error) {
      if (retries > 0) {
        // Calculate wait time: 1s, 2s, 4s (exponential backoff)
        const delay = Math.pow(2, this.maxRetries - retries) * 1000;
        console.log(`Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1);  // Try again with one less retry
      }
      throw error;  // Out of retries - give up and throw the error
    }
  }
}

export default BaseIntegration;
