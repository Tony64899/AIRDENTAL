// NotesSidebar — left panel (w-72).
// Search bar → type filter chips → date-grouped note list → sticky New Note button.

import { Search, PlusCircle } from 'lucide-react';
import type { Note, NoteType } from '../../types/notes';
import { useNotes } from '../../contexts/NotesContext';
import NoteTypeChip from './NoteTypeChip';
import NoteCard from './NoteCard';
import EmptyNoteState from './EmptyNoteState';

const FILTER_TYPES: (NoteType | 'all')[] = ['all', 'clinical', 'finance', 'office', 'lab'];

/** Group notes by date bucket: Today / Yesterday / Earlier */
function groupNotes(notes: Note[]): Array<{ label: string; notes: Note[] }> {
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr     = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  const groups: Record<string, Note[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const note of notes) {
    const d = new Date(note.updatedAt).toDateString();
    if (d === todayStr)     groups.Today.push(note);
    else if (d === yesterdayStr) groups.Yesterday.push(note);
    else                    groups.Earlier.push(note);
  }

  return Object.entries(groups)
    .filter(([, arr]) => arr.length > 0)
    .map(([label, notes]) => ({ label, notes }));
}

export default function NotesSidebar() {
  const {
    state, filteredNotes,
    selectNote, createNote, setFilterType, setSearchQuery,
  } = useNotes();

  // Separate pinned from the rest, then group unpinned by date
  const pinned   = filteredNotes.filter(n => n.isPinned);
  const unpinned = filteredNotes.filter(n => !n.isPinned);
  const groups   = groupNotes(unpinned);

  async function handleNewNote() {
    await createNote('office');
  }

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 h-full">

      {/* Search */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search notes…"
            value={state.searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
        {FILTER_TYPES.map(type => (
          <NoteTypeChip
            key={type}
            type={type}
            active={state.filterType === type}
            onClick={() => setFilterType(type)}
          />
        ))}
      </div>

      <div className="h-px bg-slate-100 mx-3" />

      {/* Note list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredNotes.length === 0 ? (
          <EmptyNoteState variant="list" />
        ) : (
          <>
            {/* Pinned section */}
            {pinned.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Pinned
                </p>
                {pinned.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isActive={state.activeNoteId === note.id}
                    onClick={() => selectNote(note.id)}
                  />
                ))}
              </div>
            )}

            {/* Date-grouped sections */}
            {groups.map(group => (
              <div key={group.label} className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {group.label}
                </p>
                {group.notes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isActive={state.activeNoteId === note.id}
                    onClick={() => selectNote(note.id)}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* New Note button — sticky bottom */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleNewNote}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0B3A70] hover:bg-[#A60F2D] text-white text-sm font-medium rounded-xl transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          New Note
        </button>
      </div>
    </aside>
  );
}
