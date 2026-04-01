// NoteCard — single row in the NotesSidebar list.

import type { Note } from '../../types/notes';
import { NOTE_TYPE_META } from '../../types/notes';

interface Props {
  note:     Note;
  isActive: boolean;
  onClick:  () => void;
}

/** Returns a human-readable relative date string. */
function relativeDate(iso: string): string {
  const now   = new Date();
  const date  = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffH  = diffMs / (1000 * 60 * 60);
  const diffD  = diffMs / (1000 * 60 * 60 * 24);

  if (diffH < 1)  return 'Just now';
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  if (diffD < 2)  return 'Yesterday';
  if (diffD < 7)  return `${Math.floor(diffD)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NoteCard({ note, isActive, onClick }: Props) {
  const meta    = NOTE_TYPE_META[note.type];
  const preview = note.body.trim().slice(0, 65) || 'No content yet';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-3 py-3 flex gap-2.5 rounded-lg transition-colors duration-100',
        isActive
          ? 'bg-[#0B3A70]/[0.07] border-l-2 border-[#0B3A70]'
          : 'hover:bg-slate-50 border-l-2 border-transparent',
      ].join(' ')}
    >
      {/* Type colour bar */}
      <div className={`w-1 rounded-full flex-shrink-0 mt-0.5 self-stretch ${meta.dot}`} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-1">
          <span className="text-sm font-medium text-slate-900 truncate leading-snug">
            {note.isPinned && <span className="mr-1 text-[11px]">📌</span>}
            {note.title || 'Untitled'}
          </span>
          <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">
            {relativeDate(note.updatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-xs text-slate-400 truncate">{preview}</span>
        </div>
      </div>
    </button>
  );
}
