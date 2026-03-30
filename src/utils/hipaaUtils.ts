// ⚠️ HIPAA: Utilities for safe handling of Protected Health Information (PHI)
// Never log PHI — use these helpers to sanitize before any logging or display

/**
 * Strip PHI fields from an object before logging.
 * Pass any object — fields listed here will be replaced with "[REDACTED]".
 */
const PHI_FIELDS = [
  'ssn', 'dob', 'dateOfBirth', 'phone', 'email', 'address',
  'firstName', 'lastName', 'patientName', 'notes', 'diagnosis',
  'medications', 'allergies',
];

export function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (PHI_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeForLog(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Safe audit log helper — logs the action and user ID but never PHI.
 * Use this instead of console.log for any auth or clinical actions.
 */
export function auditLog(action: string, userId: string, details?: string): void {
  // In production this would call the backend audit endpoint
  // ⚠️ HIPAA: Never include PHI in the details string
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT] ${timestamp} | ${action} | user:${userId}${details ? ` | ${details}` : ''}`);
}

/**
 * Verify a string does not contain obvious PHI patterns before logging.
 * Checks for SSN patterns, email patterns, and phone number patterns.
 * Returns true if the string appears safe to log.
 */
export function isSafeToLog(str: string): boolean {
  const ssnPattern = /\d{3}[-\s]?\d{2}[-\s]?\d{4}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+1[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/;

  return !ssnPattern.test(str) && !emailPattern.test(str) && !phonePattern.test(str);
}
