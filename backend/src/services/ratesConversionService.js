import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { validateCurrencyCode } from '../utils/validation.js';
import { logConversion } from './usageService.js';
import { getRateFromCache } from './ratesCacheService.js';

/**
 * Rates Conversion Service
 * Handles currency conversion with direct rates and cross-rate fallback
 */

/**
 * Calculate data freshness and add warning if stale
 * @param {Object} result - The result object to add freshness info to
 * @param {Date|string} timestamp - The timestamp of the data
 * @returns {Object} The result object with freshness information added
 */
export const addDataFreshnessInfo = (result, timestamp) => {
  const now = new Date();
  const dataTime = new Date(timestamp);
  const ageMinutes = Math.floor((now - dataTime) / 1000 / 60);
  
  // Add age information
  result.dataAgeMinutes = ageMinutes;
  
  // Add human-readable age
  if (ageMinutes < 1) {
    result.dataAge = 'just now';
  } else if (ageMinutes < 60) {
    result.dataAge = `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
  } else {
    const ageHours = Math.floor(ageMinutes / 60);
    result.dataAge = `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
  }
  
  // Add warning if data is stale (older than 1 hour)
  if (ageMinutes > 60) {
    result.stale = true;
    result.warning = 'Exchange rate data may be outdated. Please check if integrations are active.';
  }
  
  return result;
};

/**
 * Get rate for a specific currency pair (cache → database)
 * @async
 * @param {string} pair - Currency pair (e.g., "USD-EUR")
 * @returns {Promise<Object|null>} Rate object with rate and fetched_at, or null if not found
 */
const getRate = async (pair) => {
  // Try cache first
  const cached = await getRateFromCache(pair);
  if (cached) {
    return {
      rate: cached.rate,
      fetched_at: cached.fetched_at
    };
  }
  
  // Fallback to database
  const sql = `SELECT rate, fetched_at FROM rates_latest WHERE pair = $1`;
  const result = await query(sql, [pair]);
  
  if (result.rows.length > 0) {
    return {
      rate: parseFloat(result.rows[0].rate),
      fetched_at: result.rows[0].fetched_at
    };
  }
  
  return null;
};

/**
 * Try to find cross-rate through common base currencies
 * @async
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @returns {Promise<Object|null>} Cross-rate object with rate, via, and crossRate flag, or null if not found
 */
const getCrossRate = async (from, to) => {
  const baseCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
  
  for (const base of baseCurrencies) {
    // Try: FROM→BASE + BASE→TO
    const fromBasePair = `${base}-${from.toUpperCase()}`;
    const toBasePair = `${base}-${to.toUpperCase()}`;
    
    const fromBaseResult = await query(`SELECT rate FROM rates_latest WHERE pair = $1`, [fromBasePair]);
    const toBaseResult = await query(`SELECT rate FROM rates_latest WHERE pair = $1`, [toBasePair]);
    
    if (fromBaseResult.rows.length > 0 && toBaseResult.rows.length > 0) {
      // Cross-rate calculation: (1/FROM_BASE_RATE) * TO_BASE_RATE
      // Example: THB→EUR via USD: (1/USD-THB rate) * (USD-EUR rate)
      const fromBaseRate = parseFloat(fromBaseResult.rows[0].rate);
      const toBaseRate = parseFloat(toBaseResult.rows[0].rate);
      const crossRate = (1 / fromBaseRate) * toBaseRate;
      
      return {
        rate: crossRate,
        via: base,
        crossRate: true
      };
    }
  }
  
  return null;
};

/**
 * Convert currency amount with direct or cross-rate
 * @async
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @param {number|string} amount - Amount to convert
 * @returns {Promise<Object>} Conversion result with amount, rate, and converted value
 * @throws {AppError} If parameters are invalid or rate not found
 */
export const convertCurrency = async (from, to, amount) => {
  if (!from || !to || !amount) {
    throw new AppError('from, to, and amount parameters are required', 400);
  }

  validateCurrencyCode(from);
  validateCurrencyCode(to);

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new AppError('amount must be a positive number', 400);
  }

  // If same currency, return as-is
  if (from.toUpperCase() === to.toUpperCase()) {
    return {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: amountNum,
      result: amountNum,
      rate: 1,
      timestamp: new Date()
    };
  }

  // Try direct rate
  const pair = `${from.toUpperCase()}-${to.toUpperCase()}`;
  const directRate = await getRate(pair);
  
  if (directRate) {
    const convertedResult = {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: amountNum,
      result: amountNum * directRate.rate,
      rate: directRate.rate,
      timestamp: directRate.fetched_at
    };
    
    addDataFreshnessInfo(convertedResult, directRate.fetched_at);
    
    // Log the conversion (async, don't wait)
    logConversion(
      convertedResult.from,
      convertedResult.to,
      convertedResult.amount,
      convertedResult.result,
      convertedResult.rate
    ).catch(err => console.warn('Failed to log conversion:', err.message));
    
    return convertedResult;
  }
  
  // Try cross-rate
  const crossRate = await getCrossRate(from, to);
  
  if (crossRate) {
    const convertedResult = {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: amountNum,
      result: amountNum * crossRate.rate,
      rate: crossRate.rate,
      timestamp: new Date(),
      via: crossRate.via,
      crossRate: true
    };
    
    addDataFreshnessInfo(convertedResult, new Date());
    
    // Log the conversion
    logConversion(
      convertedResult.from,
      convertedResult.to,
      convertedResult.amount,
      convertedResult.result,
      convertedResult.rate
    ).catch(err => console.warn('Failed to log conversion:', err.message));
    
    return convertedResult;
  }
  
  // No rate found
  throw new AppError(`Exchange rate not available for ${pair}. No cross-rate path found.`, 404);
};

export default {
  convertCurrency,
  addDataFreshnessInfo
};
