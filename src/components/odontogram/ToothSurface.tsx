// ToothSurface — a single clickable SVG polygon representing one surface of a tooth.
// ⚠️ HIPAA: Surface status is PHI. Interactions create audit log entries upstream.

import { useState } from 'react';
import type { SurfaceName, TreatmentStatus } from '../../types/patient';
import { TREATMENT_COLORS } from './odontogram.types';

interface ToothSurfaceProps {
  surfaceName:   SurfaceName;
  points:        string;          // SVG polygon points
  status:        TreatmentStatus;
  isHighlighted?: boolean;
  onClick:       () => void;
  onMouseEnter:  (surface: SurfaceName) => void;
  onMouseLeave:  () => void;
}

export function ToothSurface({
  surfaceName,
  points,
  status,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ToothSurfaceProps) {
  const [isHovered, setIsHovered] = useState(false);

  const fill = TREATMENT_COLORS[status];
  const style: React.CSSProperties = {
    fill,
    filter: isHovered ? 'brightness(0.85)' : undefined,
    cursor: 'pointer',
  };

  return (
    <polygon
      points={points}
      stroke="#CBD5E1"
      strokeWidth="0.5"
      style={style}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        onMouseEnter(surfaceName);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onMouseLeave();
      }}
    />
  );
}
