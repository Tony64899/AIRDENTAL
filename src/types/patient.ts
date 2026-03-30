// Patient types — comprehensive type system for dental patient records.
// Phase 4: Patient Chart module.
// ⚠️ HIPAA: All patient data is PHI. Never log, cache in localStorage, or expose without authorization.

export type BiologicalSex   = 'male' | 'female';
export type PatientStatus   = 'active' | 'inactive' | 'new';
export type InsuranceType   = 'ppo' | 'hmo' | 'medicaid' | 'medicare' | 'cash' | 'other';
export type AllergySeverity = 'mild' | 'moderate' | 'severe';
export type TransactionType =
  | 'charge'
  | 'insurance_payment'
  | 'patient_payment'
  | 'adjustment'
  | 'credit';

export interface PatientAddress {
  street: string;
  city:   string;
  state:  string;
  zip:    string;
}

export interface EmergencyContact {
  name:         string;
  relationship: string;
  phone:        string;
}

export interface Allergy {
  substance: string;
  reaction?: string;
  severity:  AllergySeverity;
}

export interface Medication {
  name:   string;
  dose?:  string;
  notes?: string;
}

export interface MedicalCondition {
  name:   string;
  notes?: string;
  since?: string;  // "2019" or ISO YYYY-MM-DD
}

export interface InsurancePlan {
  type:               InsuranceType;
  carrier:            string;
  groupNumber:        string;
  memberId:           string;
  groupName?:         string;
  subscriberName?:    string;
  relationship:       'self' | 'spouse' | 'child' | 'other';
  // All monetary values are USD cents
  annualMax:          number;
  annualMaxUsed:      number;
  deductible:         number;
  deductibleMet:      number;
  // Coverage percentages 0–100
  preventiveCoverage: number;
  basicCoverage:      number;
  majorCoverage:      number;
  orthoLifetimeMax?:  number;  // cents
}

export interface BillingTransaction {
  id:          string;
  date:        string;          // ISO YYYY-MM-DD
  type:        TransactionType;
  description: string;
  amount:      number;          // cents — positive = charge, negative = payment/credit
  balance:     number;          // running balance after this transaction (cents)
  providerId?: string;
}

export interface Patient {
  id:                   string;
  chartNumber:          string;    // zero-padded 5-digit: "00001"
  firstName:            string;
  lastName:             string;
  dateOfBirth:          string;    // ISO YYYY-MM-DD
  gender:               BiologicalSex;
  phone:                string;
  email?:               string;
  address?:             PatientAddress;
  emergencyContact?:    EmergencyContact;

  // Clinical history
  allergies:            Allergy[];
  medications:          Medication[];
  medicalConditions:    MedicalCondition[];

  // Insurance
  primaryInsurance?:    InsurancePlan;
  secondaryInsurance?:  InsurancePlan;

  // Billing
  balance:              number;    // cents — positive = patient owes, negative = credit
  billingAlert?:        string;    // reason shown when patient has chronic/overdue balance
  transactions:         BillingTransaction[];

  // Meta
  status:               PatientStatus;
  firstVisit?:          string;    // ISO YYYY-MM-DD
  lastVisit?:           string;    // ISO YYYY-MM-DD
  preferredProviderId?: string;
  notes?:               string;
  clinicId:             string;
  locationId:           string;
}

// ── Odontogram types (Phase 5) ────────────────────────────────────────────────
// ⚠️ HIPAA: Tooth chart data is PHI. Every mutation must be audit-logged.

export type TreatmentStatus =
  | 'healthy'
  | 'caries'
  | 'composite'
  | 'amalgam'
  | 'crown'
  | 'missing'
  | 'implant'
  | 'rct'
  | 'veneer'
  | 'onlay'
  | 'watch';

export type SurfaceName =
  | 'mesial'
  | 'distal'
  | 'occlusal'
  | 'buccal'
  | 'lingual'
  | 'incisal';   // anteriors only — replaces occlusal

export interface ToothSurfaceData {
  name:       SurfaceName;
  status:     TreatmentStatus;
  chartedBy:  string;            // provider display name or 'System'
  chartedAt:  string;            // ISO datetime
  notes?:     string;
}

export interface ToothHistoryEntry {
  action:          string;        // e.g. "Applied composite to Occlusal"
  surface?:        SurfaceName;
  previousStatus:  TreatmentStatus;
  newStatus:       TreatmentStatus;
  chartedBy:       string;
  chartedAt:       string;        // ISO datetime
}

export interface ToothState {
  toothNumber:       number;            // 1–32
  surfaces:          ToothSurfaceData[];  // 5 surfaces per tooth
  toothLevelStatus?: TreatmentStatus;   // whole-tooth override (missing, implant, crown)
  notes?:            string;
  cdtCodes?:         string[];          // linked CDT codes e.g. ["D2391", "D2750"]
  history:           ToothHistoryEntry[];
  // Perio placeholders (Phase future — do NOT build UI)
  probingDepths?:    number[];     // [MB, B, DB, ML, L, DL]
  bleeding?:         boolean[];
  recession?:        number[];
}

export interface OdontogramState {
  patientId:      string;
  lastUpdated:    string;           // ISO datetime
  lastUpdatedBy:  string;
  mode:           'existing' | 'planned';
  teeth:          ToothState[];     // always 32 entries, index = toothNumber - 1
}
