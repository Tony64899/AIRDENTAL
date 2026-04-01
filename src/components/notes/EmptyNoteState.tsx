// EmptyNoteState — shown in NoteEditor when no note is selected,
// and in NotesSidebar when the filtered list is empty.

import { FileText, PlusCircle } from 'lucide-react';
import type { NoteType } from '../../types/notes';

interface Props {
  variant:     'editor' | 'list';
  onNewNote?:  (type: NoteType) => void;
}

export default function EmptyNoteState({ variant, onNewNote }: Props) {
  if (variant === 'list') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <FileText className="w-8 h-8 text-slate-200 mb-2" />
        <p className="text-sm text-slate-400">No notes match your filter</p>
      </div>
    );
  }

  // 'editor' variant — fills the right panel
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
        <FileText className="w-8 h-8 text-slate-300" />
      </div>
      <div>
        <p className="text-base font-medium text-slate-700">Select a note or create a new one</p>
        <p className="text-sm text-slate-400 mt-1">Clinical, Finance, Office, and Lab notes — all in one place</p>
      </div>
      {onNewNote && (
        <button
          type="button"
          onClick={() => onNewNote('office')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B3A70] hover:bg-[#A60F2D] text-white text-sm font-medium rounded-xl transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          New Note
        </button>
      )}
    </div>
  );
}
