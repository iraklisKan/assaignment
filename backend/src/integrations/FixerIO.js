/*
 * =============================================================================
 * FIXER.IO INTEGRATION
 * =============================================================================
 * Connects to Fixer.io (https://fixer.io) - a popular currency exchange API
 * 
 * Provider details:
 * - Free tier: 100 requests per month
 * - Requires sign-up with email
 * - API Documentation: https://fixer.io/documentation
 * 
 * IMPORTANT LIMITATION:
 * ⚠ The free tier ONLY supports EUR as the base currency
 *   (You cannot get rates based on USD, GBP, or other currencies)
 *   To use other base currencies, you need a paid subscription
 * 
 * API Format: http://data.fixer.io/api/latest?access_key={YOUR-KEY}&base=EUR
 * =============================================================================
 */

import axios from 'axios';
import { BaseIntegration } from './BaseIntegration.js';

export class FixerIO extends BaseIntegration {
  constructor(config) {
    super(config);
    this.provider = 'fixer';
  }

  // Fetch the latest exchange rates from Fixer.io
  async fetchLatestRates(options = {}) {
    // Default to EUR because free tier only supports EUR as base
    const base = options.base || 'EUR';
    const url = `${this.baseUrl}/latest`;

    // Use retry mechanism for reliability
    return this.retry(async () => {
      const response = await axios.get(url, {
        timeout: this.timeout,
        params: {
          access_key: this.apiKey,  // API key sent as query parameter
          base: base                // Base currency (limited to EUR on free tier)
        },
        headers: {
          'User-Agent': 'CurrencyExchangeHub/1.0'
        }
      });

      // Fixer uses a 'success' field to indicate if the request worked
      if (!response.data.success) {
        const error = response.data.error;
        throw new Error(error?.info || 'API request failed');
      }

      // Return data in our standard format
      return {
        base: response.data.base,          // Should be "EUR" on free tier
        timestamp: response.data.timestamp, // Unix timestamp of when rates were updated
        rates: response.data.rates         // Object like {USD: 1.08, GBP: 0.86, ...}
      };
    });
  }

  // Get API usage information
  async getUsageMetrics() {
    // Fixer.io doesn't include usage data in API responses
    // You would need to track API calls locally or check their dashboard
    return {
      callsRemaining: null,  // Unknown without external tracking
      limit: 100,            // Free tier allows 100 requests per month
      resetAt: null          // Resets monthly but exact date not provided
    };
  }
}

export default FixerIO;
