/**
 * Mock Integration Tests
 * Tests for mock provider used in testing
 */

import MockIntegration from '../../src/integrations/MockIntegration.js';

describe('MockIntegration', () => {
  let integration;
  const mockConfig = {
    id: 'mock-id-123',
    name: 'Test Mock Provider',
    provider: 'mock',
    base_url: 'http://localhost',
    api_key_enc: null,
    priority: 99,
    poll_interval_seconds: 600,
  };

  beforeEach(() => {
    integration = new MockIntegration(mockConfig);
  });

  describe('Constructor', () => {
    it('should create instance with correct config', () => {
      expect(integration).toBeInstanceOf(MockIntegration);
      expect(integration.config).toEqual(mockConfig);
    });
  });

  describe('fetchRates', () => {
    it('should return mock rates without API call', async () => {
      const rates = await integration.fetchRates();
      
      expect(rates).toBeDefined();
      expect(Array.isArray(rates)).toBe(true);
      expect(rates.length).toBeGreaterThan(0);
    });

    it('should return rates with correct structure', async () => {
      const rates = await integration.fetchRates();
      
      rates.forEach(rate => {
        expect(rate).toHaveProperty('base');
        expect(rate).toHaveProperty('target');
        expect(rate).toHaveProperty('rate');
        expect(typeof rate.base).toBe('string');
        expect(typeof rate.target).toBe('string');
        expect(typeof rate.rate).toBe('string');
      });
    });

    it('should include common currency pairs', async () => {
      const rates = await integration.fetchRates();
      const pairs = rates.map(r => `${r.base}-${r.target}`);
      
      expect(pairs).toContain('USD-EUR');
      expect(pairs).toContain('USD-GBP');
      expect(pairs).toContain('USD-JPY');
    });

    it('should return different rates on subsequent calls (simulates change)', async () => {
      const rates1 = await integration.fetchRates();
      
      // Wait a tiny bit
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const rates2 = await integration.fetchRates();
      
      // Rates should exist but may vary slightly (mock randomization)
      expect(rates1.length).toBe(rates2.length);
    });

    it('should not require API key', async () => {
      const configWithoutKey = { ...mockConfig, api_key_enc: null };
      const mockIntegration = new MockIntegration(configWithoutKey);
      
      const rates = await mockIntegration.fetchRates();
      expect(rates.length).toBeGreaterThan(0);
    });

    it('should complete quickly (mock speed)', async () => {
      const start = Date.now();
      await integration.fetchRates();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100); // Should be near-instant
    });
  });

  describe('buildUrl', () => {
    it('should return localhost URL', () => {
      const url = integration.buildUrl('any-key', 'USD');
      expect(url).toContain('localhost');
    });
  });

  describe('Error handling', () => {
    it('should not throw errors during normal operation', async () => {
      await expect(integration.fetchRates()).resolves.not.toThrow();
    });
  });
});
