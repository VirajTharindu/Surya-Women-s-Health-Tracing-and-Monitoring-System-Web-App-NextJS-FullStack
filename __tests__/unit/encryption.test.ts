import { encryptData, decryptData } from '../../src/lib/encryption';

describe('Encryption Utilities', () => {
    const sampleText = 'This is a secret patient record.';
    
    it('should encrypt data to the correct format', () => {
        const encrypted = encryptData(sampleText);
        expect(encrypted).not.toBe(sampleText);
        
        // Should contain two colons separating iv, authTag, and ciphertext
        const parts = encrypted.split(':');
        expect(parts.length).toBe(3);
    });

    it('should correctly decrypt encrypted data', () => {
        const encrypted = encryptData(sampleText);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toBe(sampleText);
    });

    it('should return original text if format is invalid', () => {
        const plainText = 'Not encrypted string';
        const decrypted = decryptData(plainText);
        expect(decrypted).toBe(plainText);
    });

    it('should return original text on decryption failure', () => {
        // Corrupt the encrypted string by messing with the auth tag
        const encrypted = encryptData(sampleText);
        const parts = encrypted.split(':');
        // Modify the auth tag (part[1]) slightly
        parts[1] = '00000000000000000000000000000000';
        const corrupted = parts.join(':');

        const decrypted = decryptData(corrupted);
        // Because decryption fails and falls back to returning the input string:
        expect(decrypted).toBe(corrupted);
    });
});
