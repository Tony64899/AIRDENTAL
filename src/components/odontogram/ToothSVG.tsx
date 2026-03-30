// ToothSVG — single interactive tooth rendered as SVG.
// ⚠️ HIPAA: Tooth condition data displayed here is PHI.

import type { ToothCondition, ToothConditionType, ToothSurface } from '../../types/patient';

interface ToothSVGProps {
  toothNumber:    number;
  conditions:     ToothCondition[];
  isSelected:     boolean;
  onSurfaceClick: (tooth: number, surface: ToothSurface) => void;
  onToothClick:   (tooth: number) => void;
}

const SURFACE_POINTS: Record<ToothSurface, string> = {
  B: '2,2 34,2 26,16 10,16',
  M: '2,2 10,16 10,28 2,42',
  D: '34,2 34,42 26,28 26,16',
  L: '10,28 26,28 34,42 2,42',
  O: '10,16 26,16 26,28 10,28',
};

const CONDITION_COLORS: Record<ToothConditionType, string> = {
  caries:     '#fca5a5',
  filling:    '#93c5fd',
  crown:      '#fcd34d',
  missing:    '#d1d5db',
  root_canal: '#c4b5fd',
  implant:    '#67e8f9',
  bridge:     '#fdba74',
  sealant:    '#86efac',
  watch:      '#fde68a',
  extraction: '#9ca3af',
  impacted:   '#d6d3d1',
};

function getSurfaceFill(surface: ToothSurface, conditions: ToothCondition[]): string {
  for (const cond of conditions) {
    // Whole-tooth condition (surfaces undefined) affects all surfaces
    if (!cond.surfaces || cond.surfaces.length === 0) {
      return CONDITION_COLORS[cond.type];
    }
    // Surface-specific condition
    if (cond.surfaces.includes(surface)) {
      return CONDITION_COLORS[cond.type];
    }
  }
  return '#f8fafc';
}

export function ToothSVG({
  toothNumber,
  conditions,
  isSelected,
  onSurfaceClick,
  onToothClick,
}: ToothSVGProps) {
  const hasMissingCondition = conditions.some(
    c => c.type === 'missing' || c.type === 'extraction',
  );

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        viewBox="0 0 36 44"
        width={36}
        height={44}
        className="cursor-pointer"
        onClick={() => onToothClick(toothNumber)}
      >
        {/* Outer tooth background */}
        <rect
          x="1"
          y="1"
          width="34"
          height="42"
          rx="4"
          ry="4"
          fill="#fff"
          stroke={isSelected ? '#0891b2' : '#cbd5e1'}
          strokeWidth={isSelected ? 1.5 : 1}
        />

        {/* 5 surface polygons */}
        {(['B', 'M', 'D', 'L', 'O'] as ToothSurface[]).map(surface => (
          <polygon
            key={surface}
            points={SURFACE_POINTS[surface]}
            fill={getSurfaceFill(surface, conditions)}
            stroke="#e2e8f0"
            strokeWidth="0.5"
            className="transition-colors cursor-pointer hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(toothNumber, surface);
            }}
          />
        ))}

        {/* Missing tooth: large X */}
        {hasMissingCondition && (
          <>
            <line x1="5" y1="5" x2="31" y2="39" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
            <line x1="31" y1="5" x2="5" y2="39" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>

      {/* Tooth number */}
      <span className="text-[9px] font-medium text-[#94a3b8] leading-none select-none">
        {toothNumber}
      </span>
    </div>
  );
}
