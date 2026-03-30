// claimValidation.ts — validates claims before submission.
// ⚠️ HIPAA: Claim data is PHI. Validation errors must not be logged externally.

import type { Claim } from '../types';

export interface ValidationResult {
  valid:    boolean;
  errors:   string[];
  warnings: string[];
}

export function validateClaim(claim: Claim): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!claim.patientId) errors.push('Patient ID is required');
  if (!claim.insurancePlanId) errors.push('Insurance plan is required');
  if (claim.lines.length === 0) errors.push('At least one procedure line is required');

  claim.lines.forEach((line, i) => {
    if (!line.cdtCode) errors.push(`Line ${i + 1}: CDT code is required`);
    if (!line.dateOfService) errors.push(`Line ${i + 1}: Date of service is required`);
    if (!line.fee || line.fee <= 0) errors.push(`Line ${i + 1}: Fee must be greater than $0`);
    // Surgical codes require X-ray
    if (['D7210', 'D7240', 'D3310', 'D3320', 'D3330'].includes(line.cdtCode)) {
      warnings.push(`Line ${i + 1}: ${line.cdtCode} — consider attaching periapical X-ray for better reimbursement`);
    }
    // Implant codes require narrative
    if (line.cdtCode.startsWith('D6')) {
      warnings.push(`Line ${i + 1}: ${line.cdtCode} — implant codes often require a pre-authorization narrative`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}
