// NotesSubNav — billing-style secondary sidebar inside the Notes section.
// Shows All / Clinical / Finance / Office / Lab with note counts per type.

import { useMemo } from 'react';
import {
  LayoutList, Stethoscope, DollarSign, MessageSquare, FlaskConical,
} from 'lucide-react';
import type { NoteType } from '../../types/notes';
import { NOTE_TYPE_META, ROLE_CAN_VIEW } from '../../types/notes';
import { useNotes } from '../../contexts/NotesContext';
import { useAuth } from '../../hooks/useAuth';

type FilterType = NoteType | 'all';

interface NavItem {
  type:  FilterType;
  label: string;
  icon:  typeof LayoutList;
}

const NAV_ITEMS: NavItem[] = [
  { type: 'all',      label: 'All Notes', icon: LayoutList    },
  { type: 'clinical', label: 'Clinical',  icon: Stethoscope   },
  { type: 'finance',  label: 'Finance',   icon: DollarSign    },
  { type: 'office',   label: 'Office',    icon: MessageSquare },
  { type: 'lab',      label: 'Lab',       icon: FlaskConical  },
];

export default function NotesSubNav() {
  const { state, setFilterType } = useNotes();
  const { state: authState }     = useAuth();
  const userRole = authState.user?.role;

  // Count visible notes per type (role-filtered, ignoring search/type filter)
  const counts = useMemo(() => {
    const result = { all: 0, clinical: 0, finance: 0, office: 0, lab: 0 } as Record<FilterType, number>;
    if (!userRole) return result;
    for (const n of state.notes) {
      if (ROLE_CAN_VIEW[n.type].includes(userRole)) {
        result[n.type]++;
        result.all++;
      }
    }
    return result;
  }, [state.notes, userRole]);

  return (
    <aside className="w-44 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 h-full">
      {/* Section header */}
      <div className="px-4 pt-5 pb-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Notes
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ type, label, icon: Icon }) => {
          const isActive = state.filterType === type;
          const count    = counts[type];
          const dotColor = type !== 'all' ? NOTE_TYPE_META[type].dot : '';

          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={[
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors duration-100',
                isActive
                  ? 'bg-[#0B3A70]/[0.08] text-[#0B3A70]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              {/* Icon with type colour dot for non-all items */}
              <span className="relative flex-shrink-0">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B3A70]' : 'text-slate-400'}`} />
                {type !== 'all' && (
                  <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white ${dotColor}`} />
                )}
              </span>

              <span className="text-sm font-medium flex-1 truncate">{label}</span>

              {/* Count badge */}
              {count > 0 && (
                <span className={[
                  'text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1',
                  isActive
                    ? 'bg-[#0B3A70]/10 text-[#0B3A70]'
                    : 'bg-slate-100 text-slate-500',
                ].join(' ')}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
