import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

/**
 * Get encryption key from environment
 * @returns {Buffer} Encryption key
 */
function getEncryptionKey() {
  const key = process.env.APP_DATA_KEY;
  if (!key) {
    throw new Error('APP_DATA_KEY environment variable is required');
  }
  
  // Ensure key is exactly 32 bytes
  const keyBuffer = Buffer.from(key.padEnd(KEY_LENGTH, '0').slice(0, KEY_LENGTH));
  return keyBuffer;
}

/**
 * Encrypt a string value
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text with IV prepended (format: iv:encryptedData)
 */
export function encrypt(text) {
  if (!text) return text;
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt an encrypted string
 * @param {string} encryptedText - Encrypted text (format: iv:encryptedData)
 * @returns {string} Decrypted plain text
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');
  
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
