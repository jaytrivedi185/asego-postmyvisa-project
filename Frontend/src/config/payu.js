// PayU Live Configuration
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://asego-postmyvisa-project.onrender.com';

export const PAYU_CONFIG = {
  merchantKey: import.meta.env.VITE_PAYU_MERCHANT_KEY || '',
  // Live PayU payment url
  payuBaseUrl: 'https://secure.payu.in/_payment',
  // Backend redirects url
  successUrl: `${BACKEND_URL}/payu/success`,
  failureUrl: `${BACKEND_URL}/payu/failure`,
};
