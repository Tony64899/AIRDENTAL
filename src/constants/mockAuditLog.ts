// Mock clinical audit log — PHI access events for Phase 10 AuditLogViewer.
// ⚠️ HIPAA: All names/IDs are fictional. Module-level array persists across renders.
// In production: stored in Azure Table Storage / PostgreSQL with 7-year retention.

import type { ClinicalAuditEntry } from '../types/audit';

// Module-level mutable array — simulates server-side persistence across renders.
export const AUDIT_LOG: ClinicalAuditEntry[] = [
  // ── 2026-03-30 (Today) ────────────────────────────────────────────────────
  {
    id: 'al-001', timestamp: '2026-03-30T08:15:22Z',
    category: 'user_login',   action: 'User authenticated via MFA',
    userId: 'u-1', userName: 'Sarah Chen',     userRole: 'admin',
    locationId: 'loc-1', ipAddress: '192.168.1.10',
  },
  {
    id: 'al-002', timestamp: '2026-03-30T08:16:45Z',
    category: 'patient_view', action: 'Viewed patient chart',
    userId: 'u-4', userName: 'James Park',     userRole: 'front_desk',
    patientId: 'pat-1', patientName: 'John Smith',
    locationId: 'loc-1', ipAddress: '192.168.1.14',
  },
  {
    id: 'al-003', timestamp: '2026-03-30T08:45:00Z',
    category: 'xray_view',    action: 'Viewed X-ray image',
    userId: 'u-2', userName: 'Dr. Michael Torres', userRole: 'dentist',
    patientId: 'pat-3', patientName: 'Michael Brown',
    locationId: 'loc-1', details: 'PA - Upper Left Molar', ipAddress: '192.168.1.12',
  },
  {
    id: 'al-004', timestamp: '2026-03-30T09:02:10Z',
    category: 'odontogram',   action: 'Charted tooth conditions',
    userId: 'u-2', userName: 'Dr. Michael Torres', userRole: 'dentist',
    patientId: 'pat-3', patientName: 'Michael Brown',
    locationId: 'loc-1', details: 'Tooth #30 — RCT applied to Occlusal', ipAddress: '192.168.1.12',
  },
  {
    id: 'al-005', timestamp: '2026-03-30T09:30:00Z',
    category: 'billing_view', action: 'Viewed patient billing ledger',
    userId: 'u-4', userName: 'James Park',     userRole: 'front_desk',
    patientId: 'pat-1', patientName: 'John Smith',
    locationId: 'loc-1', ipAddress: '192.168.1.14',
  },
  {
    id: 'al-006', timestamp: '2026-03-30T09:55:30Z',
    category: 'claim_submit', action: 'Insurance claim submitted',
    userId: 'u-4', userName: 'James Park',     userRole: 'front_desk',
    patientId: 'pat-5', patientName: 'Oliver Wilson',
    locationId: 'loc-1', details: 'Claim #CLM-2026-005 · Delta Dental PPO', ipAddress: '192.168.1.14',
  },
  {
    id: 'al-007', timestamp: '2026-03-30T10:10:00Z',
    category: 'patient_view', action: 'Viewed patient chart',
    userId: 'u-3', userName: 'Emily White',    userRole: 'hygienist',
    patientId: 'pat-2', patientName: 'Emma Johnson',
    locationId: 'loc-1', ipAddress: '192.168.1.13',
  },
  {
    id: 'al-008', timestamp: '2026-03-30T10:12:00Z',
    category: 'medical_history', action: 'Viewed medical history',
    userId: 'u-3', userName: 'Emily White',    userRole: 'hygienist',
    patientId: 'pat-2', patientName: 'Emma Johnson',
    locationId: 'loc-1', ipAddress: '192.168.1.13',
  },
  {
    id: 'al-009', timestamp: '2026-03-30T11:00:00Z',
    category: 'xray_upload',  action: 'Uploaded new X-ray image',
    userId: 'u-2', userName: 'Dr. Michael Torres', userRole: 'dentist',
    patientId: 'pat-3', patientName: 'Michael Brown',
    locationId: 'loc-1', details: 'Panoramic · 2 images', ipAddress: '192.168.1.12',
  },
  {
    id: 'al-010', timestamp: '2026-03-30T11:22:00Z',
    category: 'settings_change', action: 'Updated clinic notification settings',
    userId: 'u-1', userName: 'Sarah Chen',     userRole: 'admin',
    locationId: 'loc-1', details: 'SMS reminder 2h rule enabled', ipAddress: '192.168.1.10',
  },

  // ── 2026-03-29 (Yesterday) ────────────────────────────────────────────────
  {
    id: 'al-011', timestamp: '2026-03-29T08:05:00Z',
    category: 'user_login',   action: 'User authenticated via MFA',
    userId: 'u-2', userName: 'Dr. Michael Torres', userRole: 'dentist',
    locationId: 'loc-1', ipAddress: '192.168.1.12',
  },
  {
    id: 'al-012', timestamp: '2026-03-29T08:30:00Z',
    category: 'patient_view', action: 'Viewed patient chart',
    userId: 'u-2', userName: 'Dr. Michael Torres', userRole: 'dentist',
    patientId: 'pat-8', patientName: 'Liam Thompson',
    locationId: 'loc-1', ipAddress: '192.168.1.12',
  },
  {
    id: 'al-013', timestamp: '2026-03-29T08:32:00Z',
    category: 'xray_view',    action: 'Viewed X-ray image',
    userId: 'u-2', userName: 'Dr. Michael Torres', userRole: 'dentist',
    patientId: 'pat-8', patientName: 'Liam Thompson',
    locationId: 'loc-1', details: 'BW - Left Bitewing', ipAddress: '192.168.1.12',
  },
  {
    id: 'al-014', timestamp: '2026-03-29T09:15:00Z',
    category: 'payment',      action: 'Payment recorded',
    userId: 'u-4', userName: 'James Park',     userRole: 'front_desk',
    patientId: 'pat-3', patientName: 'Michael Brown',
    locationId: 'loc-1', details: 'Patient payment · $120.00', ipAddress: '192.168.1.14',
  },
  {
    id: 'al-015', timestamp: '2026-03-29T10:00:00Z',
    category: 'patient_edit', action: 'Updated patient demographics',
    userId: 'u-4', userName: 'James Park',     userRole: 'front_desk',
    patientId: 'pat-6', patientName: 'Ava Martinez',
    locationId: 'loc-1', details: 'Address updated', ipAddress: '192.168.1.14',
  },
  {
    id: 'al-016', timestamp: '2026-03-29T13:45:00Z',
    category: 'user_invite',  action: 'New staff user invited',
    userId: 'u-1', userName: 'Sarah Chen',     userRole: 'admin',
    locationId: 'loc-2', details: 'Invited: s.adams@airdental.com · front_desk', ipAddress: '192.168.1.10',
  },
  {
    id: 'al-017', timestamp: '2026-03-29T15:30:00Z',
    category: 'claim_update', action: 'Claim status updated',
    userId: 'u-4', userName: 'James Park',     userRole: 'front_desk',
    patientId: 'pat-1', patientName: 'John Smith',
    locationId: 'loc-1', details: 'CLM-2026-001 → Paid · ERA received', ipAddress: '192.168.1.14',
  },
  {
    id: 'al-018', timestamp: '2026-03-29T16:00:00Z',
    category: 'user_logout',  action: 'Session ended',
    userId: 'u-2', userName: 'Dr. Michael Torres', userRole: 'dentist',
    locationId: 'loc-1', ipAddress: '192.168.1.12',
  },

  // ── 2026-03-28 ───────────────────────────────────────────────────────────
  {
    id: 'al-019', timestamp: '2026-03-28T09:00:00Z',
    category: 'user_login',   action: 'User authenticated via MFA',
    userId: 'u-5', userName: 'Dr. Priya Patel', userRole: 'dentist',
    locationId: 'loc-2', ipAddress: '10.0.2.5',
  },
  {
    id: 'al-020', timestamp: '2026-03-28T09:10:00Z',
    category: 'patient_view', action: 'Viewed patient chart',
    userId: 'u-5', userName: 'Dr. Priya Patel', userRole: 'dentist',
    patientId: 'pat-4', patientName: 'Sophia Davis',
    locationId: 'loc-2', ipAddress: '10.0.2.5',
  },
  {
    id: 'al-021', timestamp: '2026-03-28T09:35:00Z',
    category: 'odontogram',   action: 'Charted tooth conditions',
    userId: 'u-5', userName: 'Dr. Priya Patel', userRole: 'dentist',
    patientId: 'pat-4', patientName: 'Sophia Davis',
    locationId: 'loc-2', details: 'Tooth #14 — Crown (planned)', ipAddress: '10.0.2.5',
  },
  {
    id: 'al-022', timestamp: '2026-03-28T11:00:00Z',
    category: 'billing_view', action: 'Viewed patient billing ledger',
    userId: 'u-1', userName: 'Sarah Chen',     userRole: 'admin',
    patientId: 'pat-7', patientName: 'William Garcia',
    locationId: 'loc-1', ipAddress: '192.168.1.10',
  },
  {
    id: 'al-023', timestamp: '2026-03-28T14:00:00Z',
    category: 'integration',  action: 'Integration settings updated',
    userId: 'u-1', userName: 'Sarah Chen',     userRole: 'admin',
    locationId: 'loc-1', details: 'Twilio SendGrid API key rotated', ipAddress: '192.168.1.10',
  },

  // ── 2026-03-27 ───────────────────────────────────────────────────────────
  {
    id: 'al-024', timestamp: '2026-03-27T08:00:00Z',
    category: 'user_login',   action: 'User authenticated via MFA',
    userId: 'u-3', userName: 'Emily White',    userRole: 'hygienist',
    locationId: 'loc-1', ipAddress: '192.168.1.13',
  },
  {
    id: 'al-025', timestamp: '2026-03-27T08:20:00Z',
    category: 'patient_view', action: 'Viewed patient chart',
    userId: 'u-3', userName: 'Emily White',    userRole: 'hygienist',
    patientId: 'pat-9', patientName: 'Mia Anderson',
    locationId: 'loc-1', ipAddress: '192.168.1.13',
  },
  {
    id: 'al-026', timestamp: '2026-03-27T08:25:00Z',
    category: 'medical_history', action: 'Updated medical history',
    userId: 'u-3', userName: 'Emily White',    userRole: 'hygienist',
    patientId: 'pat-9', patientName: 'Mia Anderson',
    locationId: 'loc-1', details: 'Added allergy: Sulfa · confirmed with patient', ipAddress: '192.168.1.13',
  },
  {
    id: 'al-027', timestamp: '2026-03-27T10:00:00Z',
    category: 'claim_submit', action: 'Insurance claim submitted',
    userId: 'u-4', userName: 'James Park',     userRole: 'front_desk',
    patientId: 'pat-2', patientName: 'Emma Johnson',
    locationId: 'loc-1', details: 'CLM-2026-008 · Cigna PPO', ipAddress: '192.168.1.14',
  },

  // ── 2026-03-25 ───────────────────────────────────────────────────────────
  {
    id: 'al-028', timestamp: '2026-03-25T09:00:00Z',
    category: 'user_deactivate', action: 'Staff account deactivated',
    userId: 'u-1', userName: 'Sarah Chen',     userRole: 'admin',
    locationId: 'loc-3', details: 'Account deactivated: o.foster@airdental.com — on leave', ipAddress: '192.168.1.10',
  },
  {
    id: 'al-029', timestamp: '2026-03-25T10:30:00Z',
    category: 'settings_change', action: 'Business hours updated',
    userId: 'u-1', userName: 'Sarah Chen',     userRole: 'admin',
    locationId: 'loc-2', details: 'Downtown Office — Saturday hours enabled', ipAddress: '192.168.1.10',
  },
  {
    id: 'al-030', timestamp: '2026-03-25T14:15:00Z',
    category: 'xray_view',    action: 'Viewed X-ray image',
    userId: 'u-6', userName: 'Dr. Carlos Rivera', userRole: 'dentist',
    patientId: 'pat-5', patientName: 'Oliver Wilson',
    locationId: 'loc-3', details: 'FMX — Full Mouth Series', ipAddress: '10.0.3.8',
  },
];

/** Append a new entry at runtime (called by services when PHI is accessed). */
export function appendAuditEntry(entry: ClinicalAuditEntry): void {
  AUDIT_LOG.unshift(entry); // newest first
}
