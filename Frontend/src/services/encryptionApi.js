import axios from 'axios';
import { ASEGO_API_BASE_URL } from '../config/asego';

const apiClient = axios.create({
  baseURL: ASEGO_API_BASE_URL,
  timeout: 30000,
});

/**
 * Encrypt API - Encrypts payload using client's Encrypt API
 * 
 * @param {string} payloadString - JSON stringified payload
 * @param {string} encryptionKey - Client secret key
 * @param {string} initVector - Client init vector
 * @returns {Promise<string>} - Encrypted value
 */
export const encryptPayload = async (payloadString, encryptionKey, initVector) => {
  try {
    console.log('\n========== ENCRYPT API DEBUG ==========');
    console.log('1. PAYLOAD STRING:');
    console.log('   - Length:', payloadString.length);
    console.log('   - Sample:', payloadString.substring(0, 200) + '...');
    
    // Build request body for Encrypt API
    const requestBody = {
      value: payloadString,
      key: encryptionKey,
      initVector: initVector,
    };
    
    console.log('\n2. ENCRYPT API REQUEST:');
    console.log('   - Endpoint: /ext/b2b/v1/encryption/encrypt');
    console.log('   - Body:', JSON.stringify(requestBody, null, 2));
    
    // Call Encrypt API
    const response = await apiClient.post('/ext/b2b/v1/encryption/encrypt', requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('\n3. ENCRYPT API RESPONSE:');
    console.log('   - Status:', response.status);
    console.log('   - Response:', response.data);
    
    // Extract encrypted value
    // The API returns the encrypted string directly (not wrapped in an object)
    let encryptedValue;
    
    if (typeof response.data === 'string') {
      // API returned string directly
      encryptedValue = response.data;
    } else if (response.data && response.data.value) {
      // API returned object with value property
      encryptedValue = response.data.value;
    } else {
      throw new Error('Encrypted value not found in response');
    }
    
    if (!encryptedValue) {
      throw new Error('Encrypted value is empty');
    }
    
    console.log('\n4. ENCRYPTED VALUE:');
    console.log('   - Type:', typeof encryptedValue);
    console.log('   - Length:', encryptedValue.length);
    console.log('   - Starts with U2FsdGVkX1:', encryptedValue.startsWith('U2FsdGVkX1'));
    console.log('   - First 50 chars:', encryptedValue.substring(0, 50));
    console.log('========================================\n');
    
    return encryptedValue;
  } catch (error) {
    console.error('\n❌ ENCRYPT API ERROR:', error);
    
    if (error.response) {
      const errorData = error.response.data;
      console.error('Server Error Response:', {
        status: error.response.status,
        code: errorData?.code,
        message: errorData?.msg || errorData?.message,
        data: errorData,
      });
      
      throw new Error(
        errorData?.msg || 
        errorData?.message || 
        `Encryption failed: ${error.response.status}`
      );
    } else if (error.request) {
      console.error('No Response from Server');
      throw new Error('Encryption API not responding. Please check connection.');
    } else {
      console.error('Request Setup Error:', error.message);
      throw new Error(error.message || 'Failed to encrypt payload');
    }
  }
};
