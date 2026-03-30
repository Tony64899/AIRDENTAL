// procedureColors — maps procedure categories to appointment block color tokens.
// Used by AppointmentCard to color-code blocks by clinical type at a glance.
// ⚠️ HIPAA note: colors are UI-only and do not encode PHI.

import type { ProcedureCategory } from '../types/appointment';

export interface ProcColor { bg: string; border: string; text: string }

// ── Per-category color palette ─────────────────────────────────────────────
// Soft backgrounds with darker border/text for accessibility contrast.
export const CATEGORY_COLORS: Record<ProcedureCategory, ProcColor> = {
  preventive:    { bg: '#DCFCE7', border: '#16A34A', text: '#15803D' },  // green
  restorative:   { bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8' },  // blue
  endodontic:    { bg: '#FFEDD5', border: '#EA580C', text: '#C2410C' },  // orange (gutta-percha)
  prosthodontic: { bg: '#FEF9C3', border: '#CA8A04', text: '#A16207' },  // yellow (crown/gold)
  surgical:      { bg: '#FEE2E2', border: '#DC2626', text: '#B91C1C' },  // red
  implant:       { bg: '#F3F4F6', border: '#4B5563', text: '#374151' },  // steel gray
  orthodontic:   { bg: '#EDE9FE', border: '#7C3AED', text: '#6D28D9' },  // purple
  periodontic:   { bg: '#CFFAFE', border: '#0891B2', text: '#0E7490' },  // teal
  cosmetic:      { bg: '#FCE7F3', border: '#DB2777', text: '#BE185D' },  // pink
  emergency:     { bg: '#FEE2E2', border: '#991B1B', text: '#7F1D1D' },  // dark red
  consultation:  { bg: '#F1F5F9', border: '#475569', text: '#334155' },  // slate
  pediatric:     { bg: '#E0F2FE', border: '#0284C7', text: '#0369A1' },  // sky blue
};

const DEFAULT_COLOR: ProcColor = { bg: '#F9FAFB', border: '#9CA3AF', text: '#6B7280' };

// ── Keyword → category auto-detection ──────────────────────────────────────
const KEYWORD_MAP: [string[], ProcedureCategory][] = [
  [['cleaning', 'prophy', 'fluoride', 'sealant', 'exam', 'recall', 'hygiene'],       'preventive'],
  [['composite', 'filling', 'amalgam', 'restoration', 'cavity', 'cavities'],          'restorative'],
  [['root canal', 'rct', 'pulpotomy', 'pulpectomy', 'endo'],                          'endodontic'],
  [['crown', 'bridge', 'veneer', 'denture', 'onlay', 'inlay', 'prostho'],             'prosthodontic'],
  [['extraction', 'surgery', 'surgical', 'wisdom', 'biopsy', 'alveoplasty'],          'surgical'],
  [['implant'],                                                                        'implant'],
  [['ortho', 'braces', 'invisalign', 'retainer', 'aligner', 'alignment'],             'orthodontic'],
  [['perio', 'scaling', 'srp', 'root planing', 'gingival', 'osseous', 'gingivitis'], 'periodontic'],
  [['whitening', 'bleaching', 'bonding', 'cosmetic', 'aesthetic'],                    'cosmetic'],
  [['emergency', 'pain', 'abscess', 'trauma', 'urgent', 'acute'],                    'emergency'],
  [['consultation', 'consult', 'new patient', 'x-ray', 'xray', 'photo', 'panorex'],  'consultation'],
  [['pediatric', 'child', 'kid', 'space maintainer', 'pedo'],                        'pediatric'],
];

/**
 * Infer a ProcedureCategory from a free-text procedure name.
 * Returns undefined if no keyword matches (caller should use DEFAULT_COLOR).
 */
export function getCategoryFromProcedure(name: string): ProcedureCategory | undefined {
  const lower = name.toLowerCase();
  for (const [keywords, category] of KEYWORD_MAP) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return undefined;
}

/**
 * Return the color tokens for a given procedure category.
 * Falls back to DEFAULT_COLOR for undefined/unknown categories.
 */
export function getProcedureColor(category?: ProcedureCategory | null): ProcColor {
  if (!category) return DEFAULT_COLOR;
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
}

/** All categories in display order — used for legend rendering. */
export const ALL_CATEGORIES: ProcedureCategory[] = [
  'preventive', 'restorative', 'endodontic', 'prosthodontic',
  'surgical', 'implant', 'orthodontic', 'periodontic',
  'cosmetic', 'emergency', 'consultation', 'pediatric',
];

export const CATEGORY_LABELS: Record<ProcedureCategory, string> = {
  preventive:    'Preventive',
  restorative:   'Restorative',
  endodontic:    'Endodontic',
  prosthodontic: 'Prosthodontic',
  surgical:      'Surgical',
  implant:       'Implant',
  orthodontic:   'Orthodontic',
  periodontic:   'Periodontic',
  cosmetic:      'Cosmetic',
  emergency:     'Emergency',
  consultation:  'Consultation',
  pediatric:     'Pediatric',
};
