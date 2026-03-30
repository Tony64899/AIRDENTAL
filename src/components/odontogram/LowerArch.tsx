// LowerArch — renders teeth 32–17 (mandibular arch) in anatomically correct order.
// Tooth 32 is at left (patient's lower right = screen left) to mirror the upper arch.
// ⚠️ HIPAA: Tooth state is PHI. Only render for authenticated providers.

import type { ToothState, SurfaceName } from '../../types/patient';
import { createFreshTooth } from '../../services/odontogramService';
import { Tooth } from './Tooth';

interface LowerArchProps {
  teeth:          ToothState[];
  selectedTooth:  number | null;
  onSurfaceClick: (toothNumber: number, surface: SurfaceName) => void;
  onToothClick:   (toothNumber: number) => void;
  onDoubleClick:  (toothNumber: number) => void;
  onContextMenu:  (toothNumber: number, x: number, y: number) => void;
  onSurfaceHover: (toothNumber: number, surface: SurfaceName | null, x: number, y: number) => void;
}

// Clinically correct US dental chart layout (matches Dentrix/Eaglesoft):
// Upper: 1  2  3  4  5  6  7  8 | 9  10 11 12 13 14 15 16
// Lower: 32 31 30 29 28 27 26 25 | 24 23 22 21 20 19 18 17
const LOWER_TEETH = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

export function LowerArch({
  teeth,
  selectedTooth,
  onSurfaceClick,
  onToothClick,
  onDoubleClick,
  onContextMenu,
  onSurfaceHover,
}: LowerArchProps) {
  return (
    <div>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-widest w-8">
          Lower
        </span>
        <div className="flex gap-0.5">
          {LOWER_TEETH.map(n => {
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
        <span className="text-[9px] text-[#94a3b8] ml-1">Mandibular</span>
      </div>
    </div>
  );
}
