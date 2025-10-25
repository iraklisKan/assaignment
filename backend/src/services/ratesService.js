import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { validateCurrencyCode, validateDate } from '../utils/validation.js';
import { getRateFromCache, setRateInCache } from './ratesCacheService.js';
import { convertCurrency as convertCurrencyService } from './ratesConversionService.js';

/**
 * Core Rates Service
 * Handles database operations for exchange rates (reading and writing)
 * Caching logic → ratesCacheService.js
 * Conversion logic → ratesConversionService.js
 */

/**
 * Get list of available currencies
 * @returns {Promise<string[]>} Array of currency codes
 */
export const getAvailableCurrencies = async () => {
  const sql = `
    SELECT DISTINCT base as code
    FROM rates_latest
    UNION
    SELECT DISTINCT target as code
    FROM rates_latest
    ORDER BY code ASC
  `;

  const result = await query(sql);
  return result.rows.map(row => row.code);
};

/**
 * Get list of configured base currencies from environment variable
 * @returns {Promise<string[]>} Array of base currency codes
 */
export const getConfiguredBaseCurrencies = async () => {
  // Get base currencies from environment variable
  let baseCurrencies = ['USD', 'EUR', 'GBP', 'JPY']; // Default
  
  if (process.env.BASE_CURRENCIES) {
    const envValue = process.env.BASE_CURRENCIES.trim().toUpperCase();
    
    if (envValue === 'ALL') {
      // Return all available currencies from database
      return await getAvailableCurrencies();
    } else {
      // Parse comma-separated list
      baseCurrencies = envValue.split(',').map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  
  return baseCurrencies;
};

/**
 * Get latest rates from cache or database
 * @param {Object} filters - Filter options
 * @param {string} [filters.base] - Base currency code
 * @param {string} [filters.target] - Target currency code
 * @param {string} [filters.q] - Search query
 * @returns {Promise<Array>} Array of rate objects
 */
export const getLatestRates = async (filters = {}) => {
  const { base, target, q } = filters;

  // If specific pair requested, try cache first
  if (base && target) {
    validateCurrencyCode(base);
    validateCurrencyCode(target);
    
    const pair = `${base}-${target}`;
    const cached = await getRateFromCache(pair);
    
    if (cached) {
      return [cached];
    }
  }

  // Query database
  let sql = `
    SELECT pair, base, target, rate, fetched_at, source_integration_id
    FROM rates_latest
  `;

  const conditions = [];
  const values = [];

  if (base) {
    conditions.push(`base = $${values.length + 1}`);
    values.push(base.toUpperCase());
  }

  if (target) {
    conditions.push(`target = $${values.length + 1}`);
    values.push(target.toUpperCase());
  }

  if (q) {
    conditions.push(`pair ILIKE $${values.length + 1}`);
    values.push(`%${q}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY fetched_at DESC LIMIT 100';

  const result = await query(sql, values);
  return result.rows;
};

/**
 * Get historical rates
 * @param {Object} filters - Filter options
 * @param {string} filters.base - Base currency code (required)
 * @param {string} filters.target - Target currency code (required)
 * @param {string} [filters.start] - Start date (YYYY-MM-DD)
 * @param {string} [filters.end] - End date (YYYY-MM-DD)
 * @param {number} [filters.limit=1000] - Maximum number of records
 * @returns {Promise<Array>} Array of historical rate objects
 */
export const getHistoricalRates = async (filters = {}) => {
  const { base, target, start, end, limit = 1000 } = filters;

  if (!base || !target) {
    throw new AppError('base and target parameters are required', 400);
  }

  validateCurrencyCode(base);
  validateCurrencyCode(target);

  if (start && !validateDate(start)) {
    throw new AppError('Invalid start date format (use YYYY-MM-DD)', 400);
  }

  if (end && !validateDate(end)) {
    throw new AppError('Invalid end date format (use YYYY-MM-DD)', 400);
  }

  let sql = `
    SELECT id, base, target, rate, fetched_at, source_integration_id
    FROM rates_history
    WHERE base = $1 AND target = $2
  `;

  const values = [base.toUpperCase(), target.toUpperCase()];

  if (start) {
    values.push(start);
    sql += ` AND fetched_at >= $${values.length}::date`;
  }

  if (end) {
    values.push(end);
    sql += ` AND fetched_at <= ($${values.length}::date + interval '1 day')`;
  }

  sql += ` ORDER BY fetched_at DESC LIMIT $${values.length + 1}`;
  values.push(limit);

  const result = await query(sql, values);
  return result.rows;
};

/**
 * Convert currency amount (delegates to conversion service)
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @param {number} amount - Amount to convert
 * @returns {Promise<Object>} Conversion result
 */
export const convertCurrency = async (from, to, amount) => {
  return convertCurrencyService(from, to, amount);
};

/**
 * Update latest rate in database and cache
 * @param {string} base - Base currency code
 * @param {string} target - Target currency code
 * @param {number} rate - Exchange rate
 * @param {string} sourceIntegrationId - Integration ID that provided the rate
 * @returns {Promise<void>}
 */
export const updateLatestRate = async (base, target, rate, sourceIntegrationId) => {
  const pair = `${base}-${target}`;
  const now = new Date();

  const sql = `
    INSERT INTO rates_latest (pair, base, target, rate, fetched_at, source_integration_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (pair) DO UPDATE
    SET rate = $4, fetched_at = $5, source_integration_id = $6
  `;

  await query(sql, [pair, base, target, rate, now, sourceIntegrationId]);

  // Update cache
  const cacheData = {
    pair,
    base,
    target,
    rate,
    fetched_at: now,
    source_integration_id: sourceIntegrationId
  };
  
  await setRateInCache(pair, cacheData);
};

/**
 * Save rate to history
 * @param {string} base - Base currency code
 * @param {string} target - Target currency code
 * @param {number} rate - Exchange rate
 * @param {string} sourceIntegrationId - Integration ID that provided the rate
 * @returns {Promise<void>}
 */
export const saveRateHistory = async (base, target, rate, sourceIntegrationId) => {
  const sql = `
    INSERT INTO rates_history (base, target, rate, fetched_at, source_integration_id)
    VALUES ($1, $2, $3, $4, $5)
  `;

  await query(sql, [base, target, rate, new Date(), sourceIntegrationId]);
};

// Default export for backwards compatibility with tests
export default {
  getAvailableCurrencies,
  getLatestRates,
  getHistoricalRates,
  getRateHistory: getHistoricalRates, // Alias for backwards compatibility
  convertCurrency,
  updateLatestRate,
  saveRates: updateLatestRate, // Alias
  saveRateHistory,
};

