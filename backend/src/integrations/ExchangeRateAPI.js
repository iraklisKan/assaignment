/*
 * =============================================================================
 * EXCHANGERATE-API INTEGRATION
 * =============================================================================
 * Connects to ExchangeRate-API (https://www.exchangerate-api.com)
 * 
 * Why use this provider:
 * ✓ Best free tier: 1,500 requests per month (vs 100 for others)
 * ✓ No credit card required to sign up
 * ✓ Supports all major currencies as base (USD, EUR, GBP, JPY, etc.)
 * ✓ Simple API - easy to use
 * 
 * How to get started:
 * 1. Visit https://www.exchangerate-api.com
 * 2. Enter your email to get a free API key instantly
 * 3. Add the integration with your API key through the UI
 * 
 * API Format: https://v6.exchangerate-api.com/v6/{YOUR-API-KEY}/latest/{BASE-CURRENCY}
 * =============================================================================
 */

import axios from 'axios';
import { BaseIntegration } from './BaseIntegration.js';

export class ExchangeRateAPI extends BaseIntegration {
  constructor(config) {
    super(config);
    this.provider = 'exchangerate-api';
  }

  // Build the API URL for fetching rates
  buildUrl(apiKey, baseCurrency = 'USD') {
    return `${this.baseUrl}/v6/${apiKey}/latest/${baseCurrency}`;
  }

  // Parse the API response into an array of rate objects
  parseResponse(responseData) {
    // Check if the API returned an error
    if (responseData.result === 'error') {
      throw new Error(responseData['error-type'] || 'API request failed');
    }

    const base = responseData.base_code;
    const rates = responseData.conversion_rates || {};

    // Convert the rates object into an array of {base, target, rate} objects
    return Object.entries(rates).map(([target, rate]) => {
      // Convert rate to string, preserving decimal places as they appear in the input
      let rateStr = String(rate);
      // If it's a whole number (integer), keep it simple without decimals
      if (Number.isInteger(rate)) {
        rateStr = String(rate);
      }
      return {
        base,
        target,
        rate: rateStr,
      };
    });
  }

  // Wrapper method for backwards compatibility with tests
  async fetchRates(baseCurrency = 'USD') {
    const url = this.buildUrl(this.apiKey, baseCurrency);
    
    return this.retry(async () => {
      const axios = (await import('axios')).default;
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'CurrencyExchangeHub/1.0'
        }
      });

      return this.parseResponse(response.data);
    });
  }

  // Fetch the latest exchange rates for a given base currency
  async fetchLatestRates(options = {}) {
    const base = options.base || 'USD';  // Default to USD if not specified
    
    // Build the API URL with the API key embedded in the path
    const url = `${this.baseUrl}/v6/${this.apiKey}/latest/${base}`;

    // Use the retry mechanism from BaseIntegration for reliability
    return this.retry(async () => {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'CurrencyExchangeHub/1.0'  // Identify our application
        }
      });

      // Check if the API returned an error
      if (response.data.result === 'error') {
        throw new Error(response.data['error-type'] || 'API request failed');
      }

      // Transform the API response into our standard format
      return {
        base: response.data.base_code,                  // e.g., "USD"
        timestamp: response.data.time_last_update_unix, // When rates were last updated
        rates: response.data.conversion_rates           // Object like {EUR: 0.92, GBP: 0.79, ...}
      };
    });
  }

  // Get information about how many API calls you have left
  async getUsageMetrics() {
    // Note: Free tier doesn't expose usage data in API responses
    // You'd need to track this locally or upgrade to a paid plan
    return {
      callsRemaining: null,  // Unknown - not provided by API
      limit: 1500,           // We know the monthly limit is 1,500
      resetAt: null          // Unknown - typically resets monthly
    };
  }
}

export default ExchangeRateAPI;
