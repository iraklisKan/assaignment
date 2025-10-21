import { query } from '../config/database.js';
import { getCacheClient } from '../config/redis.js';
import { AppError } from '../middleware/errorHandler.js';
import { logConversion } from './usageService.js';
import { validateCurrencyCode, validateDate } from '../utils/validation.js';

/**
 * Calculate data freshness and add warning if stale
 */
function addDataFreshnessInfo(result, timestamp) {
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
}

/**
 * Get list of available currencies
 */
export async function getAvailableCurrencies() {
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
}

/**
 * Get latest rates from cache or database
 */
export async function getLatestRates(filters = {}) {
  const { base, target, q } = filters;
  const cache = getCacheClient();

  // If specific pair requested, try cache first
  if (base && target) {
    validateCurrencyCode(base);
    validateCurrencyCode(target);
    
    const pair = `${base}-${target}`;
    const cacheKey = `rates:${pair}`;
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return [JSON.parse(cached)];
      }
    } catch (error) {
      console.warn('Cache read error:', error.message);
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
}

/**
 * Get historical rates
 */
export async function getHistoricalRates(filters = {}) {
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
}

/**
 * Convert currency amount
 */
export async function convertCurrency(from, to, amount) {
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

  // Get rate from latest rates
  const pair = `${from.toUpperCase()}-${to.toUpperCase()}`;
  const cache = getCacheClient();

  try {
    const cached = await cache.get(`rates:${pair}`);
    if (cached) {
      const data = JSON.parse(cached);
      const result = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount: amountNum,
        result: amountNum * data.rate,
        rate: data.rate,
        timestamp: data.fetched_at
      };
      return addDataFreshnessInfo(result, data.fetched_at);
    }
  } catch (error) {
    console.warn('Cache read error:', error.message);
  }

  // Fallback to database
  const sql = `
    SELECT rate, fetched_at
    FROM rates_latest
    WHERE pair = $1
  `;

  const result = await query(sql, [pair]);

  if (result.rows.length === 0) {
    // Try cross-rate conversion through any available base currency
    // Base currencies we fetch rates for: USD, EUR, GBP, JPY
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
        
        const convertedResult = {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          amount: amountNum,
          result: amountNum * crossRate,
          rate: crossRate,
          timestamp: new Date(),
          via: base, // Indicate which base currency was used for calculation
          crossRate: true
        };
        
        // Add freshness info (cross-rate uses current timestamp, so always fresh)
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
    }
    
    throw new AppError(`Exchange rate not available for ${pair}. No cross-rate path found.`, 404);
  }

  const { rate, fetched_at } = result.rows[0];

  const convertedResult = {
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    amount: amountNum,
    result: amountNum * parseFloat(rate),
    rate: parseFloat(rate),
    timestamp: fetched_at
  };

  // Add data freshness information
  addDataFreshnessInfo(convertedResult, fetched_at);

  // Log the conversion (don't await to avoid slowing down response)
  logConversion(
    convertedResult.from,
    convertedResult.to,
    convertedResult.amount,
    convertedResult.result,
    convertedResult.rate
  ).catch(err => console.warn('Failed to log conversion:', err.message));

  return convertedResult;
}

/**
 * Update latest rate in database and cache
 */
export async function updateLatestRate(base, target, rate, sourceIntegrationId) {
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
  const cache = getCacheClient();
  const cacheKey = `rates:${pair}`;
  const cacheData = JSON.stringify({
    pair,
    base,
    target,
    rate,
    fetched_at: now,
    source_integration_id: sourceIntegrationId
  });

  try {
    await cache.set(cacheKey, cacheData, { EX: 3600 }); // 1 hour TTL
  } catch (error) {
    console.warn('Cache write error:', error.message);
  }
}

/**
 * Save rate to history
 */
export async function saveRateHistory(base, target, rate, sourceIntegrationId) {
  const sql = `
    INSERT INTO rates_history (base, target, rate, fetched_at, source_integration_id)
    VALUES ($1, $2, $3, $4, $5)
  `;

  await query(sql, [base, target, rate, new Date(), sourceIntegrationId]);
}

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

