// OdontogramToolbar — mode toggle, treatment selector, undo/redo, and save controls.
// ⚠️ HIPAA: Mode and treatment type affect how PHI is recorded — logged upstream.

import { RotateCcw, RotateCw, Trash2, Printer, Save } from 'lucide-react';
import type { TreatmentStatus } from '../../types/patient';
import { TREATMENT_COLORS, TREATMENT_LABELS, ALL_TREATMENTS } from './odontogram.types';

interface OdontogramToolbarProps {
  mode:              'existing' | 'planned';
  selectedTreatment: TreatmentStatus;
  canUndo:           boolean;
  canRedo:           boolean;
  pendingChanges:    boolean;
  saving:            boolean;
  lastSaved:         Date | null;
  onModeChange:      (mode: 'existing' | 'planned') => void;
  onTreatmentChange: (t: TreatmentStatus) => void;
  onUndo:            () => void;
  onRedo:            () => void;
  onClearAll:        () => void;
  onPrint:           () => void;
  onSave:            () => void;
}

export function OdontogramToolbar({
  mode,
  selectedTreatment,
  canUndo,
  canRedo,
  pendingChanges,
  saving,
  lastSaved,
  onModeChange,
  onTreatmentChange,
  onUndo,
  onRedo,
  onClearAll,
  onPrint,
  onSave,
}: OdontogramToolbarProps) {

  function handleClearAll() {
    if (window.confirm('Clear all tooth conditions? This cannot be undone.')) {
      onClearAll();
    }
  }

  const statusText = saving
    ? 'Saving\u2026'
    : pendingChanges
    ? '\u25CF Unsaved changes'
    : lastSaved
    ? '\u2713 Saved'
    : '';

  const statusColor = saving
    ? 'text-[#94a3b8]'
    : pendingChanges
    ? 'text-amber-500'
    : 'text-green-600';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-wrap items-center gap-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-0.5 rounded-lg overflow-hidden border border-gray-200">
        <button
          onClick={() => onModeChange('existing')}
          className={[
            'px-3 py-1.5 text-[11px] font-semibold transition-colors',
            mode === 'existing'
              ? 'bg-[#4A90D9] text-white'
              : 'bg-gray-100 text-[#64748b] hover:bg-gray-200',
          ].join(' ')}
        >
          Existing
        </button>
        <button
          onClick={() => onModeChange('planned')}
          className={[
            'px-3 py-1.5 text-[11px] font-semibold transition-colors',
            mode === 'planned'
              ? 'bg-[#E74C3C] text-white'
              : 'bg-gray-100 text-[#64748b] hover:bg-gray-200',
          ].join(' ')}
        >
          Planned
        </button>
      </div>

      {/* Treatment type selector */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
        {ALL_TREATMENTS.map(treatment => (
          <button
            key={treatment}
            onClick={() => onTreatmentChange(treatment)}
            title={TREATMENT_LABELS[treatment]}
            className={[
              'flex items-center gap-1 px-2 py-1 rounded-md transition-colors flex-shrink-0',
              selectedTreatment === treatment
                ? 'ring-2 ring-[#0891b2] bg-white'
                : 'bg-white border border-gray-200 hover:border-[#0891b2]',
            ].join(' ')}
          >
            <span
              className="w-3 h-3 rounded-sm border border-black/10 flex-shrink-0"
              style={{ background: TREATMENT_COLORS[treatment] }}
            />
            <span className="text-[10px] text-[#0f172a] whitespace-nowrap">
              {TREATMENT_LABELS[treatment]}
            </span>
          </button>
        ))}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 text-[#64748b]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 text-[#64748b]"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <span className="text-gray-300 text-sm select-none">|</span>

        {/* Clear All */}
        <button
          onClick={handleClearAll}
          title="Clear all conditions"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-[#64748b] hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>

        {/* Print */}
        <button
          onClick={onPrint}
          title="Print chart"
          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-[#64748b]"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={saving}
          title="Save odontogram"
          className={[
            'flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors',
            pendingChanges
              ? 'text-[#0891b2] hover:bg-blue-50'
              : 'text-[#64748b] hover:bg-gray-100',
          ].join(' ')}
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {/* Status text */}
        {statusText && (
          <span className={`text-[10px] font-medium ml-1 ${statusColor}`}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
}
