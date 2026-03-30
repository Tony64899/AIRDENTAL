// Provider types — moved from App.tsx and extended
// Phase 9: Added locationIds[] for multi-location provider assignment

export type ProviderRole =
  | 'dentist'
  | 'hygienist'
  | 'orthodontist'
  | 'endodontist'
  | 'oral_surgeon'
  | 'periodontist'
  | 'other';

export type ProviderStatus = 'active' | 'inactive';

export interface Provider {
  id: string;
  name: string;
  operatory: string;
  role?: ProviderRole;

  // ⚠️ HIPAA: Individual NPI — never log or expose in URLs
  npi?: string;        // National Provider Identifier Type 1 (individual)

  specialty?: string;
  clinicId?: string;

  /** @deprecated use locationIds[] for Phase 9+ multi-location support */
  locationId?: string;

  /** Phase 9: one provider can work at multiple locations */
  locationIds: string[];

  userId?: string;     // links to the User account (from auth.ts)
  status?: ProviderStatus;
  color?: string;      // calendar display color (hex)
}
