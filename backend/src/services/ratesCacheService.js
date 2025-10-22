import { getCacheClient } from '../config/redis.js';

/**
 * Rate Caching Service
 * Handles all Redis cache operations for exchange rates
 */

const CACHE_TTL = 3600; // 1 hour

/**
 * Get rate from cache
 */
export async function getRateFromCache(pair) {
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
}

/**
 * Set rate in cache
 */
export async function setRateInCache(pair, data, ttl = CACHE_TTL) {
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
}

/**
 * Update rate in database and cache (combined operation)
 */
export async function cacheRate(base, target, rate, sourceIntegrationId) {
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
}

/**
 * Invalidate cache for a specific pair
 */
export async function invalidateCachePair(pair) {
  const cache = getCacheClient();
  const cacheKey = `rates:${pair}`;
  
  try {
    await cache.del(cacheKey);
    return true;
  } catch (error) {
    console.warn('Cache delete error:', error.message);
    return false;
  }
}

/**
 * Invalidate all rate caches
 */
export async function invalidateAllRateCache() {
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
}

export default {
  getRateFromCache,
  setRateInCache,
  cacheRate,
  invalidateCachePair,
  invalidateAllRateCache
};
