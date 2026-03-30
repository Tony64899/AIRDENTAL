// RBAC permission matrix — defines what each role can do.
// Used by the usePermissions() hook.
// ⚠️ HIPAA: Front desk staff cannot view clinical notes or diagnoses.

import type { UserRole } from '../types/auth';

// All available permissions in the system
export type Permission =
  // Scheduling
  | 'view_schedule'
  | 'create_appointment'
  | 'edit_appointment'
  | 'delete_appointment'

  // Patients
  | 'view_patient_demographics'
  | 'edit_patient_demographics'
  | 'view_clinical_notes'          // ⚠️ HIPAA: front_desk excluded
  | 'edit_clinical_notes'          // ⚠️ HIPAA: dentist + hygienist only
  | 'view_medical_history'
  | 'edit_medical_history'

  // Billing
  | 'view_billing'
  | 'create_claim'
  | 'edit_claim'
  | 'record_payment'

  // X-rays
  | 'view_xray'
  | 'upload_xray'

  // Admin
  | 'view_analytics'
  | 'manage_users'
  | 'manage_clinic_settings'
  | 'view_audit_log';

// Defines which permissions each role has
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_schedule', 'create_appointment', 'edit_appointment', 'delete_appointment',
    'view_patient_demographics', 'edit_patient_demographics',
    'view_clinical_notes', 'edit_clinical_notes',
    'view_medical_history', 'edit_medical_history',
    'view_billing', 'create_claim', 'edit_claim', 'record_payment',
    'view_xray', 'upload_xray',
    'view_analytics', 'manage_users', 'manage_clinic_settings', 'view_audit_log',
  ],

  dentist: [
    'view_schedule', 'create_appointment', 'edit_appointment', 'delete_appointment',
    'view_patient_demographics', 'edit_patient_demographics',
    'view_clinical_notes', 'edit_clinical_notes',
    'view_medical_history', 'edit_medical_history',
    'view_billing', 'create_claim', 'edit_claim',
    'view_xray', 'upload_xray',
    'view_analytics',
  ],

  hygienist: [
    'view_schedule', 'create_appointment', 'edit_appointment',
    'view_patient_demographics',
    'view_clinical_notes', 'edit_clinical_notes',
    'view_medical_history', 'edit_medical_history',
    'view_xray', 'upload_xray',
  ],

  front_desk: [
    'view_schedule', 'create_appointment', 'edit_appointment',
    'view_patient_demographics', 'edit_patient_demographics',
    // ⚠️ HIPAA: front_desk cannot see clinical_notes or medical_history details
    'view_billing', 'record_payment',
  ],
};

/**
 * Check if a role has a specific permission.
 * Use the usePermissions() hook in components instead of calling this directly.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
