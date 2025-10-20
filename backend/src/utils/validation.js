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
  return /^[A-Z]{3}$/.test(code);
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
