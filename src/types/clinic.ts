// Clinic and location types — supports multi-tenant architecture from Phase 1
// Phase 9: Extended with InsuranceContract, LocationStats, providerIds, multi-location support
// ⚠️ HIPAA: NPI and Tax ID are PHI-adjacent identifiers — never log or expose in URLs

export interface Operatory {
  id: string;
  name: string;
  locationId: string;
  isActive: boolean;
}

export interface BusinessHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0 = Sunday
  openTime: string;   // HH:MM 24-hour
  closeTime: string;  // HH:MM 24-hour
  isClosed: boolean;
}

// Insurance plan accepted at a given location
export interface InsuranceContract {
  id: string;
  carrier: string;       // e.g. "Delta Dental"
  planType: string;      // e.g. "PPO", "HMO", "Medicaid"
  contractId?: string;   // carrier-assigned contract number
  effectiveDate: string; // ISO YYYY-MM-DD
  expiresDate?: string;  // ISO YYYY-MM-DD — undefined = no expiry
  isActive: boolean;
}

// Computed dashboard stats per location — refreshed on page load
export interface LocationStats {
  locationId: string;
  todayAppointments: number;
  todayProduction: number;    // USD cents
  providerCount: number;
  operatoryCount: number;     // active operatories only
}

// A single physical office location
export interface Location {
  id: string;
  clinicId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax?: string;
  email?: string;
  timezone: string;
  operatories: Operatory[];
  businessHours: BusinessHours[];
  insuranceContracts: InsuranceContract[];
  providerIds: string[];    // references Provider.id — denormalized for fast lookup
  isActive: boolean;
  isPrimary: boolean;

  // ⚠️ HIPAA: NPI and Tax ID — never log or expose in URLs or client-side state logs
  npi?: string;    // National Provider Identifier Type 2 (organizational)
  taxId?: string;  // EIN — shown masked in UI: **-***XXXX
}

// Top-level clinic / organization — may have 1+ locations
export interface Clinic {
  id: string;
  name: string;
  logoUrl?: string;
  subscriptionTier?: 'starter' | 'professional' | 'enterprise';
  locations: Location[];
  createdAt: string;
}
