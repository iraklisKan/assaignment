/*
 * =============================================================================
 * CURRENCYLAYER INTEGRATION
 * =============================================================================
 * Connects to CurrencyLayer (https://currencylayer.com)
 * 
 * Provider details:
 * - Free tier: 100 requests per month
 * - Requires sign-up with email
 * - API Documentation: https://currencylayer.com/documentation
 * 
 * IMPORTANT LIMITATION:
 * ⚠ The free tier ONLY supports USD as the base currency
 *   (Cannot fetch rates based on EUR, GBP, etc.)
 *   Paid plans unlock other base currencies
 * 
 * QUIRK TO HANDLE:
 * CurrencyLayer returns rates in a weird format: "USDEUR" instead of just "EUR"
 * We need to strip the source currency prefix to normalize the data
 * 
 * API Format: http://api.currencylayer.com/live?access_key={YOUR-KEY}&source=USD
 * =============================================================================
 */

import axios from 'axios';
import { BaseIntegration } from './BaseIntegration.js';

export class CurrencyLayer extends BaseIntegration {
  constructor(config) {
    super(config);
    this.provider = 'currencylayer';
  }

  // Fetch the latest exchange rates from CurrencyLayer
  async fetchLatestRates(options = {}) {
    // Default to USD because free tier only supports USD as base
    const base = options.base || 'USD';
    const url = `${this.baseUrl}/live`;

    // Use retry mechanism for reliability
    return this.retry(async () => {
      const response = await axios.get(url, {
        timeout: this.timeout,
        params: {
          access_key: this.apiKey,  // API key sent as query parameter
          source: base              // Base currency (must be USD on free tier)
        },
        headers: {
          'User-Agent': 'CurrencyExchangeHub/1.0'
        }
      });

      // Check if API request was successful
      if (!response.data.success) {
        const error = response.data.error;
        throw new Error(error?.info || 'API request failed');
      }

      // CurrencyLayer has a quirky format - rates come as "USDEUR": 0.92
      // We need to transform this to just "EUR": 0.92 to match other providers
      const rates = {};
      const source = response.data.source;  // The base currency (usually "USD")
      
      for (const [key, value] of Object.entries(response.data.quotes)) {
        // Strip the source prefix from the currency code
        // Example: "USDEUR" becomes "EUR", "USDGBP" becomes "GBP"
        const targetCurrency = key.substring(source.length);
        rates[targetCurrency] = value;
      }

      // Return data in our standard format (now properly normalized)
      return {
        base: response.data.source,        // "USD" on free tier
        timestamp: response.data.timestamp, // Unix timestamp
        rates: rates                       // Clean format: {EUR: 0.92, GBP: 0.79, ...}
      };
    });
  }

  // Get API usage information
  async getUsageMetrics() {
    // CurrencyLayer doesn't provide usage data in API responses
    // Track calls locally or check their web dashboard
    return {
      callsRemaining: null,  // Not available from API
      limit: 100,            // Free tier: 100 requests per month
      resetAt: null          // Resets monthly but exact time not provided
    };
  }
}

export default CurrencyLayer;
