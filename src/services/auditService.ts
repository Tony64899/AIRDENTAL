// auditService — clinical PHI access audit log (HIPAA required).
// The module-level AUDIT_LOG array in mockAuditLog.ts acts as in-session persistence.
// TODO: connect to backend API — every entry must be stored in append-only Azure Table Storage.
// ⚠️ HIPAA: Audit log must be retained for 7 years per 45 CFR §164.312(b).

import type { ClinicalAuditEntry, AuditCategory } from '../types/audit';
import type { UserRole } from '../types/auth';
import { AUDIT_LOG, appendAuditEntry } from '../constants/mockAuditLog';

export interface AuditQuery {
  clinicId?:  string;
  category?:  AuditCategory;
  userId?:    string;
  patientId?: string;
  fromDate?:  string;   // ISO YYYY-MM-DD
  toDate?:    string;   // ISO YYYY-MM-DD
  search?:    string;   // free text on action + details
  limit?:     number;
  offset?:    number;
}

export interface AuditQueryResult {
  entries: ClinicalAuditEntry[];
  total:   number;
}

const delay = (ms = 150) => new Promise<void>(r => setTimeout(r, ms));

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Log a PHI access event. Call this from every service function that touches patient data.
 * Returns immediately after appending — does not block the calling operation.
 */
export function logAuditEvent(params: {
  category:    AuditCategory;
  action:      string;
  userId:      string;
  userName:    string;
  userRole:    UserRole;
  patientId?:  string;
  patientName?: string;
  locationId?: string;
  details?:    string;
}): void {
  const entry: ClinicalAuditEntry = {
    id:          `al-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp:   new Date().toISOString(),
    ipAddress:   '127.0.0.1', // TODO: real IP from server session
    ...params,
  };
  appendAuditEntry(entry);
  // TODO: POST to /api/audit-log (fire-and-forget, non-blocking)
}

// ── Query ─────────────────────────────────────────────────────────────────────

export async function queryAuditLog(q: AuditQuery = {}): Promise<AuditQueryResult> {
  await delay();

  let entries = [...AUDIT_LOG];

  if (q.category)  entries = entries.filter(e => e.category  === q.category);
  if (q.userId)    entries = entries.filter(e => e.userId    === q.userId);
  if (q.patientId) entries = entries.filter(e => e.patientId === q.patientId);

  if (q.fromDate) {
    const from = new Date(q.fromDate).getTime();
    entries = entries.filter(e => new Date(e.timestamp).getTime() >= from);
  }
  if (q.toDate) {
    const to = new Date(q.toDate + 'T23:59:59Z').getTime();
    entries = entries.filter(e => new Date(e.timestamp).getTime() <= to);
  }

  if (q.search) {
    const term = q.search.toLowerCase();
    entries = entries.filter(e =>
      e.action.toLowerCase().includes(term)   ||
      e.userName.toLowerCase().includes(term) ||
      (e.patientName ?? '').toLowerCase().includes(term) ||
      (e.details ?? '').toLowerCase().includes(term)
    );
  }

  const total = entries.length;

  if (q.offset) entries = entries.slice(q.offset);
  if (q.limit)  entries = entries.slice(0, q.limit);

  return { entries, total };
}

/** Export audit log entries as CSV for compliance downloads. */
export function auditLogToCsv(entries: ClinicalAuditEntry[]): string {
  const headers = ['Timestamp', 'Category', 'Action', 'User', 'Role', 'Patient ID', 'Location', 'Details', 'IP'];
  const rows = entries.map(e => [
    e.timestamp,
    e.category,
    `"${e.action}"`,
    `"${e.userName}"`,
    e.userRole,
    e.patientId  ?? '',
    e.locationId ?? '',
    `"${e.details ?? ''}"`,
    e.ipAddress  ?? '',
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}
