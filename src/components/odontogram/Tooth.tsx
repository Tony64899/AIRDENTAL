// Tooth — a single tooth with 5 SVG surface polygons, tooth number, and interactions.
// ⚠️ HIPAA: Tooth state is PHI. Every surface click is audit-logged upstream.

import { useState } from 'react';
import type { ToothState, SurfaceName } from '../../types/patient';
import { SURFACE_POINTS, getSurfaces } from './odontogram.types';
import { ToothSurface } from './ToothSurface';

interface ToothProps {
  toothState:      ToothState;
  isSelected:      boolean;
  onSurfaceClick:  (toothNumber: number, surface: SurfaceName) => void;
  onToothClick:    (toothNumber: number) => void;
  onDoubleClick:   (toothNumber: number) => void;
  onContextMenu:   (toothNumber: number, x: number, y: number) => void;
  onSurfaceHover:  (toothNumber: number, surface: SurfaceName | null, x: number, y: number) => void;
}

export function Tooth({
  toothState,
  isSelected,
  onSurfaceClick,
  onToothClick,
  onDoubleClick,
  onContextMenu,
  onSurfaceHover,
}: ToothProps) {
  const { toothNumber } = toothState;
  const [hoveredSurface, setHoveredSurface] = useState<SurfaceName | null>(null);

  const isUpper             = toothNumber <= 16;
  const isMissingOrExtracted = toothState.toothLevelStatus === 'missing';
  const isImplant            = toothState.toothLevelStatus === 'implant';

  const surfaces = getSurfaces(toothNumber);

  const toothNumberLabel = (
    <span
      onClick={() => onToothClick(toothNumber)}
      className={[
        'text-[9px] font-medium cursor-pointer select-none leading-none',
        isSelected
          ? 'text-[#0891b2] font-bold'
          : 'text-[#94a3b8] hover:text-[#64748b]',
      ].join(' ')}
    >
      {toothNumber}
    </span>
  );

  return (
    <div
      className="flex flex-col items-center gap-0.5"
      onMouseMove={(e) => {
        if (hoveredSurface) {
          onSurfaceHover(toothNumber, hoveredSurface, e.clientX, e.clientY);
        }
      }}
      onMouseLeave={() => {
        setHoveredSurface(null);
        onSurfaceHover(toothNumber, null, 0, 0);
      }}
    >
      {/* Number above for lower arch */}
      {!isUpper && toothNumberLabel}

      <svg
        viewBox="0 0 36 44"
        width={36}
        height={44}
        onDoubleClick={(e) => {
          e.preventDefault();
          onDoubleClick(toothNumber);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(toothNumber, e.clientX, e.clientY);
        }}
        className={isSelected ? 'ring-2 ring-[#0891b2] rounded' : ''}
      >
        {/* Outer tooth background */}
        <rect
          x="1" y="1" width="34" height="42" rx="4" ry="4"
          fill="white"
          stroke={isSelected ? '#0891b2' : '#94a3b8'}
          strokeWidth={isSelected ? 1.5 : 0.75}
        />

        {/* 5 surface polygons */}
        {surfaces.map(surfaceName => {
          const surfaceData = toothState.surfaces.find(s => s.name === surfaceName);
          const status = toothState.toothLevelStatus ?? (surfaceData?.status ?? 'healthy');
          return (
            <ToothSurface
              key={surfaceName}
              surfaceName={surfaceName}
              points={SURFACE_POINTS[surfaceName]}
              status={status}
              onClick={() => onSurfaceClick(toothNumber, surfaceName)}
              onMouseEnter={(s) => setHoveredSurface(s)}
              onMouseLeave={() => setHoveredSurface(null)}
            />
          );
        })}

        {/* Missing tooth X overlay */}
        {isMissingOrExtracted && (
          <>
            <line x1="5"  y1="5"  x2="31" y2="39" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="31" y1="5"  x2="5"  y2="39" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Implant screw symbol — 3 horizontal lines below midpoint */}
        {isImplant && !isMissingOrExtracted && (
          <>
            <line x1="15" y1="24" x2="21" y2="24" stroke="#27AE60" strokeWidth="1.5" />
            <line x1="13" y1="27" x2="23" y2="27" stroke="#27AE60" strokeWidth="1.5" />
            <line x1="15" y1="30" x2="21" y2="30" stroke="#27AE60" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {/* Number below for upper arch */}
      {isUpper && toothNumberLabel}
    </div>
  );
}
