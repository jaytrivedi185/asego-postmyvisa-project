// src/utils/validators.js — reusable field validators

export const required = (val, label) =>
  !String(val ?? '').trim() ? `${label} is required.` : '';

export const validEmail = (val) => {
  if (!val) return 'Email is required.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'Enter a valid email address.';
};

export const validPhone = (val) => {
  if (!val) return 'Mobile number is required.';
  return /^[0-9]{10}$/.test(val) ? '' : 'Enter a valid 10-digit number.';
};

export const validPincode = (val) => {
  if (!val) return 'Pincode is required.';
  return /^[0-9]{6}$/.test(val) ? '' : 'Enter a valid 6-digit pincode.';
};

export const validPassport = (val) => {
  if (!val) return 'Passport number is required.';
  return /^[A-Z0-9]{6,20}$/i.test(val.trim()) ? '' : 'Enter a valid passport number.';
};
