// ASEGO API Configuration
// All credentials are now stored in .env file for security
export const ASEGO_CONFIG = {
  partnerId: import.meta.env.VITE_ASEGO_PARTNER_ID || "",
  sign: import.meta.env.VITE_ASEGO_SIGN || "",
  reference: import.meta.env.VITE_ASEGO_REFERENCE || "",
  branchSign: import.meta.env.VITE_ASEGO_BRANCH_SIGN || "",
  branchName: import.meta.env.VITE_ASEGO_BRANCH_NAME || "",
  // Encryption parameters for Encrypt API
  encryptionKey: import.meta.env.VITE_ASEGO_ENCRYPTION_KEY || "",
  initVector: import.meta.env.VITE_ASEGO_INIT_VECTOR || ""
};

// Use proxy server to avoid CORS issues
// Proxy server forwards requests to https://dolphin.asego.in/api
export const ASEGO_API_BASE_URL = import.meta.env.VITE_ASEGO_API_BASE_URL || "http://localhost:3001/api";
