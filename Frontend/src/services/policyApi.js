import axios from 'axios';
import { ASEGO_API_BASE_URL } from '../config/asego';
import { encryptPayload } from './encryptionApi';

const apiClient = axios.create({
  baseURL: ASEGO_API_BASE_URL,
  timeout: 30000,
});

/**
 * Create Policy API
 * Uses client's Encrypt API for encryption
 * 
 * Flow:
 * 1. Build payload array
 * 2. JSON.stringify(payload)
 * 3. Call Encrypt API
 * 4. Send encrypted value to Create Policy API
 * 
 * @param {string} partnerId - Partner ID (passed in URL)
 * @param {Array} payload - Payload array
 * @param {string} encryptionKey - Client secret key
 * @param {string} initVector - Client init vector
 * @returns {Promise} - API response
 */
export const createPolicy = async (partnerId, payload, encryptionKey, initVector) => {
  try {
    console.log('\n========== CREATE POLICY FLOW ==========');
    
    // STEP 1: Validate payload is array
    if (!Array.isArray(payload)) {
      throw new Error('Payload must be an array');
    }
    
    console.log('\n1. RAW PAYLOAD:');
    console.log('   - Is Array:', Array.isArray(payload), '✅');
    console.log('   - Array Length:', payload.length);
    console.log('   - agePremiums Type:', typeof payload[0]?.selectedPlan?.plan?.agePremiums);
    console.log('   - agePremiums Is Object:', !Array.isArray(payload[0]?.selectedPlan?.plan?.agePremiums), '✅');
    console.log('   - Full Payload:', JSON.stringify(payload, null, 2));
    
    // STEP 2: Stringify payload
    const payloadString = JSON.stringify(payload);
    console.log('\n2. STRINGIFIED PAYLOAD:');
    console.log('   - Length:', payloadString.length);
    console.log('   - Sample:', payloadString.substring(0, 200) + '...');
    
    // STEP 3: Call Encrypt API
    console.log('\n3. CALLING ENCRYPT API...');
    const encryptedValue = await encryptPayload(payloadString, encryptionKey, initVector);
    console.log('   - Encrypted Value Received ✅');
    console.log('   - Length:', encryptedValue.length);
    console.log('   - First 50 chars:', encryptedValue.substring(0, 50));
    
    // STEP 4: Call Create Policy API
    console.log('\n4. CALLING CREATE POLICY API...');
    console.log('   - URL:', `/ext/b2b/v1/createPolicy/${partnerId}`);
    console.log('   - Content-Type: text/plain');
    console.log('   - Body: Encrypted string');
    
    // Send encrypted string to Create Policy API
    const response = await apiClient.post(
      `/ext/b2b/v1/createPolicy/${partnerId}`,
      encryptedValue,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    
    console.log('\n5. CREATE POLICY RESPONSE:');
    console.log('   - Status:', response.status, '✅');
    console.log('   - Response:', JSON.stringify(response.data, null, 2));
    console.log('========================================\n');
    
    return response.data;
    
  } catch (error) {
    console.error('\n❌ CREATE POLICY ERROR:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
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
        `API Error: ${error.response.status}`
      );
    } else if (error.request) {
      // Request made but no response
      console.error('No Response from Server');
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Error setting up request or from Encrypt API
      console.error('Request Error:', error.message);
      throw new Error(error.message || 'Failed to create policy');
    }
  }
};

/**
 * Endorse Policy API
 * Uses client's Encrypt API for encryption
 * 
 * Flow:
 * 1. Build endorse payload object
 * 2. JSON.stringify(payload)
 * 3. Call Encrypt API
 * 4. Send encrypted value to Endorse Policy API
 * 
 * @param {string} partnerId - Partner ID (passed in URL)
 * @param {Object} payload - Endorse payload object
 * @param {string} encryptionKey - Client secret key
 * @param {string} initVector - Client init vector
 * @returns {Promise} - API response
 */
export const endorsePolicy = async (partnerId, payload, encryptionKey, initVector) => {
  try {
    console.log('\n========== ENDORSE POLICY FLOW ==========');
    
    console.log('\n1. RAW PAYLOAD:');
    console.log('   - Full Payload:', JSON.stringify(payload, null, 2));
    
    // STEP 2: Stringify payload
    const payloadString = JSON.stringify(payload);
    console.log('\n2. STRINGIFIED PAYLOAD:');
    console.log('   - Length:', payloadString.length);
    console.log('   - Sample:', payloadString.substring(0, 200) + '...');
    
    // STEP 3: Call Encrypt API
    console.log('\n3. CALLING ENCRYPT API...');
    const encryptedValue = await encryptPayload(payloadString, encryptionKey, initVector);
    console.log('   - Encrypted Value Received ✅');
    console.log('   - Length:', encryptedValue.length);
    console.log('   - First 50 chars:', encryptedValue.substring(0, 50));
    
    // STEP 4: Call Endorse Policy API
    console.log('\n4. CALLING ENDORSE POLICY API...');
    console.log('   - URL:', `/ext/b2b/v1/endorsePolicy/${partnerId}`);
    console.log('   - Content-Type: text/plain');
    console.log('   - Body: Encrypted string');
    
    // Send encrypted string to Endorse Policy API
    const response = await apiClient.post(
      `/ext/b2b/v1/endorsePolicy/${partnerId}`,
      encryptedValue,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    
    console.log('\n5. ENDORSE POLICY RESPONSE:');
    console.log('   - Status:', response.status, '✅');
    console.log('   - Response:', JSON.stringify(response.data, null, 2));
    console.log('========================================\n');
    
    return response.data;
    
  } catch (error) {
    console.error('\n❌ ENDORSE POLICY ERROR:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
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
        `API Error: ${error.response.status}`
      );
    } else if (error.request) {
      // Request made but no response
      console.error('No Response from Server');
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Error setting up request or from Encrypt API
      console.error('Request Error:', error.message);
      throw new Error(error.message || 'Failed to endorse policy');
    }
  }
};
