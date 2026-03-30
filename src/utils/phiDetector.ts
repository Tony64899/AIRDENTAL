// ⚠️ HIPAA: PHI detection utility for the messaging module.
// Scans message text for patterns that may indicate Protected Health Information.
// Detection is non-blocking — the message still sends but triggers an amber warning.
// Patterns are intentionally broad to err on the side of caution.

const PHI_PATTERNS: RegExp[] = [
  /\b\d{2}\/\d{2}\/\d{4}\b/,                           // DOB in MM/DD/YYYY format
  /\b\d{3}-\d{2}-\d{4}\b/,                             // SSN: 000-00-0000
  /\b[Dd]\d{4}\b/,                                     // ADA CDT procedure code D0100–D9999
  /\b(member|insurance|policy)\s*#?\s*\d{6,}/i,        // Insurance / policy number
  /\b(allerg(y|ic|en)|penicillin|sulfa)\b/i,           // Allergy references
  /\b(diagnosis|diagnosed|condition)\b/i,               // Clinical condition references
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/,                  // Phone number patterns
];

export function containsPhi(text: string): boolean {
  return PHI_PATTERNS.some(p => p.test(text));
}
