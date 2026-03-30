// Form validation utilities used across the app

/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * ⚠️ HIPAA: Validate password meets HIPAA-compliant complexity requirements.
 * Min 12 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character.
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 12) errors.push('At least 12 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least one special character');
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a 10-digit US phone number (digits only).
 */
export function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Validate a US ZIP code (5 digits or 5+4).
 */
export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

/**
 * Validate a 6-digit MFA code.
 */
export function isValidMfaCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Validate that a required field is not empty.
 */
export function isRequired(value: string | undefined | null): boolean {
  return value != null && value.trim().length > 0;
}
