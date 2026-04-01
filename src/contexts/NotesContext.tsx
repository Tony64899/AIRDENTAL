// NotesContext — global Notes state via useReducer + Context.
// Mirrors MessagingContext pattern: single file exports Context, Provider, and hook.
// Provider initialises when authenticated and tears down on logout.
// ⚠️ HIPAA: in-memory only — no localStorage. Audit log in notesService.

import {
  createContext, useContext, useReducer, useEffect, useCallback, useMemo,
} from 'react';
import type { ReactNode } from 'react';

import type { Note, NotesState, NotesAction, NoteType, LabStatus } from '../types/notes';
import { ROLE_CAN_VIEW } from '../types/notes';
import * as svc from '../services/notesService';
import { useAuth } from '../hooks/useAuth';

// ── Initial state ─────────────────────────────────────────────────────────────
const INITIAL_STATE: NotesState = {
  notes:        [],
  activeNoteId: null,
  filterType:   'all',
  searchQuery:  '',
  isLoading:    false,
  error:        null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {

    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };

    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false, notes: action.payload };

    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };

    case 'SET_ACTIVE_NOTE':
      return { ...state, activeNoteId: action.payload };

    case 'CREATE_NOTE':
      return {
        ...state,
        notes:        [action.payload, ...state.notes],
        activeNoteId: action.payload.id,
      };

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.payload.id ? action.payload : n,
        ),
      };

    case 'DELETE_NOTE': {
      const remaining = state.notes.filter(n => n.id !== action.payload);
      return {
        ...state,
        notes:        remaining,
        activeNoteId: state.activeNoteId === action.payload
          ? (remaining[0]?.id ?? null)
          : state.activeNoteId,
      };
    }

    case 'PIN_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.payload.id ? action.payload : n,
        ),
      };

    case 'UPDATE_LAB_STATUS':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.payload.id ? action.payload : n,
        ),
      };

    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'RESET':
      return INITIAL_STATE;

    default:
      return state;
  }
}

// ── Context value type ────────────────────────────────────────────────────────
interface NotesContextValue {
  state:          NotesState;
  activeNote:     Note | null;
  filteredNotes:  Note[];
  selectNote:     (id: string | null) => void;
  createNote:     (type: NoteType) => Promise<void>;
  updateNote:        (id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'type' | 'patientRef'>>) => Promise<void>;
  deleteNote:        (id: string) => Promise<void>;
  pinNote:           (id: string, pinned: boolean) => Promise<void>;
  updateLabStatus:   (id: string, status: LabStatus) => Promise<void>;
  setFilterType:     (type: NoteType | 'all') => void;
  setSearchQuery:    (q: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function NotesProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth();
  const [state, dispatch]    = useReducer(notesReducer, INITIAL_STATE);

  // Initialise / reset on auth changes
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user) {
      dispatch({ type: 'RESET' });
      return;
    }
    const { id, role } = authState.user;
    dispatch({ type: 'LOAD_START' });
    svc.getNotes(id, role)
      .then(notes => dispatch({ type: 'LOAD_SUCCESS', payload: notes }))
      .catch(err   => dispatch({ type: 'SET_ERROR',   payload: String(err) }));
  }, [authState.isAuthenticated, authState.user?.id]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const userRole = authState.user?.role;

  const filteredNotes = useMemo((): Note[] => {
    if (!userRole) return [];
    return state.notes
      .filter(n => ROLE_CAN_VIEW[n.type].includes(userRole))
      .filter(n => state.filterType === 'all' || n.type === state.filterType)
      .filter(n => {
        const q = state.searchQuery.trim().toLowerCase();
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Pinned first, then newest-updated first
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [state.notes, state.filterType, state.searchQuery, userRole]);

  const activeNote = useMemo(
    () => state.notes.find(n => n.id === state.activeNoteId) ?? null,
    [state.notes, state.activeNoteId],
  );

  // ── Actions ─────────────────────────────────────────────────────────────────
  const selectNote = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_NOTE', payload: id });
  }, []);

  const createNote = useCallback(async (type: NoteType) => {
    const user = authState.user;
    if (!user) return;
    const note = await svc.createNote({
      type,
      title:      '',
      body:       '',
      authorId:   user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      authorRole: user.role,
      patientRef: null,
    });
    dispatch({ type: 'CREATE_NOTE', payload: note });
  }, [authState.user]);

  const updateNote = useCallback(async (
    id:    string,
    patch: Partial<Pick<Note, 'title' | 'body' | 'type' | 'patientRef'>>,
  ) => {
    const user = authState.user;
    if (!user) return;
    const updated = await svc.updateNote(id, patch, user.id, user.role);
    dispatch({ type: 'UPDATE_NOTE', payload: updated });
  }, [authState.user]);

  const deleteNote = useCallback(async (id: string) => {
    const user = authState.user;
    if (!user) return;
    await svc.deleteNote(id, user.id, user.role);
    dispatch({ type: 'DELETE_NOTE', payload: id });
  }, [authState.user]);

  const pinNote = useCallback(async (id: string, pinned: boolean) => {
    const user = authState.user;
    if (!user) return;
    const updated = await svc.pinNote(id, pinned, user.id, user.role);
    dispatch({ type: 'PIN_NOTE', payload: updated });
  }, [authState.user]);

  const updateLabStatus = useCallback(async (id: string, status: LabStatus) => {
    const user = authState.user;
    if (!user) return;
    const updated = await svc.updateLabStatus(id, status, user.id, user.role);
    dispatch({ type: 'UPDATE_LAB_STATUS', payload: updated });
  }, [authState.user]);

  const setFilterType = useCallback((type: NoteType | 'all') => {
    dispatch({ type: 'SET_FILTER_TYPE', payload: type });
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: q });
  }, []);

  const value: NotesContextValue = {
    state, activeNote, filteredNotes,
    selectNote, createNote, updateNote, deleteNote, pinNote,
    updateLabStatus, setFilterType, setSearchQuery,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used inside NotesProvider');
  return ctx;
}
