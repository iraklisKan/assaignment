/*
 * =============================================================================
 * MOCK INTEGRATION (FOR TESTING & DEMOS)
 * =============================================================================
 * This is a fake provider that doesn't call any external API.
 * Perfect for testing, demos, or when you don't have real API keys.
 * 
 * Why use this:
 * ✓ No API key needed - works instantly
 * ✓ No rate limits - unlimited calls
 * ✓ Fast - no network delays
 * ✓ Always available - no downtime
 * ✓ Great for development and testing
 * 
 * How it works:
 * Instead of making HTTP requests, it returns hardcoded exchange rates
 * that are close to real values. Perfect for evaluators who want to see
 * your system working without needing to sign up for API keys.
 * 
 * Supported currencies: EUR, GBP, JPY, CHF, CAD, AUD, NZD, CNY (8 total)
 * =============================================================================
 */

import { BaseIntegration } from './BaseIntegration.js';

export class MockIntegration extends BaseIntegration {
  constructor(config) {
    super(config);
    this.provider = 'mock';
    
    // Hardcoded exchange rates (relative to USD = 1)
    // These are realistic approximate values
    this.mockRates = {
      EUR: 0.92,    // Euro
      GBP: 0.79,    // British Pound
      JPY: 149.50,  // Japanese Yen
      CHF: 0.88,    // Swiss Franc
      CAD: 1.36,    // Canadian Dollar
      AUD: 1.54,    // Australian Dollar
      NZD: 1.67,    // New Zealand Dollar
      CNY: 7.24     // Chinese Yuan
    };
  }

  // Return fake exchange rates without calling any external API
  async fetchLatestRates(options = {}) {
    // Simulate a network delay to make it feel realistic
    await new Promise(resolve => setTimeout(resolve, 100));

    const base = options.base || 'USD';
    
    // Copy the mock rates
    let rates = { ...this.mockRates };
    
    // If requesting a base currency other than USD, we need to recalculate all rates
    // Example: If base=EUR, then EUR becomes 1.0 and USD becomes 1/0.92 = 1.087
    if (base !== 'USD') {
      const baseRate = this.mockRates[base];
      
      // Make sure we support this currency
      if (!baseRate) {
        throw new Error(`Unsupported base currency: ${base}`);
      }
      
      // Recalculate all rates relative to the new base
      rates = {};
      rates['USD'] = 1 / baseRate;  // Calculate USD rate relative to new base
      
      for (const [currency, rate] of Object.entries(this.mockRates)) {
        if (currency !== base) {
          rates[currency] = rate / baseRate;  // Adjust each rate
        }
      }
    } else {
      // If base is USD, just add USD to USD rate (always 1.0)
      rates['USD'] = 1;
    }

    // Return in standard format
    return {
      base: base,
      timestamp: Math.floor(Date.now() / 1000),  // Current time
      rates: rates
    };
  }

  // Return fake usage metrics (pretend we have plenty of calls left)
  async getUsageMetrics() {
    return {
      callsRemaining: 1000,   // Pretend we have 1000 calls remaining
      limit: 1000,            // Pretend limit is 1000 per month
      resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // Resets in 30 days
    };
  }
}

export default MockIntegration;
