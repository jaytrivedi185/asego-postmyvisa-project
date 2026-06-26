import CryptoJS from 'crypto-js';

/**
 * Client-Side Encryption Utility
 * 
 * This is a BACKUP solution if the ASEGO Encrypt API fails with 403 errors.
 * It uses CryptoJS to encrypt the payload directly in the browser.
 * 
 * Advantages:
 * - No external API call needed
 * - Faster (no network delay)
 * - No CORS issues
 * - Same encryption result as server-side
 */

/**
 * Encrypt payload using AES encryption with custom IV
 * 
 * @param {string} payloadString - JSON stringified payload
 * @param {string} encryptionKey - Client secret key
 * @param {string} initVector - Client init vector (16 characters)
 * @returns {string} - Base64 encrypted string (starts with U2FsdGVkX1)
 */
export const encryptPayloadClientSide = (payloadString, encryptionKey, initVector) => {
  try {
    console.log('\n========== CLIENT-SIDE ENCRYPTION ==========');
    console.log('1. PAYLOAD STRING:');
    console.log('   - Length:', payloadString.length);
    console.log('   - Sample:', payloadString.substring(0, 200) + '...');
    
    console.log('\n2. ENCRYPTION PARAMETERS:');
    console.log('   - Key Length:', encryptionKey.length);
    console.log('   - IV Length:', initVector.length);
    
    // Validate inputs
    if (!payloadString) {
      throw new Error('Payload string is required');
    }
    
    if (!encryptionKey) {
      throw new Error('Encryption key is required');
    }
    
    if (!initVector || initVector.length !== 16) {
      throw new Error('Init vector must be exactly 16 characters');
    }
    
    // Convert IV string to WordArray
    const iv = CryptoJS.enc.Utf8.parse(initVector);
    const key = CryptoJS.enc.Utf8.parse(encryptionKey);
    
    // Encrypt using AES with CBC mode and PKCS7 padding
    const encrypted = CryptoJS.AES.encrypt(payloadString, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Convert to Base64 string
    const encryptedString = encrypted.toString();
    
    console.log('\n3. ENCRYPTED VALUE:');
    console.log('   - Type:', typeof encryptedString);
    console.log('   - Length:', encryptedString.length);
    console.log('   - Starts with U2FsdGVkX1:', encryptedString.startsWith('U2FsdGVkX1'));
    console.log('   - First 50 chars:', encryptedString.substring(0, 50));
    console.log('=========================================\n');
    
    return encryptedString;
    
  } catch (error) {
    console.error('\n❌ CLIENT-SIDE ENCRYPTION ERROR:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt payload (for testing purposes)
 * 
 * @param {string} encryptedString - Base64 encrypted string
 * @param {string} encryptionKey - Client secret key
 * @param {string} initVector - Client init vector
 * @returns {object} - Decrypted payload object
 */
export const decryptPayloadClientSide = (encryptedString, encryptionKey, initVector) => {
  try {
    // Convert IV string to WordArray
    const iv = CryptoJS.enc.Utf8.parse(initVector);
    const key = CryptoJS.enc.Utf8.parse(encryptionKey);
    
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(encryptedString, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Convert to UTF8 string
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Parse JSON
    return JSON.parse(decryptedString);
    
  } catch (error) {
    console.error('❌ DECRYPTION ERROR:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};
