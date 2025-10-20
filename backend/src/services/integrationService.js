import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { validateRequired, validateUrl, sanitizeString } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Create a new integration
 */
export async function createIntegration(data) {
  validateRequired(data, ['name', 'provider', 'base_url']);

  const { name, provider, base_url, api_key, priority, poll_interval_seconds, active } = data;

  // Validate URL
  if (!validateUrl(base_url)) {
    throw new AppError('Invalid base_url format', 400);
  }

  // Encrypt API key if provided
  const api_key_enc = api_key ? encrypt(api_key) : null;

  const sql = `
    INSERT INTO integrations (
      id, name, provider, base_url, api_key_enc, priority, poll_interval_seconds, active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, provider, base_url, priority, poll_interval_seconds, active, created_at, updated_at
  `;

  const values = [
    uuidv4(),
    sanitizeString(name),
    sanitizeString(provider),
    base_url,
    api_key_enc,
    priority || 100,
    poll_interval_seconds || 300,
    active !== undefined ? active : true
  ];

  const result = await query(sql, values);
  return result.rows[0];
}

/**
 * Get all integrations
 */
export async function getIntegrations(filters = {}) {
  let sql = 'SELECT id, name, provider, base_url, priority, poll_interval_seconds, active, created_at, updated_at FROM integrations';
  const conditions = [];
  const values = [];

  if (filters.active !== undefined) {
    conditions.push(`active = $${values.length + 1}`);
    values.push(filters.active);
  }

  if (filters.provider) {
    conditions.push(`provider = $${values.length + 1}`);
    values.push(sanitizeString(filters.provider));
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY priority ASC, created_at DESC';

  const result = await query(sql, values);
  return result.rows;
}

/**
 * Get integration by ID
 */
export async function getIntegrationById(id) {
  const sql = `
    SELECT id, name, provider, base_url, api_key_enc, priority, poll_interval_seconds, active, created_at, updated_at
    FROM integrations
    WHERE id = $1
  `;

  const result = await query(sql, [id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Integration not found', 404);
  }

  const integration = result.rows[0];
  
  // Decrypt API key for internal use
  if (integration.api_key_enc) {
    integration.api_key = decrypt(integration.api_key_enc);
  }

  return integration;
}

/**
 * Update integration
 */
export async function updateIntegration(id, data) {
  const existing = await getIntegrationById(id);
  
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(sanitizeString(data.name));
  }

  if (data.provider !== undefined) {
    updates.push(`provider = $${paramCount++}`);
    values.push(sanitizeString(data.provider));
  }

  if (data.base_url !== undefined) {
    if (!validateUrl(data.base_url)) {
      throw new AppError('Invalid base_url format', 400);
    }
    updates.push(`base_url = $${paramCount++}`);
    values.push(data.base_url);
  }

  if (data.api_key !== undefined) {
    const api_key_enc = data.api_key ? encrypt(data.api_key) : null;
    updates.push(`api_key_enc = $${paramCount++}`);
    values.push(api_key_enc);
  }

  if (data.priority !== undefined) {
    updates.push(`priority = $${paramCount++}`);
    values.push(data.priority);
  }

  if (data.poll_interval_seconds !== undefined) {
    updates.push(`poll_interval_seconds = $${paramCount++}`);
    values.push(data.poll_interval_seconds);
  }

  if (data.active !== undefined) {
    updates.push(`active = $${paramCount++}`);
    values.push(data.active);
  }

  if (updates.length === 0) {
    return existing;
  }

  values.push(id);

  const sql = `
    UPDATE integrations
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, name, provider, base_url, priority, poll_interval_seconds, active, created_at, updated_at
  `;

  const result = await query(sql, values);
  return result.rows[0];
}

/**
 * Delete/deactivate integration
 */
export async function deleteIntegration(id) {
  // Soft delete by deactivating
  const sql = `
    UPDATE integrations
    SET active = false
    WHERE id = $1
    RETURNING id
  `;

  const result = await query(sql, [id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Integration not found', 404);
  }

  return { success: true };
}

/**
 * Permanently delete integration
 */
export async function hardDeleteIntegration(id) {
  // Check if integration exists
  await getIntegrationById(id);
  
  // Delete from database (cascading deletes will handle related records)
  const sql = `
    DELETE FROM integrations
    WHERE id = $1
    RETURNING id
  `;

  const result = await query(sql, [id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Integration not found', 404);
  }

  return { success: true };
}

/**
 * Get all active integrations with decrypted keys
 */
export async function getActiveIntegrationsWithKeys() {
  const sql = `
    SELECT id, name, provider, base_url, api_key_enc, priority, poll_interval_seconds
    FROM integrations
    WHERE active = true
    ORDER BY priority ASC
  `;

  const result = await query(sql);
  
  return result.rows.map(integration => ({
    ...integration,
    api_key: integration.api_key_enc ? decrypt(integration.api_key_enc) : null
  }));
}
