/**
 * ratesCacheService Tests
 * Tests for Redis caching operations
 */

import { jest } from '@jest/globals';

// Mock Redis client
const mockGet = jest.fn();
const mockSetex = jest.fn();
const mockDel = jest.fn();

jest.unstable_mockModule('../../src/config/redis.js', () => ({
  default: { 
    get: mockGet, 
    setex: mockSetex, 
    del: mockDel,
    connected: true 
  }
}));

const { default: ratesCacheService } = await import('../../src/services/ratesCacheService.js');

describe('ratesCacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCachedRate', () => {
    it('should return cached rate data when available', async () => {
      const mockCacheData = {
        rate: 0.855,
        updated_at: '2024-01-15T10:30:00Z'
      };
      mockGet.mockResolvedValue(JSON.stringify(mockCacheData));

      const result = await ratesCacheService.getCachedRate('USD', 'EUR');

      expect(mockGet).toHaveBeenCalledWith('rate:USD:EUR');
      expect(result).toEqual(mockCacheData);
    });

    it('should return null when cache is empty', async () => {
      mockGet.mockResolvedValue(null);

      const result = await ratesCacheService.getCachedRate('USD', 'EUR');

      expect(mockGet).toHaveBeenCalledWith('rate:USD:EUR');
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockGet.mockResolvedValue('invalid json');

      const result = await ratesCacheService.getCachedRate('USD', 'EUR');

      expect(result).toBeNull();
    });

    it('should handle Redis connection errors', async () => {
      mockGet.mockRejectedValue(new Error('Redis connection failed'));

      const result = await ratesCacheService.getCachedRate('USD', 'EUR');

      expect(result).toBeNull();
    });
  });

  describe('cacheRate', () => {
    it('should cache rate data with default TTL', async () => {
      const rateData = {
        rate: 0.855,
        updated_at: '2024-01-15T10:30:00Z'
      };
      mockSetex.mockResolvedValue('OK');

      await ratesCacheService.cacheRate('USD', 'EUR', rateData);

      expect(mockSetex).toHaveBeenCalledWith(
        'rate:USD:EUR',
        300,
        JSON.stringify(rateData)
      );
    });

    it('should cache rate data with custom TTL', async () => {
      const rateData = {
        rate: 0.855,
        updated_at: '2024-01-15T10:30:00Z'
      };
      const customTTL = 600;
      mockSetex.mockResolvedValue('OK');

      await ratesCacheService.cacheRate('USD', 'EUR', rateData, customTTL);

      expect(mockSetex).toHaveBeenCalledWith(
        'rate:USD:EUR',
        customTTL,
        JSON.stringify(rateData)
      );
    });

    it('should handle caching errors gracefully', async () => {
      const rateData = {
        rate: 0.855,
        updated_at: '2024-01-15T10:30:00Z'
      };
      mockSetex.mockRejectedValue(new Error('Redis write failed'));

      await expect(
        ratesCacheService.cacheRate('USD', 'EUR', rateData)
      ).resolves.not.toThrow();
    });
  });

  describe('clearRateCache', () => {
    it('should delete cache for specific currency pair', async () => {
      mockDel.mockResolvedValue(1);

      await ratesCacheService.clearRateCache('USD', 'EUR');

      expect(mockDel).toHaveBeenCalledWith('rate:USD:EUR');
    });

    it('should handle cache miss when clearing', async () => {
      mockDel.mockResolvedValue(0);

      await ratesCacheService.clearRateCache('USD', 'EUR');

      expect(mockDel).toHaveBeenCalledWith('rate:USD:EUR');
    });

    it('should handle deletion errors gracefully', async () => {
      mockDel.mockRejectedValue(new Error('Redis delete failed'));

      await expect(
        ratesCacheService.clearRateCache('USD', 'EUR')
      ).resolves.not.toThrow();
    });
  });
});
