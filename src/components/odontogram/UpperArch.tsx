// UpperArch — renders teeth 1–16 (maxillary arch) in anatomically correct order.
// ⚠️ HIPAA: Tooth state is PHI. Only render for authenticated providers.

import type { ToothState, SurfaceName } from '../../types/patient';
import { createFreshTooth } from '../../services/odontogramService';
import { Tooth } from './Tooth';

interface UpperArchProps {
  teeth:          ToothState[];
  selectedTooth:  number | null;
  onSurfaceClick: (toothNumber: number, surface: SurfaceName) => void;
  onToothClick:   (toothNumber: number) => void;
  onDoubleClick:  (toothNumber: number) => void;
  onContextMenu:  (toothNumber: number, x: number, y: number) => void;
  onSurfaceHover: (toothNumber: number, surface: SurfaceName | null, x: number, y: number) => void;
}

const UPPER_TEETH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export function UpperArch({
  teeth,
  selectedTooth,
  onSurfaceClick,
  onToothClick,
  onDoubleClick,
  onContextMenu,
  onSurfaceHover,
}: UpperArchProps) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-widest w-8">
          Upper
        </span>
        <div className="flex gap-0.5">
          {UPPER_TEETH.map(n => {
            const toothState = teeth.find(t => t.toothNumber === n) ?? createFreshTooth(n);
            return (
              <Tooth
                key={n}
                toothState={toothState}
                isSelected={selectedTooth === n}
                onSurfaceClick={onSurfaceClick}
                onToothClick={onToothClick}
                onDoubleClick={onDoubleClick}
                onContextMenu={onContextMenu}
                onSurfaceHover={onSurfaceHover}
              />
            );
          })}
        </div>
        <span className="text-[9px] text-[#94a3b8] ml-1">Maxillary</span>
      </div>
    </div>
  );
}
