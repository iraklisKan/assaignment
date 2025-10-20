/**
 * ExchangeRate-API Integration Tests
 * Tests for ExchangeRate-API provider
 */

import ExchangeRateAPI from '../../src/integrations/ExchangeRateAPI.js';

describe('ExchangeRateAPI Integration', () => {
  let integration;
  const mockConfig = {
    id: 'test-id-123',
    name: 'Test ExchangeRate-API',
    provider: 'exchangerate-api',
    base_url: 'https://v6.exchangerate-api.com',
    api_key_enc: null, // Will be set per test
    priority: 1,
    poll_interval_seconds: 300,
  };

  beforeEach(() => {
    integration = new ExchangeRateAPI(mockConfig);
  });

  describe('Constructor', () => {
    it('should create instance with correct config', () => {
      expect(integration).toBeInstanceOf(ExchangeRateAPI);
      expect(integration.config).toEqual(mockConfig);
    });

    it('should inherit from BaseIntegration', () => {
      expect(integration.fetchRates).toBeDefined();
      expect(integration.buildUrl).toBeDefined();
    });
  });

  describe('buildUrl', () => {
    it('should build correct URL with API key', () => {
      const url = integration.buildUrl('test-api-key-123', 'USD');
      expect(url).toBe('https://v6.exchangerate-api.com/v6/test-api-key-123/latest/USD');
    });

    it('should default to USD if no base currency provided', () => {
      const url = integration.buildUrl('test-api-key-123');
      expect(url).toBe('https://v6.exchangerate-api.com/v6/test-api-key-123/latest/USD');
    });

    it('should handle different base currencies', () => {
      const url = integration.buildUrl('test-key', 'EUR');
      expect(url).toBe('https://v6.exchangerate-api.com/v6/test-key/latest/EUR');
    });
  });

  describe('parseResponse', () => {
    it('should parse successful API response', () => {
      const mockResponse = {
        result: 'success',
        base_code: 'USD',
        conversion_rates: {
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.50,
        },
      };

      const rates = integration.parseResponse(mockResponse);

      expect(rates).toHaveLength(3);
      expect(rates[0]).toEqual({
        base: 'USD',
        target: 'EUR',
        rate: '0.92',
      });
      expect(rates[1]).toEqual({
        base: 'USD',
        target: 'GBP',
        rate: '0.79',
      });
      expect(rates[2]).toEqual({
        base: 'USD',
        target: 'JPY',
        rate: '149.5', // Note: JavaScript converts 149.50 to 149.5
      });
    });

    it('should handle empty conversion rates', () => {
      const mockResponse = {
        result: 'success',
        base_code: 'USD',
        conversion_rates: {},
      };

      const rates = integration.parseResponse(mockResponse);
      expect(rates).toEqual([]);
    });

    it('should throw error for failed API response', () => {
      const mockResponse = {
        result: 'error',
        'error-type': 'unsupported-code',
      };

      expect(() => {
        integration.parseResponse(mockResponse);
      }).toThrow('unsupported-code');
    });

    it('should handle numeric rates correctly', () => {
      const mockResponse = {
        result: 'success',
        base_code: 'USD',
        conversion_rates: {
          EUR: 0.923456,
          GBP: 1,
        },
      };

      const rates = integration.parseResponse(mockResponse);

      expect(rates[0].rate).toBe('0.923456');
      expect(rates[1].rate).toBe('1');
    });
  });

  describe('Integration name and metadata', () => {
    it('should have correct provider name', () => {
      expect(integration.config.provider).toBe('exchangerate-api');
    });

    it('should support configuration updates', () => {
      const newConfig = { ...mockConfig, priority: 50 };
      integration.config = newConfig;
      
      expect(integration.config.priority).toBe(50);
    });
  });
});
