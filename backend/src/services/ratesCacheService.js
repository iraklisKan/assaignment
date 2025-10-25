import { getCacheClient } from '../config/redis.js';

/**
 * Rate Caching Service
 * Handles all Redis cache operations for exchange rates
 */

const CACHE_TTL = 3600; // 1 hour

/**
 * Get rate from cache
 * @param {string} pair - Currency pair (e.g., "USD-EUR")
 * @returns {Promise<Object|null>} Cached rate data or null
 */
export const getRateFromCache = async (pair) => {
  const cache = getCacheClient();
  const cacheKey = `rates:${pair}`;
  
  try {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.warn('Cache read error:', error.message);
    return null;
  }
};

/**
 * Set rate in cache
 * @param {string} pair - Currency pair (e.g., "USD-EUR")
 * @param {Object} data - Rate data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} True if successful
 */
export const setRateInCache = async (pair, data, ttl = CACHE_TTL) => {
  const cache = getCacheClient();
  const cacheKey = `rates:${pair}`;
  const cacheData = JSON.stringify(data);
  
  try {
    await cache.set(cacheKey, cacheData, { EX: ttl });
    return true;
  } catch (error) {
    console.warn('Cache write error:', error.message);
    return false;
  }
};

/**
 * Update rate in database and cache (combined operation)
 * @param {string} base - Base currency code
 * @param {string} target - Target currency code
 * @param {number} rate - Exchange rate
 * @param {number} sourceIntegrationId - Source integration ID
 * @returns {Promise<Object>} Cached rate data
 */
export const cacheRate = async (base, target, rate, sourceIntegrationId) => {
  const pair = `${base}-${target}`;
  const now = new Date();
  
  const cacheData = {
    pair,
    base,
    target,
    rate,
    fetched_at: now,
    source_integration_id: sourceIntegrationId
  };
  
  await setRateInCache(pair, cacheData);
  return cacheData;
};

/**
 * Invalidate cache for a specific pair
 * @param {string} pair - Currency pair (e.g., "USD-EUR")
 * @returns {Promise<boolean>} True if successful
 */
export const invalidateCachePair = async (pair) => {
  const cache = getCacheClient();
  const cacheKey = `rates:${pair}`;
  
  try {
    await cache.del(cacheKey);
    return true;
  } catch (error) {
    console.warn('Cache delete error:', error.message);
    return false;
  }
};

/**
 * Invalidate all rate caches
 * @returns {Promise<boolean>} True if successful
 */
export const invalidateAllRateCache = async () => {
  const cache = getCacheClient();
  
  try {
    const keys = await cache.keys('rates:*');
    if (keys.length > 0) {
      await cache.del(...keys);
    }
    return true;
  } catch (error) {
    console.warn('Cache clear error:', error.message);
    return false;
  }
};

export default {
  getRateFromCache,
  setRateInCache,
  cacheRate,
  invalidateCachePair,
  invalidateAllRateCache
};
