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
