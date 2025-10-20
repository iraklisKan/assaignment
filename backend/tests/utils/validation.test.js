/**
 * Validation Utility Tests
 * Tests for input validation functions
 */

import {
  validateIntegration,
  validateCurrencyCode,
  validateAmount,
  validateDateRange,
} from '../../src/utils/validation.js';

describe('Validation Utils', () => {
  describe('validateIntegration', () => {
    it('should accept valid integration data', () => {
      const validData = {
        name: 'Test Integration',
        provider: 'exchangerate-api',
        baseUrl: 'https://api.example.com',
        apiKey: 'test-key-123',
        priority: 100,
        pollIntervalSeconds: 300,
      };

      const result = validateIntegration(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject missing name', () => {
      const invalidData = {
        provider: 'exchangerate-api',
        baseUrl: 'https://api.example.com',
      };

      const result = validateIntegration(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('should reject missing provider', () => {
      const invalidData = {
        name: 'Test Integration',
        baseUrl: 'https://api.example.com',
      };

      const result = validateIntegration(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Provider is required');
    });

    it('should reject invalid URL format', () => {
      const invalidData = {
        name: 'Test Integration',
        provider: 'exchangerate-api',
        baseUrl: 'not-a-valid-url',
      };

      const result = validateIntegration(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Base URL must be a valid URL');
    });

    it('should reject priority outside valid range', () => {
      const invalidData = {
        name: 'Test Integration',
        provider: 'exchangerate-api',
        baseUrl: 'https://api.example.com',
        priority: -10,
      };

      const result = validateIntegration(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Priority must be between 1 and 100');
    });

    it('should reject poll interval below minimum', () => {
      const invalidData = {
        name: 'Test Integration',
        provider: 'exchangerate-api',
        baseUrl: 'https://api.example.com',
        pollIntervalSeconds: 30,
      };

      const result = validateIntegration(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Poll interval must be between 60 and 3600 seconds');
    });

    it('should accept optional fields as null', () => {
      const validData = {
        name: 'Test Integration',
        provider: 'exchangerate-api',
        baseUrl: 'https://api.example.com',
        apiKey: null,
        priority: null,
        pollIntervalSeconds: null,
      };

      const result = validateIntegration(validData);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCurrencyCode', () => {
    it('should accept valid 3-letter currency codes', () => {
      const validCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
      
      validCodes.forEach(code => {
        expect(validateCurrencyCode(code)).toBe(true);
      });
    });

    it('should reject invalid currency codes', () => {
      const invalidCodes = ['US', 'EURO', '123', 'us$', '', null, undefined];
      
      invalidCodes.forEach(code => {
        expect(validateCurrencyCode(code)).toBe(false);
      });
    });

    it('should accept lowercase and convert to uppercase', () => {
      expect(validateCurrencyCode('usd')).toBe(true);
      expect(validateCurrencyCode('eur')).toBe(true);
    });
  });

  describe('validateAmount', () => {
    it('should accept valid positive numbers', () => {
      const validAmounts = [1, 100, 0.01, 999999.99, '100', '50.5'];
      
      validAmounts.forEach(amount => {
        expect(validateAmount(amount)).toBe(true);
      });
    });

    it('should reject invalid amounts', () => {
      const invalidAmounts = [0, -10, 'abc', '', null, undefined, NaN, Infinity];
      
      invalidAmounts.forEach(amount => {
        expect(validateAmount(amount)).toBe(false);
      });
    });

    it('should accept very small amounts', () => {
      expect(validateAmount(0.0001)).toBe(true);
    });

    it('should accept very large amounts', () => {
      expect(validateAmount(1000000000)).toBe(true);
    });
  });

  describe('validateDateRange', () => {
    it('should accept valid date range', () => {
      const start = '2024-01-01';
      const end = '2024-01-31';
      
      const result = validateDateRange(start, end);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject end date before start date', () => {
      const start = '2024-01-31';
      const end = '2024-01-01';
      
      const result = validateDateRange(start, end);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('End date must be after start date');
    });

    it('should reject invalid date format', () => {
      const start = '01/01/2024';
      const end = '2024-01-31';
      
      const result = validateDateRange(start, end);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid date format (use YYYY-MM-DD)');
    });

    it('should reject date range longer than 365 days', () => {
      const start = '2024-01-01';
      const end = '2025-12-31';
      
      const result = validateDateRange(start, end);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Date range cannot exceed 365 days');
    });

    it('should accept same start and end date', () => {
      const date = '2024-01-01';
      
      const result = validateDateRange(date, date);
      expect(result.valid).toBe(true);
    });
  });
});
