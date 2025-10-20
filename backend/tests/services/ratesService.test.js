/**
 * Rates Service Tests
 * Tests for rate fetching and caching logic
 */

import ratesService from '../../src/services/ratesService.js';
import { jest } from '@jest/globals';

// Mock database
const mockQuery = jest.fn();
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: { query: mockQuery },
  query: mockQuery,
}));

// Mock Redis
const mockGet = jest.fn();
const mockSetex = jest.fn();
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  default: { get: mockGet, setex: mockSetex, connected: true },
  get: mockGet,
  setex: mockSetex,
  connected: true,
}));

const db = { query: mockQuery };
const redis = { get: mockGet, setex: mockSetex, connected: true };

describe('Rates Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestRates', () => {
    it('should return rates from cache if available', async () => {
      const cachedRates = JSON.stringify([
        { base: 'USD', target: 'EUR', rate: '0.92' },
        { base: 'USD', target: 'GBP', rate: '0.79' },
      ]);

      redis.get.mockResolvedValue(cachedRates);

      const result = await ratesService.getLatestRates('USD');

      expect(redis.get).toHaveBeenCalledWith('rates:USD');
      expect(db.query).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should query database if cache miss', async () => {
      redis.get.mockResolvedValue(null);
      db.query.mockResolvedValue({
        rows: [
          { base: 'USD', target: 'EUR', rate: '0.92', fetched_at: new Date() },
        ],
      });

      const result = await ratesService.getLatestRates('USD');

      expect(redis.get).toHaveBeenCalled();
      expect(db.query).toHaveBeenCalled();
      expect(redis.setex).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should handle database errors gracefully', async () => {
      redis.get.mockResolvedValue(null);
      db.query.mockRejectedValue(new Error('Database error'));

      await expect(ratesService.getLatestRates('USD')).rejects.toThrow('Database error');
    });

    it('should filter by base currency', async () => {
      redis.get.mockResolvedValue(null);
      db.query.mockResolvedValue({ rows: [] });

      await ratesService.getLatestRates('EUR');

      const queryCall = db.query.mock.calls[0][0];
      expect(queryCall).toContain('base = $1');
    });
  });

  describe('getHistoricalRates', () => {
    it('should query historical data within date range', async () => {
      db.query.mockResolvedValue({
        rows: [
          { base: 'USD', target: 'EUR', rate: '0.92', fetched_at: '2024-01-01' },
          { base: 'USD', target: 'EUR', rate: '0.93', fetched_at: '2024-01-02' },
        ],
      });

      const result = await ratesService.getHistoricalRates({
        base: 'USD',
        target: 'EUR',
        start: '2024-01-01',
        end: '2024-01-31',
      });

      expect(db.query).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should handle missing optional parameters', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await ratesService.getHistoricalRates({
        base: 'USD',
      });

      expect(db.query).toHaveBeenCalled();
    });
  });

  describe('convertCurrency', () => {
    it('should convert amount using latest rate', async () => {
      redis.get.mockResolvedValue(JSON.stringify([
        { base: 'USD', target: 'EUR', rate: '0.92' },
      ]));

      const result = await ratesService.convertCurrency('USD', 'EUR', 100);

      expect(result.from).toBe('USD');
      expect(result.to).toBe('EUR');
      expect(result.amount).toBe(100);
      expect(result.result).toBe(92);
      expect(result.rate).toBe(0.92);
    });

    it('should throw error if rate not found', async () => {
      redis.get.mockResolvedValue(null);
      db.query.mockResolvedValue({ rows: [] });

      await expect(
        ratesService.convertCurrency('USD', 'XYZ', 100)
      ).rejects.toThrow('not found');
    });

    it('should handle same currency conversion', async () => {
      const result = await ratesService.convertCurrency('USD', 'USD', 100);

      expect(result.result).toBe(100);
      expect(result.rate).toBe(1);
    });
  });

  describe('Cache management', () => {
    it('should cache rates with 1 hour TTL', async () => {
      redis.get.mockResolvedValue(null);
      db.query.mockResolvedValue({
        rows: [{ base: 'USD', target: 'EUR', rate: '0.92' }],
      });

      await ratesService.getLatestRates('USD');

      expect(redis.setex).toHaveBeenCalledWith(
        'rates:USD',
        3600,
        expect.any(String)
      );
    });

    it('should work without Redis (fallback)', async () => {
      redis.get.mockRejectedValue(new Error('Redis unavailable'));
      redis.connected = false;
      
      db.query.mockResolvedValue({
        rows: [{ base: 'USD', target: 'EUR', rate: '0.92' }],
      });

      const result = await ratesService.getLatestRates('USD');

      expect(result).toHaveLength(1);
      expect(db.query).toHaveBeenCalled();
    });
  });
});
