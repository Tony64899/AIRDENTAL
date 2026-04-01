// NoteTypeChip — pill toggle for note-type filter bar and type selector.

import type { NoteType } from '../../types/notes';
import { NOTE_TYPE_META } from '../../types/notes';

type ChipType = NoteType | 'all';

interface Props {
  type:    ChipType;
  active:  boolean;
  onClick: () => void;
}

const ALL_META = { label: 'All', color: '', bg: '', dot: '', border: '' };

export default function NoteTypeChip({ type, active, onClick }: Props) {
  const meta = type === 'all' ? ALL_META : NOTE_TYPE_META[type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap',
        active
          ? 'bg-[#0B3A70] text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      ].join(' ')}
    >
      {type !== 'all' && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${NOTE_TYPE_META[type].dot}`}
        />
      )}
      {meta.label}
    </button>
  );
}
