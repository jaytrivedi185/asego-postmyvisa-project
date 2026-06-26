import CryptoJS from 'crypto-js';

/**
 * Method 1: AES with Base64 encoding
 */
export const encryptPayloadAESBase64 = (payload, encryptionKey) => {
  try {
    const jsonString = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption Error:', error);
    throw new Error('Failed to encrypt payload');
  }
};

/**
 * Method 2: AES with custom key and IV
 */
export const encryptPayloadAESWithIV = (payload, encryptionKey) => {
  try {
    const jsonString = JSON.stringify(payload);
    
    // Generate key and IV from the encryption key
    const key = CryptoJS.enc.Utf8.parse(encryptionKey.padEnd(32, '0').substring(0, 32));
    const iv = CryptoJS.enc.Utf8.parse(encryptionKey.padEnd(16, '0').substring(0, 16));
    
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption Error:', error);
    throw new Error('Failed to encrypt payload');
  }
};

/**
 * Method 3: Base64 encode only (no encryption - for testing)
 */
export const encryptPayloadBase64Only = (payload) => {
  try {
    const jsonString = JSON.stringify(payload);
    const encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(jsonString));
    return encoded;
  } catch (error) {
    console.error('Encoding Error:', error);
    throw new Error('Failed to encode payload');
  }
};

/**
 * Method 4: Triple DES encryption
 */
export const encryptPayloadTripleDES = (payload, encryptionKey) => {
  try {
    const jsonString = JSON.stringify(payload);
    const encrypted = CryptoJS.TripleDES.encrypt(jsonString, encryptionKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption Error:', error);
    throw new Error('Failed to encrypt payload');
  }
};

/**
 * Method 5: SHA256 Hash (one-way, for verification)
 */
export const hashPayload = (payload, encryptionKey) => {
  try {
    const jsonString = JSON.stringify(payload);
    const hash = CryptoJS.SHA256(jsonString + encryptionKey).toString();
    return hash;
  } catch (error) {
    console.error('Hashing Error:', error);
    throw new Error('Failed to hash payload');
  }
};

// Default export - currently using Method 1
export const encryptPayload = encryptPayloadAESBase64;

export const decryptPayload = (encryptedData, encryptionKey) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption Error:', error);
    throw new Error('Failed to decrypt payload');
  }
};
