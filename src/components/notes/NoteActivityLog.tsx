// NoteActivityLog — scrollable audit trail in the right panel of a Lab note.
// Who created it, who sent it, who updated each status — with date + time.
// ⚠️ HIPAA: renders activity metadata only — no note body content.
// NOTE: The panel header (ClipboardList + "Activity Log") is rendered by NoteEditor,
//       so this component renders entries only.

import { Plus, ArrowRight, ClipboardList } from 'lucide-react';
import type { NoteActivityEntry } from '../../types/notes';

interface Props {
  entries: NoteActivityEntry[];
}

/** Format ISO → M/D/YYYY - H:MM AM/PM  (e.g. 4/1/2026 - 9:05 AM) */
function fmtDateTime(iso: string): string {
  const d    = new Date(iso);
  const mo   = d.getMonth() + 1;
  const day  = d.getDate();
  const yr   = d.getFullYear();
  const hr24 = d.getHours();
  const min  = String(d.getMinutes()).padStart(2, '0');
  const ampm = hr24 >= 12 ? 'PM' : 'AM';
  const hr12 = hr24 % 12 || 12;
  return `${mo}/${day}/${yr} - ${hr12}:${min} ${ampm}`;
}

/** Icon + colour per action type */
function actionIcon(action: NoteActivityEntry['action']) {
  if (action === 'created')        return { Icon: Plus,          cls: 'text-slate-400' };
  if (action === 'status_changed') return { Icon: ArrowRight,    cls: 'text-orange-500' };
  return                                  { Icon: ClipboardList, cls: 'text-slate-400' };
}

export default function NoteActivityLog({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="px-4 pb-4 pt-3">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-100" />

        <ul className="space-y-3">
          {entries.map((entry, idx) => {
            const { Icon, cls } = actionIcon(entry.action);
            const isLast = idx === entries.length - 1;

            return (
              <li key={entry.id} className="flex items-start gap-3">
                {/* Dot + icon */}
                <div className={[
                  'relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  isLast ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50 border border-slate-200',
                ].join(' ')}>
                  <Icon className={`w-3 h-3 ${isLast ? 'text-orange-500' : cls}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700">{entry.userName}</span>
                    <span className="text-xs text-slate-500">{entry.detail}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                    {fmtDateTime(entry.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
