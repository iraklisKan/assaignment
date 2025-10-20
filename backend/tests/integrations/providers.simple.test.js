/**
 * Integration Provider Tests
 * Tests for integration classes
 */

import { describe, it, expect } from '@jest/globals';
import { ExchangeRateAPI } from '../../src/integrations/ExchangeRateAPI.js';
import { MockIntegration } from '../../src/integrations/MockIntegration.js';

describe('ExchangeRateAPI', () => {
  const mockConfig = {
    id: 'test-id',
    name: 'Test Integration',
    provider: 'exchangerate-api',
    base_url: 'https://v6.exchangerate-api.com',
    api_key_enc: null,
    priority: 1,
    poll_interval_seconds: 300,
  };

  it('should create instance with correct config', () => {
    const integration = new ExchangeRateAPI(mockConfig);
    
    expect(integration).toBeInstanceOf(ExchangeRateAPI);
    expect(integration.provider).toBe('exchangerate-api');
  });

  it('should have baseUrl from config', () => {
    const integration = new ExchangeRateAPI(mockConfig);
    
    expect(integration.baseUrl).toBe('https://v6.exchangerate-api.com');
  });
});

describe('MockIntegration', () => {
  const mockConfig = {
    id: 'mock-id',
    name: 'Mock Provider',
    provider: 'mock',
    base_url: 'http://localhost',
    api_key_enc: null,
    priority: 99,
    poll_interval_seconds: 600,
  };

  it('should create instance', () => {
    const integration = new MockIntegration(mockConfig);
    
    expect(integration).toBeInstanceOf(MockIntegration);
    expect(integration.provider).toBe('mock');
  });

  it('should have fetchLatestRates method', () => {
    const integration = new MockIntegration(mockConfig);
    
    expect(typeof integration.fetchLatestRates).toBe('function');
  });
});
