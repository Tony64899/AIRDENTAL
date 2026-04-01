// notesService — in-memory CRUD for the 4 note types.
// TODO: connect to NestJS /notes endpoints — replace in-memory store.
// ⚠️ HIPAA: audit log stores METADATA ONLY — never the note body.

import type { Note, NoteType, LabStatus } from '../types/notes';
import type { UserRole } from '../types/auth';
import { ROLE_CAN_VIEW } from '../types/notes';

// ── Utilities ─────────────────────────────────────────────────────────────────
const uid  = () => crypto.randomUUID();
const now  = () => new Date().toISOString();
const delay = (ms = 200) => new Promise<void>(r => setTimeout(r, ms));

// Offset from today (2026-03-31) for seed timestamps
function daysAgo(d: number): string {
  const dt = new Date('2026-03-31T12:00:00.000Z');
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}
function hoursAgo(h: number): string {
  const dt = new Date('2026-03-31T12:00:00.000Z');
  dt.setHours(dt.getHours() - h);
  return dt.toISOString();
}

// ── Seed data (16 notes, 4 per type, Korean/English mixed, PHI-free) ─────────
const SEED_NOTES: Note[] = [
  // ── Clinical ──────────────────────────────────────────────────────────────
  {
    id:         'n-c-1',
    type:       'clinical',
    title:      'D0120 정기검진 소견',
    body:       '오늘 정기 구강검진 시행. 전반적인 치주상태 양호. 하악 좌측 제1소구치 부위 탐침 시 약간의 출혈 확인됨. 다음 내원 시 재평가 예정. 방사선 사진상 특이소견 없음.',
    authorId:   'u-2',
    authorName: 'Dr. James Kim',
    authorRole: 'dentist',
    createdAt:  hoursAgo(2),
    updatedAt:  hoursAgo(2),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-c-2',
    type:       'clinical',
    title:      'SRP 시술 후 경과 관찰',
    body:       'Full-mouth SRP 완료 후 4주 재내원. 전반적으로 염증 소견 호전됨. 상악 우측 구치부 포켓 깊이 감소 확인. 구강 위생 교육 재시행. 6주 후 재평가 예정.',
    authorId:   'u-3',
    authorName: 'Sarah Chen, RDH',
    authorRole: 'hygienist',
    createdAt:  daysAgo(1),
    updatedAt:  daysAgo(1),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-c-3',
    type:       'clinical',
    title:      'Crown prep — upper left #14',
    body:       'Full crown preparation completed on upper left first molar. Final impression taken with PVS material. Temporary crown placed with Temp-Bond. Shade selection: A2. Lab instructions sent. Delivery appointment scheduled in 2 weeks.',
    authorId:   'u-2',
    authorName: 'Dr. James Kim',
    authorRole: 'dentist',
    createdAt:  daysAgo(2),
    updatedAt:  daysAgo(2),
    isPinned:   true,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-c-4',
    type:       'clinical',
    title:      'Perio charting 결과 요약',
    body:       '전악 치주 차팅 완료. 총 12개 부위에서 4mm 이상 포켓 확인. 상악 전치부 및 하악 좌측 구치부 집중 치료 필요. 치주과 전문의 의뢰 검토 중. 다음 방문 시 치주 치료 계획 상담 예정.',
    authorId:   'u-3',
    authorName: 'Sarah Chen, RDH',
    authorRole: 'hygienist',
    createdAt:  daysAgo(3),
    updatedAt:  daysAgo(3),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  {
    id:         'n-f-1',
    type:       'finance',
    title:      'Delta Dental claim follow-up',
    body:       'Claim submitted 2 weeks ago — still showing "In Process" on provider portal. Called Delta Dental; rep confirmed processing delay due to high volume. Expected resolution within 5 business days. Will follow up Friday if no update.',
    authorId:   'u-4',
    authorName: 'Maria Gonzalez',
    authorRole: 'front_desk',
    createdAt:  hoursAgo(3),
    updatedAt:  hoursAgo(1),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-f-2',
    type:       'finance',
    title:      '환자 분할납부 동의 내용',
    body:       '크라운 치료비 전액에 대해 3개월 분할납부 동의서 작성 완료. 월 $320씩 3회 납부 예정. 첫 납부일: 4월 1일. 환자 서명 및 연락처 확인 완료. 영수증 사본 환자 이메일로 발송.',
    authorId:   'u-1',
    authorName: 'Admin',
    authorRole: 'admin',
    createdAt:  daysAgo(1),
    updatedAt:  daysAgo(1),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-f-3',
    type:       'finance',
    title:      '보험 pre-auth 요청 완료',
    body:       'Cigna 보험사에 임플란트 시술 사전승인 요청 완료. 승인번호: AUTH-2026-0329. 예상 보험 적용 범위 60%. 환자에게 본인 부담 예상액 $1,400 안내 완료. 승인 결과 통보까지 7~10 영업일 소요 예정.',
    authorId:   'u-4',
    authorName: 'Maria Gonzalez',
    authorRole: 'front_desk',
    createdAt:  daysAgo(2),
    updatedAt:  daysAgo(2),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-f-4',
    type:       'finance',
    title:      'EOB 재검토 필요',
    body:       'Aetna EOB received — 두 개의 치료 항목이 "not a covered benefit"으로 처리됨. 코딩 오류 가능성 있음. Dr. Kim에게 임상 기록 확인 요청. Appeal 제출 기한: 4월 15일. 재청구 준비 중.',
    authorId:   'u-1',
    authorName: 'Admin',
    authorRole: 'admin',
    createdAt:  daysAgo(4),
    updatedAt:  daysAgo(4),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },

  // ── Office ────────────────────────────────────────────────────────────────
  {
    id:         'n-o-1',
    type:       'office',
    title:      '4월 직원 회의 안건',
    body:       '일시: 4월 7일 (화) 오전 8시 | 장소: 회의실\n\n안건:\n1. 신규 예약 시스템 전환 일정 공유\n2. 4월 휴진일 확인 (4/5 Dr. Park 부재)\n3. 감염 관리 업데이트 — 새 글로브 공급업체 안내\n4. 환자 만족도 설문 결과 리뷰\n5. 기타\n\n참석 필수. 부재 시 사전 공지 바랍니다.',
    authorId:   'u-1',
    authorName: 'Admin',
    authorRole: 'admin',
    createdAt:  hoursAgo(1),
    updatedAt:  hoursAgo(1),
    isPinned:   true,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-o-2',
    type:       'office',
    title:      '스케줄 조정 공지 — 4/5 Dr. Park 부재',
    body:       'Dr. Park 4월 5일 (토) 개인 사정으로 부재. 해당 날짜 예약된 환자 12명 → 이미 전화 연락 완료. 4명은 4/12로 변경, 나머지는 5월 이후 재예약. Front desk에서 리마인더 문자 발송 예정.',
    authorId:   'u-4',
    authorName: 'Maria Gonzalez',
    authorRole: 'front_desk',
    createdAt:  daysAgo(1),
    updatedAt:  daysAgo(1),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-o-3',
    type:       'office',
    title:      'Supply order — gloves + masks',
    body:       'Ordered from Patterson Dental:\n- Nitrile gloves (M): 10 boxes\n- Nitrile gloves (S): 5 boxes\n- Level 3 surgical masks: 20 boxes\nExpected delivery: April 3. Placed by Maria. PO# 2026-0329. Budget approved by Admin.',
    authorId:   'u-4',
    authorName: 'Maria Gonzalez',
    authorRole: 'front_desk',
    createdAt:  daysAgo(3),
    updatedAt:  daysAgo(3),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },
  {
    id:         'n-o-4',
    type:       'office',
    title:      'Reception 교육 일정 변경',
    body:       '신규 리셉션 직원 온보딩 교육 일정 변경:\n기존: 3월 28일 → 변경: 4월 4일 오후 2시\n사유: 강사 일정 조정. 교육 장소 동일 (2번 상담실). 교육 자료는 공용 드라이브에 업로드 완료.',
    authorId:   'u-1',
    authorName: 'Admin',
    authorRole: 'admin',
    createdAt:  daysAgo(5),
    updatedAt:  daysAgo(5),
    isPinned:   false,
    patientRef: null,
    labStatus:  null,
  },

  // ── Lab — each note carries a labStatus showing case progress ─────────────
  {
    id:         'n-l-1',
    type:       'lab',
    title:      'Crown case — Ivoclar e.max — 2주 예상',
    body:       'Lab: Ace Dental Lab | Sent: 4/1\nCase: PFM full crown → e.max all-ceramic (patient preference)\nShade: A2 (Vita Classic). Prep design: chamfer margin. Contacts: medium. Occlusion: reduce in centric 0.5mm.\nEstimated return: 2 weeks (April 14). Rush not requested.',
    authorId:   'u-2',
    authorName: 'Dr. James Kim',
    authorRole: 'dentist',
    createdAt:  hoursAgo(4),
    updatedAt:  hoursAgo(4),
    isPinned:   false,
    patientRef: null,
    labStatus:  'sent',       // just sent to lab today
  },
  {
    id:         'n-l-2',
    type:       'lab',
    title:      'Lower partial denture 수정 요청',
    body:       '하악 국소의치 clasp 부위 적합성 불량으로 반송. 수정 지시: #28, #29 rest seat 재형성 요청. 의치상 변색 부위 교체 요망. Lab 재작업 예상 기간 5 영업일. 환자에게 현황 안내 완료.',
    authorId:   'u-2',
    authorName: 'Dr. James Kim',
    authorRole: 'dentist',
    createdAt:  daysAgo(1),
    updatedAt:  daysAgo(1),
    isPinned:   false,
    patientRef: null,
    labStatus:  'at_lab',     // lab received + working on it
  },
  {
    id:         'n-l-3',
    type:       'lab',
    title:      'Aligner tray 제작 의뢰',
    body:       'Clear aligner series 의뢰 — Invisalign 대신 자체 lab 제작으로 진행.\nScans: iTero 스캔 파일 전송 완료 (3/30)\n총 예상 트레이 수: 24 upper / 20 lower\nInitial tray 수령 후 환자 장착 약속 잡을 예정. ETA: 3 weeks.',
    authorId:   'u-2',
    authorName: 'Dr. James Kim',
    authorRole: 'dentist',
    createdAt:  daysAgo(2),
    updatedAt:  daysAgo(2),
    isPinned:   false,
    patientRef: null,
    labStatus:  'preparing',  // impressions taken, not yet sent
  },
  {
    id:         'n-l-4',
    type:       'lab',
    title:      'Implant abutment spec — titanium',
    body:       'Custom titanium abutment order for implant #30 (lower right first molar).\nImplant system: Straumann Bone Level RC\nPlatform: 4.1mm RC\nAbutment height: 4mm emergence profile\nMargin: subgingival 1mm buccal, equigingival lingual\nLab: Glidewell. Estimated 10 business days.',
    authorId:   'u-2',
    authorName: 'Dr. James Kim',
    authorRole: 'dentist',
    createdAt:  daysAgo(6),
    updatedAt:  daysAgo(6),
    isPinned:   false,
    patientRef: null,
    labStatus:  'shipped',    // lab shipped back, awaiting arrival
  },
];

// ── In-memory store ───────────────────────────────────────────────────────────
let _notes: Note[] = SEED_NOTES.map(n => ({ ...n }));

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

function audit(entry: NoteAuditEntry) {
  _auditLog.push(entry);
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getNotes(userId: string, userRole: UserRole): Promise<Note[]> {
  await delay(200);
  const allowed = _notes.filter(n => ROLE_CAN_VIEW[n.type].includes(userRole));
  audit({ noteId: '*', noteType: 'office', userId, userRole, action: 'view', timestamp: now() });
  return allowed.map(n => ({ ...n }));
}

export async function getNote(noteId: string, userId: string, userRole: UserRole): Promise<Note | null> {
  await delay(150);
  const note = _notes.find(n => n.id === noteId) ?? null;
  if (note) {
    audit({ noteId, noteType: note.type, userId, userRole, action: 'view', timestamp: now() });
  }
  return note ? { ...note } : null;
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
  const note: Note = {
    id:         uid(),
    type:       params.type,
    title:      params.title,
    body:       params.body,
    authorId:   params.authorId,
    authorName: params.authorName,
    authorRole: params.authorRole,
    createdAt:  now(),
    updatedAt:  now(),
    isPinned:   false,
    labStatus:  params.type === 'lab' ? 'preparing' : null,
    patientRef: params.patientRef ?? null,
  };
  _notes = [note, ..._notes];
  audit({ noteId: note.id, noteType: note.type, userId: params.authorId, userRole: params.authorRole, action: 'create', timestamp: now() });
  return { ...note };
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
  return { ...updated };
}

export async function deleteNote(noteId: string, userId: string, userRole: UserRole): Promise<void> {
  await delay(200);
  const note = _notes.find(n => n.id === noteId);
  if (note) {
    audit({ noteId, noteType: note.type, userId, userRole, action: 'delete', timestamp: now() });
  }
  _notes = _notes.filter(n => n.id !== noteId);
}

export async function pinNote(
  noteId:  string,
  pinned:  boolean,
  userId:  string,
  userRole: UserRole,
): Promise<Note> {
  await delay(150);
  _notes = _notes.map(n =>
    n.id === noteId ? { ...n, isPinned: pinned, updatedAt: now() } : n,
  );
  const updated = _notes.find(n => n.id === noteId)!;
  audit({ noteId, noteType: updated.type, userId, userRole, action: 'pin', timestamp: now() });
  return { ...updated };
}

export async function updateLabStatus(
  noteId:   string,
  status:   LabStatus,
  userId:   string,
  userRole: UserRole,
): Promise<Note> {
  await delay(150);
  _notes = _notes.map(n =>
    n.id === noteId ? { ...n, labStatus: status, updatedAt: now() } : n,
  );
  const updated = _notes.find(n => n.id === noteId)!;
  audit({ noteId, noteType: updated.type, userId, userRole, action: 'update', timestamp: now() });
  return { ...updated };
}

export function getAuditLog(): Readonly<NoteAuditEntry[]> {
  return [..._auditLog];
}
