/**
 * Test Setup Configuration
 * Sets up global test environment and mocks
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_NAME = 'currency_exchange_test';
process.env.DATABASE_USER = 'postgres';
process.env.DATABASE_PASSWORD = 'admin123';
process.env.DATABASE_PORT = '5432';
process.env.APP_DATA_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
