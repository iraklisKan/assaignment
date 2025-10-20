/**
 * Encryption Utility Tests
 * Tests for API key encryption/decryption functionality
 */

import { encryptApiKey, decryptApiKey } from '../../src/utils/encryption.js';

describe('Encryption Utils', () => {
  const testApiKey = 'test-api-key-12345';
  const appDataKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  beforeAll(() => {
    process.env.APP_DATA_KEY = appDataKey;
  });

  describe('encryptApiKey', () => {
    it('should encrypt an API key', () => {
      const encrypted = encryptApiKey(testApiKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(testApiKey);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different encrypted values for same input (different IVs)', () => {
      const encrypted1 = encryptApiKey(testApiKey);
      const encrypted2 = encryptApiKey(testApiKey);
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should return null for empty input', () => {
      const encrypted = encryptApiKey('');
      expect(encrypted).toBeNull();
    });

    it('should return null for null input', () => {
      const encrypted = encryptApiKey(null);
      expect(encrypted).toBeNull();
    });

    it('should return null for undefined input', () => {
      const encrypted = encryptApiKey(undefined);
      expect(encrypted).toBeNull();
    });

    it('should throw error if APP_DATA_KEY is not set', () => {
      const originalKey = process.env.APP_DATA_KEY;
      delete process.env.APP_DATA_KEY;

      expect(() => {
        encryptApiKey(testApiKey);
      }).toThrow();

      process.env.APP_DATA_KEY = originalKey;
    });

    it('should handle special characters in API key', () => {
      const specialKey = 'test-key-!@#$%^&*()_+={}[]|\\:";\'<>?,./';
      const encrypted = encryptApiKey(specialKey);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(specialKey);
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt an encrypted API key', () => {
      const encrypted = encryptApiKey(testApiKey);
      const decrypted = decryptApiKey(encrypted);
      
      expect(decrypted).toBe(testApiKey);
    });

    it('should return null for empty input', () => {
      const decrypted = decryptApiKey('');
      expect(decrypted).toBeNull();
    });

    it('should return null for null input', () => {
      const decrypted = decryptApiKey(null);
      expect(decrypted).toBeNull();
    });

    it('should return null for undefined input', () => {
      const decrypted = decryptApiKey(undefined);
      expect(decrypted).toBeNull();
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => {
        decryptApiKey('invalid-encrypted-string');
      }).toThrow();
    });

    it('should throw error if APP_DATA_KEY is not set', () => {
      const encrypted = encryptApiKey(testApiKey);
      const originalKey = process.env.APP_DATA_KEY;
      delete process.env.APP_DATA_KEY;

      expect(() => {
        decryptApiKey(encrypted);
      }).toThrow();

      process.env.APP_DATA_KEY = originalKey;
    });

    it('should correctly decrypt special characters', () => {
      const specialKey = 'test-key-!@#$%^&*()_+={}[]|\\:";\'<>?,./';
      const encrypted = encryptApiKey(specialKey);
      const decrypted = decryptApiKey(encrypted);
      
      expect(decrypted).toBe(specialKey);
    });

    it('should handle long API keys', () => {
      const longKey = 'a'.repeat(1000);
      const encrypted = encryptApiKey(longKey);
      const decrypted = decryptApiKey(encrypted);
      
      expect(decrypted).toBe(longKey);
    });
  });

  describe('Round-trip encryption/decryption', () => {
    const testCases = [
      'simple-key',
      'key-with-dashes',
      'KEY_WITH_UNDERSCORES',
      'key.with.dots',
      'key@with#symbols!',
      '123456789',
      'mixed-Key_123.Test@2024',
      'очень-длинный-ключ-с-unicode-символами',
    ];

    testCases.forEach((testKey) => {
      it(`should correctly encrypt and decrypt: ${testKey}`, () => {
        const encrypted = encryptApiKey(testKey);
        const decrypted = decryptApiKey(encrypted);
        
        expect(decrypted).toBe(testKey);
      });
    });
  });
});
