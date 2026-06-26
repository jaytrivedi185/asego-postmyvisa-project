import { RAZORPAY_CONFIG } from '../config/razorpay';

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async ({
  amount, // Amount in INR
  currency = 'INR',
  name,
  email,
  contact,
  description,
  onSuccess,
  onFailure,
}) => {
  // Load Razorpay script
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    onFailure(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    return;
  }

  // Razorpay options
  const options = {
    key: RAZORPAY_CONFIG.keyId,
    amount: Math.round(amount * 100), // Razorpay accepts amount in paise (1 INR = 100 paise)
    currency: currency,
    name: 'Postmyvisa Travel Insurance',
    description: description || 'Travel Insurance Premium Payment',
    image: '/Postmyvisa-LOGO-PNG-scaled.png', // Your company logo
    handler: function (response) {
      // Payment successful
      onSuccess({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      });
    },
    prefill: {
      name: name,
      email: email,
      contact: contact,
    },
    notes: {
      purpose: 'Travel Insurance Premium',
    },
    theme: {
      color: '#F59E0B', // Amber color matching your theme
    },
    modal: {
      ondismiss: function() {
        onFailure(new Error('Payment cancelled by user'));
      }
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
