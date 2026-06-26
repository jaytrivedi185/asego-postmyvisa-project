import CryptoJS from 'crypto-js';

/**
 * Encrypts the payload using AES encryption
 * IMPORTANT: Returns encrypted STRING for API
 * 
 * @param {Array|Object} payload - The payload to encrypt
 * @param {string} encryptionKey - The secret key provided by client
 * @returns {string} - Encrypted string (starts with U2FsdGVkX1...)
 */
export const encryptPayload = (payload, encryptionKey) => {
  try {
    // Validate encryption key
    if (!encryptionKey || encryptionKey === 'YOUR_ENCRYPTION_KEY') {
      throw new Error('Valid encryption key is required');
    }
    
    // STEP 1: Convert payload to JSON string
    const jsonString = JSON.stringify(payload);
    
    // STEP 2: Encrypt using AES with client secret key
    const encrypted = CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
    
    // STEP 3: Return encrypted string
    return encrypted;
  } catch (error) {
    console.error('Encryption Error:', error);
    throw new Error(`Failed to encrypt payload: ${error.message}`);
  }
};

/**
 * Decrypts the encrypted string
 * 
 * @param {string} encryptedData - The encrypted string
 * @param {string} encryptionKey - The secret key
 * @returns {Object|Array} - Decrypted payload
 */
export const decryptPayload = (encryptedData, encryptionKey) => {
  try {
    // Decrypt using AES
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    
    // Convert to UTF8 string
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    // Parse JSON
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption Error:', error);
    throw new Error(`Failed to decrypt payload: ${error.message}`);
  }
};
