/**
 * Validation helper functions
 */

/**
 * Validate required fields in request body
 */
export function validateRequired(data, fields) {
  const missing = [];
  
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate currency code (3-letter ISO)
 */
export function validateCurrencyCode(code) {
  if (!code) return false;
  const upperCode = String(code).toUpperCase();
  return /^[A-Z]{3}$/.test(upperCode);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate integration data
 */
export function validateIntegration(data) {
  const errors = [];
  
  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!data.provider || data.provider.trim() === '') {
    errors.push('Provider is required');
  }
  
  // Validate URL if provided
  if (data.baseUrl && !validateUrl(data.baseUrl)) {
    errors.push('Base URL must be a valid URL');
  }
  
  // Validate priority range
  if (data.priority !== null && data.priority !== undefined) {
    const priority = parseInt(data.priority);
    if (isNaN(priority) || priority < 1 || priority > 100) {
      errors.push('Priority must be between 1 and 100');
    }
  }
  
  // Validate poll interval
  if (data.pollIntervalSeconds !== null && data.pollIntervalSeconds !== undefined) {
    const interval = parseInt(data.pollIntervalSeconds);
    if (isNaN(interval) || interval < 60 || interval > 3600) {
      errors.push('Poll interval must be between 60 and 3600 seconds');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate amount for conversions
 */
export function validateAmount(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return false;
  }
  
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate) {
  const errors = [];
  
  // Check date format
  if (!validateDate(startDate) || !validateDate(endDate)) {
    errors.push('Invalid date format (use YYYY-MM-DD)');
    return { valid: false, errors };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check that end is after start
  if (end < start) {
    errors.push('End date must be after start date');
  }
  
  // Check range is not more than 365 days
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    errors.push('Date range cannot exceed 365 days');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
