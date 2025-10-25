import { createClient } from 'redis';

let redisClient = null;
let isRedisAvailable = false;

// In-memory LRU cache fallback
class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  async get(key) {
    if (!this.cache.has(key)) return null;
    
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  async set(key, value, options = {}) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
    
    // Handle EX (expiration in seconds)
    if (options.EX) {
      setTimeout(() => {
        this.cache.delete(key);
      }, options.EX * 1000);
    }
  }

  async del(key) {
    this.cache.delete(key);
  }

  async keys(pattern) {
    // Simple pattern matching for asterisk
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async flushAll() {
    this.cache.clear();
  }

  async quit() {
    this.cache.clear();
  }
}

const fallbackCache = new LRUCache(1000);

/**
 * Initialize Redis or fall back to in-memory cache
 * @returns {Promise<Object>} Redis client or fallback cache
 */
export const initRedis = async () => {
  // Skip Redis if REDIS_URL is not set
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.log('⚠️  Redis not configured - using in-memory LRU cache');
    isRedisAvailable = false;
    return fallbackCache;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 3000,
        reconnectStrategy: false // Don't keep retrying
      }
    });

    redisClient.on('error', (err) => {
      if (!isRedisAvailable) {
        // Only log once on initial failure
        console.warn('⚠️  Redis connection failed - using in-memory LRU cache');
      }
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('✓ Redis connected successfully');
      isRedisAvailable = true;
    });

    await redisClient.connect();
    isRedisAvailable = true;
    
    return redisClient;
  } catch (error) {
    console.log('⚠️  Redis unavailable - using in-memory LRU cache');
    isRedisAvailable = false;
    return fallbackCache;
  }
};

/**
 * Get the cache client (Redis or fallback)
 * @returns {Object} Redis client or fallback LRU cache
 */
export const getCacheClient = () => {
  if (isRedisAvailable && redisClient) {
    return redisClient;
  }
  return fallbackCache;
};

/**
 * Check if Redis is actually connected
 * @returns {boolean} True if Redis is available
 */
export const isRedisConnected = () => {
  return isRedisAvailable;
};

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
};

export { redisClient, fallbackCache };
