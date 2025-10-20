/**
 * Simple Encryption Tests
 * Basic tests that work without complex mocking
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { encrypt, decrypt } from '../../src/utils/encryption.js';

describe('Encryption Utils', () => {
  const testApiKey = 'test-api-key-12345';
  const appDataKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  beforeAll(() => {
    process.env.APP_DATA_KEY = appDataKey;
  });

  describe('encrypt', () => {
    it('should encrypt an API key', () => {
      const encrypted = encrypt(testApiKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(testApiKey);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different encrypted values for same input', () => {
      const encrypted1 = encrypt(testApiKey);
      const encrypted2 = encrypt(testApiKey);
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should return input for empty string', () => {
      const encrypted = encrypt('');
      expect(encrypted).toBe('');
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted API key', () => {
      const encrypted = encrypt(testApiKey);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(testApiKey);
    });

    it('should return input for empty string', () => {
      const decrypted = decrypt('');
      expect(decrypted).toBe('');
    });
  });

  describe('Round-trip encryption/decryption', () => {
    const testCases = [
      'simple-key',
      'key-with-dashes',
      'KEY_WITH_UNDERSCORES',
      'key.with.dots',
      'mixed-Key_123.Test@2024',
    ];

    testCases.forEach((testKey) => {
      it(`should correctly encrypt and decrypt: ${testKey}`, () => {
        const encrypted = encrypt(testKey);
        const decrypted = decrypt(encrypted);
        
        expect(decrypted).toBe(testKey);
      });
    });
  });
});
