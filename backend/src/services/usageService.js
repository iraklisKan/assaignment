import { query } from '../config/database.js';

/**
 * Record API usage
 */
export async function recordUsage(integrationId, callsMade = 1, metrics = {}) {
  const today = new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO integration_usage (
      integration_id, date, calls_made, calls_limit, calls_remaining, reset_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (integration_id, date) DO UPDATE
    SET 
      calls_made = integration_usage.calls_made + $3,
      calls_limit = COALESCE($4, integration_usage.calls_limit),
      calls_remaining = COALESCE($5, integration_usage.calls_remaining),
      reset_at = COALESCE($6, integration_usage.reset_at)
  `;

  await query(sql, [
    integrationId,
    today,
    callsMade,
    metrics.limit || null,
    metrics.callsRemaining || null,
    metrics.resetAt || null
  ]);
}

/**
 * Record error
 */
export async function recordError(integrationId, errorMessage) {
  const today = new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO integration_usage (
      integration_id, date, calls_made, last_error, last_error_at
    ) VALUES ($1, $2, 0, $3, $4)
    ON CONFLICT (integration_id, date) DO UPDATE
    SET 
      last_error = $3,
      last_error_at = $4
  `;

  await query(sql, [integrationId, today, errorMessage, new Date()]);
}

/**
 * Get usage statistics for an integration
 */
export async function getUsageStats(integrationId, days = 30) {
  const sql = `
    SELECT 
      date,
      calls_made,
      calls_limit,
      calls_remaining,
      reset_at,
      last_error,
      last_error_at
    FROM integration_usage
    WHERE integration_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY date DESC
  `;

  const result = await query(sql, [integrationId]);
  return result.rows;
}

/**
 * Get today's usage for an integration
 */
export async function getTodayUsage(integrationId) {
  const today = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      calls_made,
      calls_limit,
      calls_remaining,
      reset_at,
      last_error,
      last_error_at
    FROM integration_usage
    WHERE integration_id = $1 AND date = $2
  `;

  const result = await query(sql, [integrationId, today]);
  return result.rows[0] || null;
}

/**
 * Get aggregated usage across all integrations
 */
export async function getAggregatedUsage(days = 7) {
  const sql = `
    SELECT 
      i.id,
      i.name,
      i.provider,
      i.active,
      SUM(iu.calls_made) as total_calls,
      MAX(iu.last_error_at) as last_error_at,
      MAX(iu.last_error) as last_error
    FROM integrations i
    LEFT JOIN integration_usage iu ON i.id = iu.integration_id
      AND iu.date >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY i.id, i.name, i.provider, i.active
    ORDER BY i.priority ASC
  `;

  const result = await query(sql);
  return result.rows;
}

/**
 * Log individual API request (detailed logging)
 */
export async function logRequest(integrationId, baseCurrency, success, responseTimeMs, errorMessage = null) {
  const sql = `
    INSERT INTO rate_requests (
      integration_id, base_currency, success, response_time_ms, error_message
    ) VALUES ($1, $2, $3, $4, $5)
  `;

  await query(sql, [integrationId, baseCurrency, success, responseTimeMs, errorMessage]);
}

/**
 * Get recent API requests for monitoring
 */
export async function getRecentRequests(integrationId = null, limit = 100) {
  let sql = `
    SELECT 
      rr.id,
      rr.integration_id,
      i.name as integration_name,
      rr.base_currency,
      rr.success,
      rr.response_time_ms,
      rr.error_message,
      rr.created_at
    FROM rate_requests rr
    JOIN integrations i ON rr.integration_id = i.id
  `;

  const params = [];
  if (integrationId) {
    sql += ` WHERE rr.integration_id = $1`;
    params.push(integrationId);
  }

  sql += ` ORDER BY rr.created_at DESC LIMIT ${limit}`;

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get API request statistics
 */
export async function getRequestStats(integrationId, hours = 24) {
  const sql = `
    SELECT 
      COUNT(*) as total_requests,
      SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
      SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests,
      ROUND(AVG(response_time_ms)::numeric, 2) as avg_response_time_ms,
      MAX(response_time_ms) as max_response_time_ms,
      MIN(response_time_ms) as min_response_time_ms
    FROM rate_requests
    WHERE integration_id = $1
      AND created_at >= NOW() - INTERVAL '${hours} hours'
  `;

  const result = await query(sql, [integrationId]);
  return result.rows[0];
}

/**
 * Log user conversion request
 */
export async function logConversion(fromCurrency, toCurrency, amount, result, rateUsed) {
  const sql = `
    INSERT INTO conversions (
      from_currency, to_currency, amount, result, rate_used
    ) VALUES ($1, $2, $3, $4, $5)
  `;

  await query(sql, [fromCurrency, toCurrency, amount, result, rateUsed]);
}

/**
 * Get recent conversions
 */
export async function getRecentConversions(limit = 50) {
  const sql = `
    SELECT 
      id,
      from_currency,
      to_currency,
      amount,
      result,
      rate_used,
      created_at
    FROM conversions
    ORDER BY created_at DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);
  return result.rows;
}

/**
 * Get popular currency pairs
 */
export async function getPopularPairs(days = 7, limit = 10) {
  const sql = `
    SELECT 
      from_currency,
      to_currency,
      COUNT(*) as conversion_count,
      AVG(amount) as avg_amount,
      MAX(created_at) as last_conversion
    FROM conversions
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY from_currency, to_currency
    ORDER BY conversion_count DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);
  return result.rows;
}
