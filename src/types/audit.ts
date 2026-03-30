// Clinical audit log types — PHI access and mutation events.
// ⚠️ HIPAA: Every view/edit of patient data must generate an entry.
// This is separate from the auth audit log (login/logout) in src/types/auth.ts.

import type { UserRole } from './auth';

export type AuditCategory =
  | 'patient_view'     // patient chart opened
  | 'patient_edit'     // demographics / contact updated
  | 'clinical_note'    // SOAP note viewed, created, or edited
  | 'medical_history'  // medical history viewed or updated
  | 'odontogram'       // tooth chart charted
  | 'xray_view'        // X-ray image viewed
  | 'xray_upload'      // X-ray uploaded
  | 'billing_view'     // billing ledger viewed
  | 'claim_submit'     // insurance claim submitted
  | 'claim_update'     // claim status changed
  | 'payment'          // payment recorded
  | 'user_login'       // user authenticated (from auth service)
  | 'user_logout'      // session ended
  | 'user_invite'      // new staff user invited
  | 'user_deactivate'  // staff account deactivated
  | 'settings_change'  // clinic settings updated
  | 'integration';     // integration connected / key rotated

export interface ClinicalAuditEntry {
  id:          string;
  timestamp:   string;       // ISO datetime
  category:    AuditCategory;
  action:      string;       // human-readable, e.g. "Viewed patient chart"
  userId:      string;
  userName:    string;       // "Dr. Sarah Chen"
  userRole:    UserRole;
  patientId?:  string;       // ⚠️ PHI-adjacent — only for patient-scoped events
  patientName?: string;      // display only — omit from CSV exports
  locationId?: string;
  details?:    string;       // extra context (e.g. tooth #, claim ID)
  ipAddress?:  string;       // stubbed — set by server in production
}
