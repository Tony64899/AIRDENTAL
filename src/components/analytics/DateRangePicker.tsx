// DateRangePicker — preset buttons for selecting the analytics time window.
// Lives at the top of DashboardPage; controls all charts simultaneously.

import type { DateRangePreset } from '../../types/analytics';

interface DateRangePickerProps {
  selected: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
}

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today',       label: 'Today' },
  { value: 'this_week',   label: 'This Week' },
  { value: 'this_month',  label: 'This Month' },
  { value: 'last_month',  label: 'Last Month' },
  { value: 'last_30_days', label: 'Last 30 Days' },
];

export function DateRangePicker({ selected, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-1 bg-[#f1f5f9] rounded-xl p-1">
      {PRESETS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={[
            'px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all',
            selected === value
              ? 'bg-white text-[#0f172a] shadow-sm'
              : 'text-[#64748b] hover:text-[#0f172a]',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
