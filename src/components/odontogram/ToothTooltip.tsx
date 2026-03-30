// ToothTooltip — fixed-position tooltip shown on surface hover.
// ⚠️ HIPAA: Shows surface status and provider — PHI in clinical context.

import type { SurfaceName, ToothSurfaceData } from '../../types/patient';
import { TOOTH_NAMES, TREATMENT_COLORS, TREATMENT_LABELS } from './odontogram.types';

interface ToothTooltipProps {
  toothNumber: number;
  surface:     SurfaceName;
  surfaceData: ToothSurfaceData;
  x:           number;
  y:           number;
}

export function ToothTooltip({ toothNumber, surface, surfaceData, x, y }: ToothTooltipProps) {
  return (
    <div
      className="fixed z-50 pointer-events-none bg-[#0f172a] text-white text-[11px] rounded-lg px-3 py-2 shadow-xl max-w-[200px]"
      style={{ left: x + 14, top: Math.max(8, y - 10) }}
    >
      <div className="font-semibold">{TOOTH_NAMES[toothNumber]}</div>
      <div className="text-[#94a3b8] text-[10px] mt-0.5">
        Surface: {surface.charAt(0).toUpperCase() + surface.slice(1)}
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-sm inline-block border border-white/20"
          style={{ background: TREATMENT_COLORS[surfaceData.status] }}
        />
        <span>{TREATMENT_LABELS[surfaceData.status]}</span>
      </div>
      {surfaceData.status !== 'healthy' && (
        <div className="text-[#94a3b8] text-[10px] mt-1">
          {surfaceData.chartedBy} &middot; {new Date(surfaceData.chartedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
