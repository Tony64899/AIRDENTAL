// odontogram.types.ts — display helpers and constants for the odontogram module.
// ⚠️ HIPAA: Tooth chart data is PHI. Every mutation must be audit-logged.
export type {
  TreatmentStatus, SurfaceName, ToothSurfaceData,
  ToothHistoryEntry, ToothState, OdontogramState,
} from '../../types/patient';

import type { TreatmentStatus, SurfaceName } from '../../types/patient';

// Treatment display color — matches the clinical spec exactly
export const TREATMENT_COLORS: Record<TreatmentStatus, string> = {
  healthy:   '#FFFFFF',
  caries:    '#E74C3C',
  composite: '#4A90D9',
  amalgam:   '#95A5A6',
  crown:     '#F1C40F',
  missing:   '#555555',
  implant:   '#27AE60',
  rct:       '#8E44AD',
  veneer:    '#FF69B4',
  onlay:     '#E67E22',
  watch:     '#FFA726',
};

export const TREATMENT_LABELS: Record<TreatmentStatus, string> = {
  healthy:   'Healthy',
  caries:    'Caries',
  composite: 'Composite',
  amalgam:   'Amalgam',
  crown:     'Crown',
  missing:   'Missing',
  implant:   'Implant',
  rct:       'Root Canal',
  veneer:    'Veneer',
  onlay:     'Onlay',
  watch:     'Watch',
};

// All treatment types in display order
export const ALL_TREATMENTS: TreatmentStatus[] = [
  'healthy', 'caries', 'composite', 'amalgam', 'crown',
  'missing', 'implant', 'rct', 'veneer', 'onlay', 'watch',
];

// Which teeth are ANTERIOR (have Incisal surface instead of Occlusal)
export function isAnterior(toothNumber: number): boolean {
  return (toothNumber >= 6 && toothNumber <= 11) || (toothNumber >= 22 && toothNumber <= 27);
}

// Surface names per tooth type (in display order: B, M, O/I, D, L)
export function getSurfaces(toothNumber: number): SurfaceName[] {
  return isAnterior(toothNumber)
    ? ['buccal', 'mesial', 'incisal', 'distal', 'lingual']
    : ['buccal', 'mesial', 'occlusal', 'distal', 'lingual'];
}

// SVG polygon points per surface in the 36×44 viewBox
export const SURFACE_POINTS: Record<SurfaceName, string> = {
  buccal:   '2,2 34,2 26,16 10,16',
  mesial:   '2,2 10,16 10,28 2,42',
  occlusal: '10,16 26,16 26,28 10,28',
  incisal:  '10,16 26,16 26,28 10,28',  // same geometry as occlusal
  distal:   '34,2 34,42 26,28 26,16',
  lingual:  '10,28 26,28 34,42 2,42',
};

// Full tooth name for tooltips
export const TOOTH_NAMES: Record<number, string> = {
   1: 'Upper Right 3rd Molar (Wisdom)',
   2: 'Upper Right 2nd Molar',
   3: 'Upper Right 1st Molar',
   4: 'Upper Right 2nd Premolar',
   5: 'Upper Right 1st Premolar',
   6: 'Upper Right Canine',
   7: 'Upper Right Lateral Incisor',
   8: 'Upper Right Central Incisor',
   9: 'Upper Left Central Incisor',
  10: 'Upper Left Lateral Incisor',
  11: 'Upper Left Canine',
  12: 'Upper Left 1st Premolar',
  13: 'Upper Left 2nd Premolar',
  14: 'Upper Left 1st Molar',
  15: 'Upper Left 2nd Molar',
  16: 'Upper Left 3rd Molar (Wisdom)',
  17: 'Lower Left 3rd Molar (Wisdom)',
  18: 'Lower Left 2nd Molar',
  19: 'Lower Left 1st Molar',
  20: 'Lower Left 2nd Premolar',
  21: 'Lower Left 1st Premolar',
  22: 'Lower Left Canine',
  23: 'Lower Left Lateral Incisor',
  24: 'Lower Left Central Incisor',
  25: 'Lower Right Central Incisor',
  26: 'Lower Right Lateral Incisor',
  27: 'Lower Right Canine',
  28: 'Lower Right 1st Premolar',
  29: 'Lower Right 2nd Premolar',
  30: 'Lower Right 1st Molar',
  31: 'Lower Right 2nd Molar',
  32: 'Lower Right 3rd Molar (Wisdom)',
};
