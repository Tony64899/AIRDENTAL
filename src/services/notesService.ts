// notesService — in-memory CRUD for the 4 note types.
// TODO: connect to NestJS /notes endpoints — replace in-memory store.
// ⚠️ HIPAA: audit log stores METADATA ONLY — never the note body.

import type { Note, NoteType, LabStatus, NoteActivityEntry } from '../types/notes';
import type { UserRole } from '../types/auth';
import { ROLE_CAN_VIEW, LAB_STEPS } from '../types/notes';

// ── Utilities ─────────────────────────────────────────────────────────────────
const uid   = () => crypto.randomUUID();
const now   = () => new Date().toISOString();
const delay = (ms = 200) => new Promise<void>(r => setTimeout(r, ms));

function hoursAgo(h: number): string {
  const dt = new Date('2026-04-01T12:00:00.000Z');
  dt.setHours(dt.getHours() - h);
  return dt.toISOString();
}
function daysAgo(d: number): string {
  const dt = new Date('2026-04-01T12:00:00.000Z');
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}
// Convenience: days + extra hours offset for intermediate activity entries
function daysAndHoursAgo(d: number, h: number): string {
  const dt = new Date('2026-04-01T12:00:00.000Z');
  dt.setDate(dt.getDate() - d);
  dt.setHours(dt.getHours() - h);
  return dt.toISOString();
}

