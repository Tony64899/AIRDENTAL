// ⚠️ HIPAA: All Notes types and role-visibility rules.
// Note bodies are never stored in the audit log — metadata only.

import type { UserRole } from './auth';

export type NoteType   = 'clinical' | 'finance' | 'office' | 'lab';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Lab case workflow status — only applies to notes where type === 'lab'
export type LabStatus = 'preparing' | 'sent' | 'at_lab' | 'shipped' | 'received';

export const LAB_STEPS: { key: LabStatus; label: string; sublabel: string }[] = [
  { key: 'preparing', label: 'Preparing', sublabel: '보내기 전'  },
  { key: 'sent',      label: 'Sent',      sublabel: '발송 완료'  },
  { key: 'at_lab',    label: 'At Lab',    sublabel: 'Lab 작업 중' },
  { key: 'shipped',   label: 'Shipped',   sublabel: '배송 중'    },
  { key: 'received',  label: 'Received',  sublabel: '수령 완료'  },
];

export interface Note {
  id:          string;
  type:        NoteType;
  title:       string;
  body:        string;
  authorId:    string;
  authorName:  string;   // denormalized — no join needed on read
  authorRole:  UserRole;
  createdAt:   string;   // ISO
  updatedAt:   string;   // ISO
  isPinned:    boolean;
  patientRef:  { patientId: string; displayName: string } | null;
  labStatus:   LabStatus | null;  // non-null only when type === 'lab'
}

export interface NotesState {
  notes:        Note[];
  activeNoteId: string | null;
  filterType:   NoteType | 'all';
  searchQuery:  string;
  isLoading:    boolean;
  error:        string | null;
}

export type NotesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS';      payload: Note[] }
  | { type: 'SET_ACTIVE_NOTE';   payload: string | null }
  | { type: 'CREATE_NOTE';       payload: Note }
  | { type: 'UPDATE_NOTE';       payload: Note }
  | { type: 'DELETE_NOTE';       payload: string }          // noteId
  | { type: 'PIN_NOTE';          payload: Note }
  | { type: 'UPDATE_LAB_STATUS'; payload: Note }
  | { type: 'SET_FILTER_TYPE';   payload: NoteType | 'all' }
  | { type: 'SET_SEARCH_QUERY';  payload: string }
  | { type: 'SET_ERROR';         payload: string }
  | { type: 'RESET' };

// Which roles can see each note type.
// UserRole: 'admin' | 'dentist' | 'hygienist' | 'front_desk'
export const ROLE_CAN_VIEW: Record<NoteType, UserRole[]> = {
  clinical: ['dentist', 'hygienist', 'admin'],
  finance:  ['admin', 'front_desk'],
  office:   ['admin', 'front_desk', 'dentist', 'hygienist'],
  lab:      ['dentist', 'admin'],
};

// Display metadata (label, color classes) per note type.
export const NOTE_TYPE_META: Record<
  NoteType,
  { label: string; color: string; bg: string; dot: string; border: string }
> = {
  clinical: {
    label:  'Clinical',
    color:  'text-blue-700',
    bg:     'bg-blue-50',
    dot:    'bg-blue-500',
    border: 'border-blue-200',
  },
  finance: {
    label:  'Finance',
    color:  'text-green-700',
    bg:     'bg-green-50',
    dot:    'bg-green-500',
    border: 'border-green-200',
  },
  office: {
    label:  'Office',
    color:  'text-violet-700',
    bg:     'bg-violet-50',
    dot:    'bg-violet-500',
    border: 'border-violet-200',
  },
  lab: {
    label:  'Lab',
    color:  'text-orange-700',
    bg:     'bg-orange-50',
    dot:    'bg-orange-500',
    border: 'border-orange-200',
  },
};
