// ConditionLegend — horizontal color chip legend for odontogram condition types.
// ⚠️ HIPAA: No PHI displayed here; legend is static reference data.

import type { ToothConditionType } from '../../types/patient';

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

export function ConditionLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {CONDITION_ENTRIES.map(({ type, label, color }) => (
        <div key={type} className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded border border-gray-200 flex-shrink-0"
            style={{ background: color }}
          />
          <span className="text-[10px] text-[#64748b]">{label}</span>
        </div>
      ))}
    </div>
  );
}