function labStepLabel(key: LabStatus): string {
  return LAB_STEPS.find(s => s.key === key)?.label ?? key;
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_NOTES: Note[] = [

  // ── Clinical ──────────────────────────────────────────────────────────────
  {
    id: 'n-c-1', type: 'clinical',
    title: 'D0120 Routine Exam Findings',
    body: 'Routine oral exam completed today. Overall periodontal status satisfactory. Mild bleeding on probing noted at lower left first premolar. Re-evaluate at next visit. No significant radiographic findings.',
    authorId: 'u-2', authorName: 'Dr. James Kim', authorRole: 'dentist',
    createdAt: hoursAgo(2), updatedAt: hoursAgo(2),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-c-2', type: 'clinical',
    title: 'SRP Post-Treatment Follow-Up',
    body: 'Patient returned 4 weeks after full-mouth SRP. Overall improvement in inflammation. Pocket depths reduced in upper right posterior region. Oral hygiene instruction reinforced. Re-evaluate in 6 weeks.',
    authorId: 'u-3', authorName: 'Sarah Chen, RDH', authorRole: 'hygienist',
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-c-3', type: 'clinical',
    title: 'Crown Prep — Upper Left #14',
    body: 'Full crown preparation completed on upper left first molar. Final impression taken with PVS material. Temporary crown placed with Temp-Bond. Shade selection: A2. Lab instructions sent. Delivery appointment scheduled in 2 weeks.',
    authorId: 'u-2', authorName: 'Dr. James Kim', authorRole: 'dentist',
    createdAt: daysAgo(2), updatedAt: daysAgo(2),
    isPinned: true, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-c-4', type: 'clinical',
    title: 'Full-Mouth Perio Charting Summary',
    body: 'Full-mouth periodontal charting completed. 12 sites with probing depths ≥4mm identified. Concentrated in upper anterior and lower left posterior. Specialist referral under consideration. Treatment plan discussion scheduled at next appointment.',
    authorId: 'u-3', authorName: 'Sarah Chen, RDH', authorRole: 'hygienist',
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  {
    id: 'n-f-1', type: 'finance',
    title: 'Delta Dental Claim Follow-Up',
    body: 'Claim submitted 2 weeks ago — still showing "In Process" on provider portal. Called Delta Dental; rep confirmed processing delay due to high volume. Expected resolution within 5 business days. Will follow up Friday if no update.',
    authorId: 'u-4', authorName: 'Maria Gonzalez', authorRole: 'front_desk',
    createdAt: hoursAgo(3), updatedAt: hoursAgo(1),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-f-2', type: 'finance',
    title: 'Patient Payment Plan Agreement',
    body: 'Crown treatment payment plan signed. 3-month installment: $320/month. First payment due April 1. Patient signature and contact info confirmed. Receipt copy sent to patient email.',
    authorId: 'u-1', authorName: 'Admin', authorRole: 'admin',
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-f-3', type: 'finance',
    title: 'Insurance Pre-Auth Request Submitted',
    body: 'Pre-authorization request submitted to Cigna for implant procedure. Auth# AUTH-2026-0329. Expected coverage: 60%. Patient notified of estimated out-of-pocket: $1,400. Allow 7–10 business days for response.',
    authorId: 'u-4', authorName: 'Maria Gonzalez', authorRole: 'front_desk',
    createdAt: daysAgo(2), updatedAt: daysAgo(2),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-f-4', type: 'finance',
    title: 'EOB Review Needed — Aetna',
    body: 'Aetna EOB received — two procedure codes processed as "not a covered benefit." Possible coding error. Requested clinical records review from Dr. Kim. Appeal deadline: April 15. Preparing resubmission.',
    authorId: 'u-1', authorName: 'Admin', authorRole: 'admin',
    createdAt: daysAgo(4), updatedAt: daysAgo(4),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },

  // ── Office ────────────────────────────────────────────────────────────────
  {
    id: 'n-o-1', type: 'office',
    title: 'April Staff Meeting Agenda',
    body: 'Date: April 7 (Tue) 8:00 AM | Location: Conference Room\n\nAgenda:\n1. New scheduling system rollout timeline\n2. April closure notice (4/5 Dr. Park out)\n3. Infection control update — new glove supplier\n4. Patient satisfaction survey results\n5. Other\n\nAttendance required. Notify in advance if unable to attend.',
    authorId: 'u-1', authorName: 'Admin', authorRole: 'admin',
    createdAt: hoursAgo(1), updatedAt: hoursAgo(1),
    isPinned: true, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-o-2', type: 'office',
    title: 'Schedule Change Notice — Dr. Park Out 4/5',
    body: 'Dr. Park out on Saturday April 5. 12 patients on schedule — all contacted by phone. 4 rescheduled to 4/12, remainder moved to May+. Front desk to send reminder texts.',
    authorId: 'u-4', authorName: 'Maria Gonzalez', authorRole: 'front_desk',
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-o-3', type: 'office',
    title: 'Supply Order — Gloves + Masks',
    body: 'Ordered from Patterson Dental:\n- Nitrile gloves (M): 10 boxes\n- Nitrile gloves (S): 5 boxes\n- Level 3 surgical masks: 20 boxes\nExpected delivery: April 3. PO# 2026-0329. Budget approved.',
    authorId: 'u-4', authorName: 'Maria Gonzalez', authorRole: 'front_desk',
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },
  {
    id: 'n-o-4', type: 'office',
    title: 'Reception Onboarding Date Change',
    body: 'New reception staff onboarding rescheduled:\nOriginal: March 28 → New: April 4, 2:00 PM\nReason: Trainer schedule conflict. Location unchanged (Consultation Room 2). Materials uploaded to shared drive.',
    authorId: 'u-1', authorName: 'Admin', authorRole: 'admin',
    createdAt: daysAgo(5), updatedAt: daysAgo(5),
    isPinned: false, patientRef: null,
    labStatus: null, labStatusUpdatedBy: null, labStatusUpdatedAt: null, activityLog: [],
  },

  // ── Lab — each note has full activityLog for accountability ───────────────

  // n-l-1: Crown case, status = 'sent' (sent today by Dr. Kim)
  {
    id: 'n-l-1', type: 'lab',
    title: 'Crown Case — Ivoclar e.max — 2 Weeks ETA',
    body: 'Lab: Ace Dental Lab | Sent: 4/1\nCase: PFM full crown → e.max all-ceramic (patient preference)\nShade: A2 (Vita Classic). Prep design: chamfer margin. Contacts: medium. Occlusion: reduce in centric 0.5mm.\nEstimated return: 2 weeks (April 14). Rush not requested.',
    authorId: 'u-2', authorName: 'Dr. James Kim', authorRole: 'dentist',
    createdAt: hoursAgo(4), updatedAt: hoursAgo(3),
    isPinned: false, patientRef: null,
    labStatus: 'sent',
    labStatusUpdatedBy: 'Dr. James Kim',
    labStatusUpdatedAt: hoursAgo(3),
    activityLog: [
      { id: 'al-1-1', userId: 'u-2', userName: 'Dr. James Kim', action: 'created',        detail: 'Note created',                  timestamp: hoursAgo(4) },
      { id: 'al-1-2', userId: 'u-2', userName: 'Dr. James Kim', action: 'status_changed', detail: 'Status updated to Sent',         timestamp: hoursAgo(3) },
    ],
  },

  // n-l-2: Partial denture, status = 'at_lab' (admin confirmed receipt at lab)
  {
    id: 'n-l-2', type: 'lab',
    title: 'Lower Partial Denture — Adjustment Request',
    body: 'Lower partial denture returned due to poor clasp fit. Correction instructions: re-contour rest seats on #28 and #29. Replace discolored denture base section. Lab rework ETA: 5 business days. Patient notified.',
    authorId: 'u-2', authorName: 'Dr. James Kim', authorRole: 'dentist',
    createdAt: daysAgo(2), updatedAt: daysAndHoursAgo(0, 6),
    isPinned: false, patientRef: null,
    labStatus: 'at_lab',
    labStatusUpdatedBy: 'Admin',
    labStatusUpdatedAt: daysAndHoursAgo(0, 6),
    activityLog: [
      { id: 'al-2-1', userId: 'u-2', userName: 'Dr. James Kim', action: 'created',        detail: 'Note created',                  timestamp: daysAgo(2)             },
      { id: 'al-2-2', userId: 'u-2', userName: 'Dr. James Kim', action: 'status_changed', detail: 'Status updated to Sent',         timestamp: daysAndHoursAgo(1, 4)  },
      { id: 'al-2-3', userId: 'u-1', userName: 'Admin',         action: 'status_changed', detail: 'Status updated to At Lab',       timestamp: daysAndHoursAgo(0, 6)  },
    ],
  },

  // n-l-3: Aligner trays, status = 'preparing' (scans done, not yet shipped)
  {
    id: 'n-l-3', type: 'lab',
    title: 'Clear Aligner Tray Fabrication Order',
    body: 'Clear aligner series — fabricated in-house lab (not Invisalign).\nScans: iTero scan files transmitted 3/30\nEstimated trays: 24 upper / 20 lower\nFirst tray delivery appointment to be scheduled upon receipt. ETA: 3 weeks.',
    authorId: 'u-2', authorName: 'Dr. James Kim', authorRole: 'dentist',
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
    isPinned: false, patientRef: null,
    labStatus: 'preparing',
    labStatusUpdatedBy: 'Dr. James Kim',
    labStatusUpdatedAt: daysAgo(3),
    activityLog: [
      { id: 'al-3-1', userId: 'u-2', userName: 'Dr. James Kim', action: 'created',        detail: 'Note created',                  timestamp: daysAgo(3) },
    ],
  },

  // n-l-4: Implant abutment, status = 'shipped' (Glidewell shipped back)
  {
    id: 'n-l-4', type: 'lab',
    title: 'Implant Abutment Spec — Titanium #30',
    body: 'Custom titanium abutment order for implant #30 (lower right first molar).\nImplant system: Straumann Bone Level RC\nPlatform: 4.1mm RC\nAbutment height: 4mm emergence profile\nMargin: subgingival 1mm buccal, equigingival lingual\nLab: Glidewell. Estimated 10 business days.',
    authorId: 'u-2', authorName: 'Dr. James Kim', authorRole: 'dentist',
    createdAt: daysAgo(7), updatedAt: daysAgo(1),
    isPinned: false, patientRef: null,
    labStatus: 'shipped',
    labStatusUpdatedBy: 'Admin',
    labStatusUpdatedAt: daysAgo(1),
    activityLog: [
      { id: 'al-4-1', userId: 'u-2', userName: 'Dr. James Kim', action: 'created',        detail: 'Note created',                  timestamp: daysAgo(7)             },
      { id: 'al-4-2', userId: 'u-2', userName: 'Dr. James Kim', action: 'status_changed', detail: 'Status updated to Sent',         timestamp: daysAgo(6)             },
      { id: 'al-4-3', userId: 'u-2', userName: 'Dr. James Kim', action: 'status_changed', detail: 'Status updated to At Lab',       timestamp: daysAgo(5)             },
      { id: 'al-4-4', userId: 'u-1', userName: 'Admin',         action: 'status_changed', detail: 'Status updated to Shipped',      timestamp: daysAgo(1)             },
    ],
  },
];

// ── In-memory store ───────────────────────────────────────────────────────────
let _notes: Note[] = SEED_NOTES.map(n => ({
  ...n,
  activityLog: [...n.activityLog],
}));

// ── HIPAA audit log — metadata only, NO note body ─────────────────────────────
type AuditAction = 'view' | 'create' | 'update' | 'delete' | 'pin';
interface NoteAuditEntry {
  noteId:    string;
  noteType:  NoteType;
  userId:    string;
  userRole:  UserRole;
  action:    AuditAction;
  timestamp: string;
}
const _auditLog: NoteAuditEntry[] = [];
function audit(entry: NoteAuditEntry) { _auditLog.push(entry); }

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getNotes(userId: string, userRole: UserRole): Promise<Note[]> {
  await delay(200);
  const allowed = _notes.filter(n => ROLE_CAN_VIEW[n.type].includes(userRole));
  audit({ noteId: '*', noteType: 'office', userId, userRole, action: 'view', timestamp: now() });
  return allowed.map(n => ({ ...n, activityLog: [...n.activityLog] }));
}

export async function getNote(noteId: string, userId: string, userRole: UserRole): Promise<Note | null> {
  await delay(150);
  const note = _notes.find(n => n.id === noteId) ?? null;
  if (note) audit({ noteId, noteType: note.type, userId, userRole, action: 'view', timestamp: now() });
  return note ? { ...note, activityLog: [...note.activityLog] } : null;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createNote(params: {
  type:       NoteType;
  title:      string;
  body:       string;
  authorId:   string;
  authorName: string;
  authorRole: UserRole;
  patientRef?: { patientId: string; displayName: string } | null;
}): Promise<Note> {
  await delay(250);
  const ts = now();
  const isLab = params.type === 'lab';
  const initEntry: NoteActivityEntry = {
    id: uid(), userId: params.authorId, userName: params.authorName,
    action: 'created', detail: 'Note created', timestamp: ts,
  };
  const note: Note = {
    id:                  uid(),
    type:                params.type,
    title:               params.title,
    body:                params.body,
    authorId:            params.authorId,
    authorName:          params.authorName,
    authorRole:          params.authorRole,
    createdAt:           ts,
    updatedAt:           ts,
    isPinned:            false,
    patientRef:          params.patientRef ?? null,
    labStatus:           isLab ? 'preparing' : null,
    labStatusUpdatedBy:  isLab ? params.authorName : null,
    labStatusUpdatedAt:  isLab ? ts : null,
    activityLog:         isLab ? [initEntry] : [],
  };
  _notes = [note, ..._notes];
  audit({ noteId: note.id, noteType: note.type, userId: params.authorId, userRole: params.authorRole, action: 'create', timestamp: ts });
  return { ...note, activityLog: [...note.activityLog] };
}

export async function updateNote(
  noteId:   string,
  patch:    Partial<Pick<Note, 'title' | 'body' | 'type' | 'patientRef' | 'labStatus'>>,
  userId:   string,
  userRole: UserRole,
): Promise<Note> {
  await delay(180);
  _notes = _notes.map(n =>
    n.id === noteId ? { ...n, ...patch, updatedAt: now() } : n,
  );
  const updated = _notes.find(n => n.id === noteId)!;
  audit({ noteId, noteType: updated.type, userId, userRole, action: 'update', timestamp: now() });
  return { ...updated, activityLog: [...updated.activityLog] };
}

export async function deleteNote(noteId: string, userId: string, userRole: UserRole): Promise<void> {
  await delay(200);
  const note = _notes.find(n => n.id === noteId);
  if (note) audit({ noteId, noteType: note.type, userId, userRole, action: 'delete', timestamp: now() });
  _notes = _notes.filter(n => n.id !== noteId);
}

export async function pinNote(noteId: string, pinned: boolean, userId: string, userRole: UserRole): Promise<Note> {
  await delay(150);
  _notes = _notes.map(n =>
    n.id === noteId ? { ...n, isPinned: pinned, updatedAt: now() } : n,
  );
  const updated = _notes.find(n => n.id === noteId)!;
  audit({ noteId, noteType: updated.type, userId, userRole, action: 'pin', timestamp: now() });
  return { ...updated, activityLog: [...updated.activityLog] };
}

export async function updateLabStatus(
  noteId:   string,
  status:   LabStatus,
  userId:   string,
  userName: string,
  userRole: UserRole,
): Promise<Note> {
  await delay(150);
  const ts = now();
  const entry: NoteActivityEntry = {
    id:        uid(),
    userId,
    userName,
    action:    'status_changed',
    detail:    `Status updated to ${labStepLabel(status)}`,
    timestamp: ts,
  };
  _notes = _notes.map(n => {
    if (n.id !== noteId) return n;
    return {
      ...n,
      labStatus:           status,
      labStatusUpdatedBy:  userName,
      labStatusUpdatedAt:  ts,
      updatedAt:           ts,
      activityLog:         [...n.activityLog, entry],
    };
  });
  const updated = _notes.find(n => n.id === noteId)!;
  audit({ noteId, noteType: updated.type, userId, userRole, action: 'update', timestamp: ts });
  return { ...updated, activityLog: [...updated.activityLog] };
}

export function getAuditLog(): Readonly<NoteAuditEntry[]> {
  return [..._auditLog];
}
