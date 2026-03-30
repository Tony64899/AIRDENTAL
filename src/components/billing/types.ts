// types.ts — all billing TypeScript interfaces (Phase 6)
// ⚠️ HIPAA: All billing data is PHI. Audit-log every read and mutation.

export interface CdtCode {
  code:        string;
  category:    string;
  description: string;
  layperson:   string;    // patient-friendly description
  defaultFee:  number;    // cents (UCR fee)
}

export interface FeeScheduleEntry {
  cdtCode:       string;
  allowedAmount: number;  // cents
  patientCopay?: number;  // cents
}

export interface FeeSchedule {
  id:            string;
  name:          string;
  type:          'UCR' | 'Insurance';
  effectiveDate: string;  // ISO date
  fees:          FeeScheduleEntry[];
}

export type TreatmentEntryStatus = 'planned' | 'completed' | 'billed' | 'paid';

export interface TreatmentEntry {
  id:           string;
  patientId:    string;
  providerId:   string;
  date:         string;         // ISO date
  toothNumber?: number;
  surfaces?:    string[];
  cdtCode:      string;
  description:  string;
  fee:          number;         // cents charged
  insurancePaid?: number;       // cents
  patientPaid?:   number;       // cents
  status:       TreatmentEntryStatus;
  claimId?:     string;
  notes?:       string;
}

export type ClaimStatus =
  | 'draft' | 'ready' | 'submitted' | 'acknowledged'
  | 'pending' | 'paid' | 'denied' | 'rejected' | 'appealed';

export interface ClaimLine {
  lineNumber:            number;
  dateOfService:         string;
  cdtCode:               string;
  toothNumber?:          number;
  surfaces?:             string[];
  fee:                   number;   // cents
  status:                'pending' | 'paid' | 'denied' | 'adjusted';
  allowedAmount?:        number;
  insurancePaid?:        number;
  adjustmentAmount?:     number;
  adjustmentReason?:     string;
  patientResponsibility?: number;
}

export interface Claim {
  id:                       string;
  patientId:                string;
  patientName:              string;
  insurancePlanId:          string;
  insuranceName:            string;
  claimType:                'P' | 'S';
  status:                   ClaimStatus;
  dateCreated:              string;
  dateSubmitted?:           string;
  totalCharged:             number;
  totalAllowed?:            number;
  totalInsurancePaid?:      number;
  totalPatientResponsibility?: number;
  lines:                    ClaimLine[];
  notes?:                   string;
}

export type PaymentMethod = 'Cash' | 'Check' | 'CreditCard' | 'DebitCard' | 'ACH' | 'CareCredit';

export interface PaymentAllocation {
  treatmentEntryId: string;
  amount:           number;
}

export interface Payment {
  id:              string;
  patientId:       string;
  patientName:     string;
  date:            string;
  amount:          number;        // cents
  method:          PaymentMethod;
  referenceNumber?: string;
  appliedTo:       PaymentAllocation[];
  postedBy:        string;
  notes?:          string;
}

export interface RemittanceAdjustment {
  reasonCode:  string;
  groupCode:   string;
  amount:      number;
  description: string;
}

export interface RemittanceLineDetail {
  cdtCode:     string;
  charged:     number;
  allowed:     number;
  paid:        number;
  adjustments: RemittanceAdjustment[];
}

export interface RemittanceClaim {
  claimId:               string;
  patientName:           string;
  dateOfService:         string;
  totalCharged:          number;
  totalAllowed:          number;
  totalPaid:             number;
  patientResponsibility: number;
  adjustments:           RemittanceAdjustment[];
  lineDetails:           RemittanceLineDetail[];
}

export interface RemittanceAdvice {
  id:           string;
  receivedDate: string;
  payerName:    string;
  checkNumber?: string;
  checkDate?:   string;
  totalPaid:    number;
  posted:       boolean;
  claims:       RemittanceClaim[];
}
