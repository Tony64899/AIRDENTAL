// NoteEditor — right panel (flex-1).
// Title input + type selector + meta row + textarea with 1s debounce auto-save.
// Lab notes show a LabStatusTracker below the top bar.
// Debounce timer lives here (not in context) — flushes immediately on blur.

import { useEffect, useRef, useState, useCallback } from 'react';
import { Pin, PinOff, Trash2, Check, Loader2, AlertCircle } from 'lucide-react';
import type { NoteType, SaveStatus, LabStatus } from '../../types/notes';
import { NOTE_TYPE_META } from '../../types/notes';
import { useNotes } from '../../contexts/NotesContext';
import EmptyNoteState from './EmptyNoteState';
import LabStatusTracker from './LabStatusTracker';

const NOTE_TYPES: NoteType[] = ['clinical', 'finance', 'office', 'lab'];
const DEBOUNCE_MS = 1000;

export default function NoteEditor() {
  const { activeNote, createNote, updateNote, deleteNote, pinNote, updateLabStatus } = useNotes();

  // Local draft state — keeps UI snappy, syncs to context on save
  const [title,      setTitle]     = useState('');
  const [body,       setBody]      = useState('');
  const [noteType,   setNoteType]  = useState<NoteType>('office');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeIdRef = useRef<string | null>(null);

  // Sync local state when active note changes
  useEffect(() => {
    if (!activeNote) return;
    if (activeNote.id === activeIdRef.current) return;

    activeIdRef.current = activeNote.id;
    setTitle(activeNote.title);
    setBody(activeNote.body);
    setNoteType(activeNote.type);
    setSaveStatus('idle');
  }, [activeNote?.id]);

  // ── Save helpers ──────────────────────────────────────────────────────────
  const saveNow = useCallback(async (
    id:    string,
    patch: { title: string; body: string; type: NoteType },
  ) => {
    setSaveStatus('saving');
    try {
      await updateNote(id, patch);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [updateNote]);

  const scheduleSave = useCallback((
    id:    string,
    patch: { title: string; body: string; type: NoteType },
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus('idle');
    debounceRef.current = setTimeout(() => {
      void saveNow(id, patch);
    }, DEBOUNCE_MS);
  }, [saveNow]);

  // Flush debounce on unmount / note change
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeNote?.id]);

  // ── Change handlers ───────────────────────────────────────────────────────
  function handleTitleChange(val: string) {
    setTitle(val);
    if (activeNote) scheduleSave(activeNote.id, { title: val, body, type: noteType });
  }

  function handleBodyChange(val: string) {
    setBody(val);
    if (activeNote) scheduleSave(activeNote.id, { title, body: val, type: noteType });
  }

  function handleTypeChange(val: NoteType) {
    setNoteType(val);
    if (activeNote) scheduleSave(activeNote.id, { title, body, type: val });
  }

  async function handleBlur() {
    if (!activeNote) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await saveNow(activeNote.id, { title, body, type: noteType });
  }

  // ── Lab status ────────────────────────────────────────────────────────────
  async function handleLabStatusChange(status: LabStatus) {
    if (!activeNote) return;
    await updateLabStatus(activeNote.id, status);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!activeNote) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await deleteNote(activeNote.id);
    setSaveStatus('idle');
  }

  async function handlePin() {
    if (!activeNote) return;
    await pinNote(activeNote.id, !activeNote.isPinned);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <EmptyNoteState variant="editor" onNewNote={createNote} />
      </div>
    );
  }

  const meta = NOTE_TYPE_META[noteType];

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0 h-full">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">

        {/* Type selector */}
        <div className="relative">
          <select
            value={noteType}
            onChange={e => handleTypeChange(e.target.value as NoteType)}
            className={[
              'text-xs font-semibold pl-2 pr-6 py-1 rounded-lg border appearance-none cursor-pointer outline-none',
              meta.bg, meta.color, meta.border,
            ].join(' ')}
          >
            {NOTE_TYPES.map(t => (
              <option key={t} value={t}>{NOTE_TYPE_META[t].label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] opacity-60">▾</span>
        </div>

        {/* Save status + action buttons */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 min-w-[60px] justify-end">
            {saveStatus === 'saving' && (
              <><Loader2 className="w-3 h-3 animate-spin text-[#0B3A70]" /> Saving…</>
            )}
            {saveStatus === 'saved' && (
              <><Check className="w-3 h-3 text-green-500" /> Saved</>
            )}
            {saveStatus === 'error' && (
              <><AlertCircle className="w-3 h-3 text-red-500" /> Error</>
            )}
          </span>

          {/* Pin */}
          <button
            type="button"
            onClick={handlePin}
            title={activeNote.isPinned ? 'Unpin' : 'Pin'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B3A70] hover:bg-slate-50 transition-colors"
          >
            {activeNote.isPinned
              ? <PinOff className="w-4 h-4" />
              : <Pin    className="w-4 h-4" />}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            title="Delete note"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#A60F2D] hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Lab status tracker (only for lab notes) ──────────────────────── */}
      {activeNote.type === 'lab' && activeNote.labStatus && (
        <LabStatusTracker
          current={activeNote.labStatus}
          onChange={handleLabStatusChange}
        />
      )}

      {/* ── Editor body ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-4 gap-3">

        {/* Title */}
        <input
          type="text"
          placeholder="Note title…"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          onBlur={handleBlur}
          className="w-full text-2xl font-semibold text-slate-900 placeholder:text-slate-300 border-none outline-none bg-transparent"
        />

        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-500">{activeNote.authorName}</span>
          <span>·</span>
          <span>
            {new Date(activeNote.updatedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Body textarea */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => handleBodyChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Start writing…"
          className="flex-1 w-full resize-none text-sm text-slate-700 leading-relaxed placeholder:text-slate-300 border-none outline-none bg-transparent"
        />
      </div>
    </div>
  );
}
