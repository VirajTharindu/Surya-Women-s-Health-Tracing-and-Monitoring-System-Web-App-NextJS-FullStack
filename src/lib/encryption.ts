import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// In a real app, this should be in .env.local
// For this demo, we use a fallback if not provided
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes

const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a string (or JSON stringified object) using AES-256-GCM
 */
export function encryptData(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
    
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string previously encrypted with encryptData
 */
export function decryptData(encryptedText: string): string {
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            // Not in our encrypted format, might be legacy plaintext
            return encryptedText;
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedText;
    }
}
