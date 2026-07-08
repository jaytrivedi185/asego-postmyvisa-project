import { PAYU_CONFIG } from '../config/payu';

/**
 * Fetches the PayU hash from our backend (salt never exposed to frontend).
 * Backend endpoint: POST /api/payu/hash
 */
const getPayuHash = async (hashData) => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const response = await fetch(`${backendUrl}/payu/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hashData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to generate payment hash');
  }
  const data = await response.json();
  return data.hash;
};

/**
 * Initiates PayU payment by:
 * 1. Getting hash from backend
 * 2. Saving pending payment state to sessionStorage
 * 3. Submitting a hidden form POST to PayU live URL
 */
export const initiatePayuPayment = async ({
  amount,
  name,
  email,
  contact,
  description,
  txnId,
}) => {
  // Build txnid — unique per transaction
  const transactionId = txnId || `PMV${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const productInfo = description || 'Travel Insurance Premium';
  const amountStr = parseFloat(amount).toFixed(2);

  // Collect hash fields — order matters for PayU
  const hashData = {
    txnid: transactionId,
    amount: amountStr,
    productinfo: productInfo,
    firstname: name.split(' ')[0] || name,
    email: email,
  };

  const hash = await getPayuHash(hashData);

  // Save pending transaction to sessionStorage so success/failure pages can read it
  sessionStorage.setItem('payuTxnId', transactionId);
  sessionStorage.setItem('payuPending', 'true');

  // Build and auto-submit form to PayU
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = PAYU_CONFIG.payuBaseUrl;

  const fields = {
    key:         PAYU_CONFIG.merchantKey,
    txnid:       transactionId,
    amount:      amountStr,
    productinfo: productInfo,
    firstname:   name.split(' ')[0] || name,
    lastname:    name.split(' ').slice(1).join(' ') || '',
    email:       email,
    phone:       contact || '',
    surl:        PAYU_CONFIG.successUrl,
    furl:        PAYU_CONFIG.failureUrl,
    hash:        hash,
    service_provider: 'payu_paisa',
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};
