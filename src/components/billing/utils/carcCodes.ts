// carcCodes.ts — CARC (Claim Adjustment Reason Code) descriptions.
// ⚠️ HIPAA: Adjustment reason codes may be associated with PHI claim data.

export const CARC_CODES: Record<string, string> = {
  '1':  'Deductible amount',
  '2':  'Coinsurance amount',
  '3':  'Co-payment amount',
  '4':  'The procedure code is inconsistent with the modifier used',
  '16': 'Claim/service lacks information which is needed for adjudication',
  '18': 'Exact duplicate claim/service',
  '29': 'The time limit for filing has expired',
  '45': 'Charge exceeds fee schedule/maximum allowable',
  '50': 'These are non-covered services',
  '96': 'Non-covered charge(s)',
  '97': 'The benefit for this service is included in the payment/allowance for another service',
  'CO': 'Contractual Obligation — adjustment per provider contract',
  'PR': 'Patient Responsibility',
  'OA': 'Other Adjustment',
};
