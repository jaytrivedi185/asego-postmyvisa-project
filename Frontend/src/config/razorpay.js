// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Razorpay Key ID
  keySecret: "YOUR_RAZORPAY_KEY_SECRET" // Keep this secure, never expose in frontend
};
