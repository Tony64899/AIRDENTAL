// CDTCodePicker — modal for selecting condition type and CDT code for a tooth/surface.
// ⚠️ HIPAA: PHI is created when a condition is applied. Production must audit writes.

import { useState }                          from 'react';
import { X, Check, Search }                  from 'lucide-react';
import type { ToothCondition, ToothConditionType, ToothSurface } from '../../types/patient';
import { CDT_CODES }                          from '../../constants/cdtCodes';

interface CDTCodePickerProps {
  toothNumber: number;
  surface:     ToothSurface | null;   // null = whole tooth
  onApply:     (condition: Omit<ToothCondition, 'id'>) => void;
  onClose:     () => void;
}

interface ConditionEntry {
  type:  ToothConditionType;
  label: string;
  color: string;
}

const CONDITION_ENTRIES: ConditionEntry[] = [
  { type: 'caries',     label: 'Caries',     color: '#fca5a5' },
  { type: 'filling',    label: 'Filling',    color: '#93c5fd' },
  { type: 'crown',      label: 'Crown',      color: '#fcd34d' },
  { type: 'root_canal', label: 'Root Canal', color: '#c4b5fd' },
  { type: 'implant',    label: 'Implant',    color: '#67e8f9' },
  { type: 'bridge',     label: 'Bridge',     color: '#fdba74' },
  { type: 'sealant',    label: 'Sealant',    color: '#86efac' },
  { type: 'watch',      label: 'Watch',      color: '#fde68a' },
  { type: 'missing',    label: 'Missing',    color: '#d1d5db' },
  { type: 'extraction', label: 'Extracted',  color: '#9ca3af' },
  { type: 'impacted',   label: 'Impacted',   color: '#d6d3d1' },
];

const SURFACE_LABEL: Record<ToothSurface, string> = {
  M: 'M (Mesial)',
  D: 'D (Distal)',
  O: 'O (Occlusal)',
  B: 'B (Buccal)',
  L: 'L (Lingual)',
};

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function CDTCodePicker({
  toothNumber,
  surface,
  onApply,
  onClose,
}: CDTCodePickerProps) {
  const [conditionType, setConditionType] = useState<ToothConditionType | null>(null);
  const [selectedCode, setSelectedCode]   = useState<string>('');
  const [searchQuery, setSearchQuery]     = useState<string>('');
  const [notes, setNotes]                 = useState<string>('');

  const filteredCodes = searchQuery.trim()
    ? CDT_CODES.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : CDT_CODES;

  function handleApply() {
    if (!conditionType) return;
    onApply({
      toothNumber,
      type:      conditionType,
      surfaces:  surface ? [surface] : undefined,
      cdtCode:   selectedCode || undefined,
      notes:     notes.trim() || undefined,
      date:      todayISO(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[420px] max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-[#0f172a]">
              Tooth #{toothNumber}
              {surface ? ` \u2014 Surface: ${surface} (${SURFACE_LABEL[surface].split(' ')[1]?.slice(1, -1) ?? ''})` : ' \u2014 Whole Tooth'}
            </h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">Record a condition</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Condition type selector */}
          <div>
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Condition Type
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {CONDITION_ENTRIES.map(({ type, label, color }) => (
                <button
                  key={type}
                  onClick={() => setConditionType(type)}
                  className={[
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors text-left',
                    conditionType === type
                      ? 'border-[#0891b2] bg-[#e0f2fe] text-[#0891b2]'
                      : 'border-gray-200 text-[#0f172a] hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0 border border-gray-200"
                    style={{ background: color }}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CDT Code search */}
          <div>
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              CDT Code <span className="font-normal normal-case text-[#94a3b8]">(optional)</span>
            </p>
            <div className="relative mb-1.5">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search CDT codes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2] text-[#0f172a] placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredCodes.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#94a3b8]">No codes found.</p>
              ) : (
                filteredCodes.map(cdt => (
                  <button
                    key={cdt.code}
                    onClick={() => setSelectedCode(prev => prev === cdt.code ? '' : cdt.code)}
                    className={[
                      'w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors',
                      selectedCode === cdt.code
                        ? 'bg-[#e0f2fe]'
                        : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <span className="text-[10px] font-mono font-semibold text-[#0891b2] flex-shrink-0 w-12">
                      {cdt.code}
                    </span>
                    <span className="text-[10px] text-[#64748b] flex-1 truncate">
                      {cdt.description}
                    </span>
                    {selectedCode === cdt.code && (
                      <Check size={11} className="text-[#0891b2] flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Notes <span className="font-normal normal-case text-[#94a3b8]">(optional)</span>
            </p>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add clinical notes..."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2] text-[#0f172a] placeholder:text-[#94a3b8] resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#64748b] hover:text-[#0f172a] hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!conditionType}
            className={[
              'px-4 py-2 text-xs font-semibold rounded-lg transition-colors',
              conditionType
                ? 'bg-[#0891b2] text-white hover:bg-[#0e7490]'
                : 'bg-gray-100 text-[#94a3b8] cursor-not-allowed',
            ].join(' ')}
          >
            Apply Condition
          </button>
        </div>
      </div>
    </div>
  );
}
