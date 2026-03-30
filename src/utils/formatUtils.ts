// Formatting utilities for display values — currency, phone, masked PHI fields

/**
 * Format a number as US currency.
 * Example: 1250 → "$1,250.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a 10-digit phone number to (XXX) XXX-XXXX.
 * Accepts digits-only strings like "8005551234".
 */
export function formatPhone(digits: string): string {
  const cleaned = digits.replace(/\D/g, '');
  if (cleaned.length !== 10) return digits;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * ⚠️ HIPAA: Mask an email address for display.
 * "john.smith@example.com" → "jo**@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}**@${domain}`;
}

/**
 * ⚠️ HIPAA: Show only the last 4 digits of an SSN.
 * "123-45-6789" or "123456789" → "***-**-6789"
 */
export function maskSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return '***-**-****';
  return `***-**-${cleaned.slice(5)}`;
}

/**
 * Capitalize the first letter of each word.
 * Example: "john smith" → "John Smith"
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

/**
 * Truncate a string to a max length with an ellipsis.
 * Example: truncate("Hello World", 8) → "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
