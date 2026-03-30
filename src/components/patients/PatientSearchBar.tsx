// PatientSearchBar — controlled search input for patient list.
// ⚠️ HIPAA: Do not persist search queries in localStorage or analytics.

import { Search, X } from 'lucide-react';

interface PatientSearchBarProps {
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
}

export function PatientSearchBar({
  value,
  onChange,
  placeholder = 'Search patients by name or chart #…',
}: PatientSearchBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl flex items-center gap-2 px-3 py-2 focus-within:ring-2 focus-within:ring-[#0891b2]/30 focus-within:border-[#0891b2]">
      <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none bg-transparent"
        autoComplete="off"
        spellCheck={false}
      />
      {value.length > 0 && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="w-4 h-4 text-[#94a3b8] hover:text-[#0f172a] flex-shrink-0 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
