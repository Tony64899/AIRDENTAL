// BusinessHoursEditor — per-day operating hours table with open/closed toggle.
// Used in LocationSettingsPanel > Hours tab.

import type { BusinessHours } from '../../types/clinic';

const DAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

interface BusinessHoursEditorProps {
  hours:    BusinessHours[];
  onChange: (updated: BusinessHours[]) => void;
  readOnly?: boolean;
}

export function BusinessHoursEditor({ hours, onChange, readOnly = false }: BusinessHoursEditorProps) {
  // Ensure we always have 7 entries, one per day (0-6)
  const normalized: BusinessHours[] = [0, 1, 2, 3, 4, 5, 6].map(day => {
    const existing = hours.find(h => h.dayOfWeek === day);
    return existing ?? { dayOfWeek: day as BusinessHours['dayOfWeek'], openTime: '08:00', closeTime: '17:00', isClosed: true };
  });

  function updateDay(dayOfWeek: number, patch: Partial<BusinessHours>) {
    onChange(normalized.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h
    ));
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[140px_80px_1fr_1fr] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Day</span>
        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Open</span>
        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Opens at</span>
        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Closes at</span>
      </div>

      {/* Rows */}
      {normalized.map(h => (
        <div
          key={h.dayOfWeek}
          className="grid grid-cols-[140px_80px_1fr_1fr] gap-3 items-center px-4 py-3 border-b border-gray-100 last:border-b-0"
        >
          {/* Day name */}
          <span className={[
            'text-sm font-medium',
            h.isClosed ? 'text-[#94a3b8]' : 'text-[#0f172a]',
          ].join(' ')}>
            {DAY_NAMES[h.dayOfWeek]}
          </span>

          {/* Open/Closed toggle */}
          <button
            type="button"
            disabled={readOnly}
            onClick={() => updateDay(h.dayOfWeek, { isClosed: !h.isClosed })}
            className={[
              'relative inline-flex w-10 h-5 rounded-full transition-colors focus:outline-none',
              h.isClosed
                ? 'bg-gray-200'
                : 'bg-[#0891b2]',
              readOnly ? 'cursor-default opacity-60' : 'cursor-pointer',
            ].join(' ')}
            aria-label={`${DAY_NAMES[h.dayOfWeek]} ${h.isClosed ? 'closed' : 'open'}`}
            role="switch"
            aria-checked={!h.isClosed}
          >
            <span className={[
              'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
              h.isClosed ? 'translate-x-0' : 'translate-x-5',
            ].join(' ')} />
          </button>

          {/* Time inputs */}
          <input
            type="time"
            value={h.openTime}
            disabled={h.isClosed || readOnly}
            onChange={e => updateDay(h.dayOfWeek, { openTime: e.target.value })}
            className={[
              'text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0891b2] transition-colors',
              h.isClosed || readOnly
                ? 'border-gray-100 bg-gray-50 text-[#94a3b8] cursor-not-allowed'
                : 'border-gray-200 bg-white text-[#0f172a]',
            ].join(' ')}
          />
          <input
            type="time"
            value={h.closeTime}
            disabled={h.isClosed || readOnly}
            onChange={e => updateDay(h.dayOfWeek, { closeTime: e.target.value })}
            className={[
              'text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0891b2] transition-colors',
              h.isClosed || readOnly
                ? 'border-gray-100 bg-gray-50 text-[#94a3b8] cursor-not-allowed'
                : 'border-gray-200 bg-white text-[#0f172a]',
            ].join(' ')}
          />
        </div>
      ))}
    </div>
  );
}
