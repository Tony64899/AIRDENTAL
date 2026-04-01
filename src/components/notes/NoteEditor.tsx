// NoteEditor — right content area (flex-1).
// Layout for lab notes: main editor left | scrollable Activity Log panel right.
// LabStatusTracker spans full width above the editor/log split.

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Pin, PinOff, Trash2, Check, Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import type { NoteType, SaveStatus, LabStatus } from '../../types/notes';
import { NOTE_TYPE_META, LAB_STEPS } from '../../types/notes';
import { useNotes } from '../../contexts/NotesContext';
import EmptyNoteState    from './EmptyNoteState';
import LabStatusTracker  from './LabStatusTracker';
import NoteActivityLog   from './NoteActivityLog';

const NOTE_TYPES: NoteType[] = ['clinical', 'finance', 'office', 'lab'];
const DEBOUNCE_MS = 1000;

export default function NoteEditor() {
  const { activeNote, createNote, updateNote, deleteNote, pinNote, updateLabStatus } = useNotes();

  const [title,       setTitle]      = useState('');
  const [body,        setBody]       = useState('');
  const [noteType,    setNoteType]   = useState<NoteType>('office');
  const [saveStatus,  setSaveStatus] = useState<SaveStatus>('idle');

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

  // ── Derive per-step timestamps from activity log ──────────────────────────
  const stepTimestamps = useMemo((): Partial<Record<LabStatus, string>> => {
    if (!activeNote || activeNote.type !== 'lab') return {};
    // 'preparing' maps to note creation time
    const result: Partial<Record<LabStatus, string>> = { preparing: activeNote.createdAt };
    for (const entry of activeNote.activityLog) {
      if (entry.action === 'status_changed') {
        const step = LAB_STEPS.find(s => entry.detail === `Status updated to ${s.label}`);
        if (step) result[step.key] = entry.timestamp;
      }
    }
    return result;
  }, [activeNote]);

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
    debounceRef.current = setTimeout(() => void saveNow(id, patch), DEBOUNCE_MS);
  }, [saveNow]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [activeNote?.id]);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
    await saveNow(activeNote.id, { title, body, type: noteType });
  }
  async function handleLabStatusChange(status: LabStatus) {
    if (!activeNote) return;
    await updateLabStatus(activeNote.id, status);
  }
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

  const meta   = NOTE_TYPE_META[noteType];
  const isLab  = activeNote.type === 'lab';

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0 h-full">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
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

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 min-w-[60px] justify-end">
            {saveStatus === 'saving' && <><Loader2 className="w-3 h-3 animate-spin text-[#0B3A70]" /> Saving…</>}
            {saveStatus === 'saved'  && <><Check   className="w-3 h-3 text-green-500" /> Saved</>}
            {saveStatus === 'error'  && <><AlertCircle className="w-3 h-3 text-red-500" /> Error</>}
          </span>
          <button type="button" onClick={handlePin}
            title={activeNote.isPinned ? 'Unpin' : 'Pin'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B3A70] hover:bg-slate-50 transition-colors">
            {activeNote.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
          <button type="button" onClick={handleDelete} title="Delete note"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#A60F2D] hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Lab status tracker — full width, above the editor/log split ──── */}
      {isLab && activeNote.labStatus && (
        <div className="flex-shrink-0">
          <LabStatusTracker
            current={activeNote.labStatus}
            onChange={handleLabStatusChange}
            updatedBy={activeNote.labStatusUpdatedBy}
            updatedAt={activeNote.labStatusUpdatedAt}
            stepTimestamps={stepTimestamps}
          />
        </div>
      )}

      {/* ── Editor + Activity Log split ──────────────────────────────────── */}
      <div className="flex-1 flex min-w-0 overflow-hidden">

        {/* Main writing area */}
        <div className="flex-1 flex flex-col overflow-hidden px-6 py-4 gap-3 min-w-0">
          <input
            type="text"
            placeholder="Note title…"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            onBlur={handleBlur}
            className="w-full text-2xl font-semibold text-slate-900 placeholder:text-slate-300 border-none outline-none bg-transparent"
          />

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

          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => handleBodyChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Start writing…"
            className="flex-1 w-full resize-none text-sm text-slate-700 leading-relaxed placeholder:text-slate-300 border-none outline-none bg-transparent"
          />
        </div>

        {/* ── Activity Log — right panel, lab notes only ─────────────────── */}
        {isLab && (
          <aside className="w-72 flex-shrink-0 border-l border-slate-100 bg-slate-50/40 flex flex-col h-full">
            {/* Panel header */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Activity Log
              </span>
            </div>

            {/* Scrollable entries */}
            <div className="flex-1 overflow-y-auto">
              {activeNote.activityLog.length === 0 ? (
                <p className="text-xs text-slate-400 text-center mt-8 px-4">No activity yet</p>
              ) : (
                <NoteActivityLog entries={activeNote.activityLog} />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
