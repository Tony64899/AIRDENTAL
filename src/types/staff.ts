// Staff / user management types — extends the base User from auth.ts.
// Phase 10 initial. Updated per air_dental_staff_management_tab_spec.md.
// ⚠️ HIPAA: Staff records are not PHI but do contain PII — handle with care.

import type { User, UserRole } from './auth';

/**
 * Full lifecycle of a staff user account.
 * - invited       → invite email sent, not yet accepted
 * - pending_setup → accepted invite, hasn't completed profile / MFA
 * - active        → fully set up and can log in
 * - suspended     → admin-suspended (temporary)
 * - locked        → locked after too many failed login attempts
 * - deactivated   → soft-deleted; cannot log in, data preserved
 */
export type AccountStatus =
  | 'invited'
  | 'pending_setup'
  | 'active'
  | 'suspended'
  | 'locked'
  | 'deactivated';

export interface StaffMember extends User {
  /** Which physical locations this staff member works at. */
  locationIds:    string[];
  /** Links to a Provider record for clinical roles (dentist, hygienist). */
  providerId?:    string;
  phone?:         string;
  jobTitle?:      string;
  hireDate?:      string;         // ISO YYYY-MM-DD
  /**
   * userId of direct manager — used to build the org chart.
   * undefined = top of hierarchy (practice owner).
   */
  reportsTo?:     string;
  /** Full account lifecycle status (more granular than isActive). */
  accountStatus:  AccountStatus;
  /** Department grouping for org chart views. */
  department?:    'clinical' | 'admin' | 'front_desk' | 'management';
}

/** Payload for inviting a new team member. */
export interface UserInvite {
  email:       string;
  firstName:   string;
  lastName:    string;
  role:        UserRole;
  locationIds: string[];
  jobTitle?:   string;
}

/** Status filter for the staff list. */
export type StaffFilter = 'all' | 'active' | 'inactive';

/** Staff module tile shown on the Staff launcher page. */
export interface StaffModuleTile {
  id:          string;
  title:       string;
  subtitle?:   string;
  icon:        string;  // lucide icon name
  route:       string;
  color:       string;  // Tailwind bg class
  textColor:   string;  // Tailwind text class
  isBuilt:     boolean;
  requiresRole?: ('admin')[];  // if set, only listed roles can see this tile
}
