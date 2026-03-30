// ToothGrid — full 32-tooth arch layout using Universal Numbering System.
// ⚠️ HIPAA: Displays PHI. Only render for authenticated providers.

import type { ToothCondition, ToothSurface } from '../../types/patient';
import { ToothSVG } from './ToothSVG';

interface ToothGridProps {
  conditions:     ToothCondition[];
  selectedTooth:  number | null;
  onSurfaceClick: (tooth: number, surface: ToothSurface) => void;
  onToothClick:   (tooth: number) => void;
}

// Universal Numbering System layout
// Left-to-right on screen = patient's right to left
const UPPER_TEETH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const;
const LOWER_TEETH = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17] as const;

export function ToothGrid({
  conditions,
  selectedTooth,
  onSurfaceClick,
  onToothClick,
}: ToothGridProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      {/* Upper arch label */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Upper</span>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] text-[#94a3b8]">Maxillary</span>
      </div>

      {/* Upper teeth row */}
      <div className="flex gap-1 justify-center">
        {UPPER_TEETH.map(n => (
          <ToothSVG
            key={n}
            toothNumber={n}
            conditions={conditions.filter(c => c.toothNumber === n)}
            isSelected={selectedTooth === n}
            onSurfaceClick={onSurfaceClick}
            onToothClick={onToothClick}
          />
        ))}
      </div>

      {/* Midline divider */}
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-2">Midline</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Lower teeth row */}
      <div className="flex gap-1 justify-center">
        {LOWER_TEETH.map(n => (
          <ToothSVG
            key={n}
            toothNumber={n}
            conditions={conditions.filter(c => c.toothNumber === n)}
            isSelected={selectedTooth === n}
            onSurfaceClick={onSurfaceClick}
            onToothClick={onToothClick}
          />
        ))}
      </div>

      {/* Lower arch label */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Lower</span>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] text-[#94a3b8]">Mandibular</span>
      </div>
    </div>
  );
}
