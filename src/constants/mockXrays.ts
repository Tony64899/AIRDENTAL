// mockXrays.ts — Mock X-ray data for Phase 7 development.
// ⚠️ HIPAA: X-ray images and metadata are PHI. Never use real patient data here.
//            All entries are fictional development placeholders.

import type { XrayImage, XrayAnnotation } from '../types/xray';

// Mock X-ray helper — generates dark SVG data-URIs as X-ray placeholders.
function makePlaceholder(label: string, width = 800, height = 600): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#1a1a1a"/>
        <stop offset="100%" stop-color="#050505"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" font-family="monospace" font-size="18" fill="#3a3a3a">${label}</text>
    <text x="${width / 2}" y="${height / 2 + 16}" text-anchor="middle" font-family="monospace" font-size="11" fill="#2a2a2a">Air Dental — Development Placeholder</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeThumb(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90">
    <rect width="120" height="90" fill="#111"/>
    <text x="60" y="45" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-size="10" fill="#444">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const MOCK_XRAYS: XrayImage[] = [
  // ── xr-1: pat-1, PA tooth 30 ─────────────────────────────────────────────
  {
    id:            'xr-1',
    patientId:     'pat-1',
    fileUrl:       makePlaceholder('PA #30', 600, 500),
    thumbnailUrl:  makeThumb('PA'),
    type:          'PA',
    toothNumbers:  [30],
    providerId:    'prov-1',
    date:          '2026-03-30',
    notes:         'Pre-crown PA for tooth #30. Root length adequate.',
    fileName:      'PA_30_20260330.jpg',
    fileSizeBytes: 245000,
  },

  // ── xr-2: pat-1, BW lower right ──────────────────────────────────────────
  {
    id:            'xr-2',
    patientId:     'pat-1',
    fileUrl:       makePlaceholder('BW — Lower Right', 800, 400),
    thumbnailUrl:  makeThumb('BW'),
    type:          'BW',
    toothNumbers:  [],
    quadrant:      'LR',
    providerId:    'prov-1',
    date:          '2025-09-10',
    fileName:      'BW_LR_20250910.jpg',
    fileSizeBytes: 198000,
  },

  // ── xr-3: pat-1, Panoramic ───────────────────────────────────────────────
  {
    id:            'xr-3',
    patientId:     'pat-1',
    fileUrl:       makePlaceholder('Panoramic', 1200, 500),
    thumbnailUrl:  makeThumb('Pano'),
    type:          'Pano',
    toothNumbers:  [],
    quadrant:      'full',
    providerId:    'prov-1',
    date:          '2024-03-15',
    notes:         'Annual panoramic. No unusual findings.',
    fileName:      'Pano_20240315.jpg',
    fileSizeBytes: 512000,
  },

  // ── xr-4: pat-3, PA tooth 30 RCT ─────────────────────────────────────────
  {
    id:            'xr-4',
    patientId:     'pat-3',
    fileUrl:       makePlaceholder('PA #30 — RCT', 600, 500),
    thumbnailUrl:  makeThumb('PA'),
    type:          'PA',
    toothNumbers:  [30],
    providerId:    'prov-2',
    date:          '2026-03-30',
    notes:         'RCT tooth #30 — working length verification.',
    fileName:      'PA_30_RCT_20260330.jpg',
    fileSizeBytes: 267000,
  },

  // ── xr-5: pat-3, BW lower right ──────────────────────────────────────────
  {
    id:            'xr-5',
    patientId:     'pat-3',
    fileUrl:       makePlaceholder('BW — Lower Right', 800, 400),
    thumbnailUrl:  makeThumb('BW'),
    type:          'BW',
    toothNumbers:  [],
    quadrant:      'LR',
    providerId:    'prov-2',
    date:          '2026-03-30',
    notes:         'Caries evident on distal #2.',
    fileName:      'BW_LR_20260330.jpg',
    fileSizeBytes: 189000,
  },

  // ── xr-6: pat-3, PA tooth 2 ──────────────────────────────────────────────
  {
    id:            'xr-6',
    patientId:     'pat-3',
    fileUrl:       makePlaceholder('PA #2', 600, 500),
    thumbnailUrl:  makeThumb('PA'),
    type:          'PA',
    toothNumbers:  [2],
    providerId:    'prov-2',
    date:          '2026-03-30',
    fileName:      'PA_2_20260330.jpg',
    fileSizeBytes: 221000,
  },

  // ── xr-7: pat-5, PA tooth 19 implant ─────────────────────────────────────
  {
    id:            'xr-7',
    patientId:     'pat-5',
    fileUrl:       makePlaceholder('PA #19 — Implant', 600, 500),
    thumbnailUrl:  makeThumb('PA'),
    type:          'PA',
    toothNumbers:  [19],
    providerId:    'prov-3',
    date:          '2026-03-30',
    notes:         'Implant placement #19. Good osseointegration.',
    fileName:      'PA_19_implant_20260330.jpg',
    fileSizeBytes: 289000,
  },

  // ── xr-8: pat-5, Panoramic pre-surgical ──────────────────────────────────
  {
    id:            'xr-8',
    patientId:     'pat-5',
    fileUrl:       makePlaceholder('Panoramic — Pre-Surgical', 1200, 500),
    thumbnailUrl:  makeThumb('Pano'),
    type:          'Pano',
    toothNumbers:  [],
    quadrant:      'full',
    providerId:    'prov-3',
    date:          '2021-03-05',
    notes:         'Pre-surgical panoramic. Wisdom teeth visible.',
    fileName:      'Pano_20210305.jpg',
    fileSizeBytes: 498000,
  },

  // ── xr-9: pat-5, BW upper left ───────────────────────────────────────────
  {
    id:            'xr-9',
    patientId:     'pat-5',
    fileUrl:       makePlaceholder('BW — Upper Left', 800, 400),
    thumbnailUrl:  makeThumb('BW'),
    type:          'BW',
    toothNumbers:  [],
    quadrant:      'UL',
    providerId:    'prov-3',
    date:          '2024-09-12',
    fileName:      'BW_UL_20240912.jpg',
    fileSizeBytes: 201000,
  },

  // ── xr-10: pat-7, PA tooth 3 crown ───────────────────────────────────────
  {
    id:            'xr-10',
    patientId:     'pat-7',
    fileUrl:       makePlaceholder('PA #3 — Crown', 600, 500),
    thumbnailUrl:  makeThumb('PA'),
    type:          'PA',
    toothNumbers:  [3],
    providerId:    'prov-1',
    date:          '2019-07-22',
    notes:         'Crown prep PA for tooth #3.',
    fileName:      'PA_3_crown_20190722.jpg',
    fileSizeBytes: 234000,
  },

  // ── xr-11: pat-7, BW upper right ─────────────────────────────────────────
  {
    id:            'xr-11',
    patientId:     'pat-7',
    fileUrl:       makePlaceholder('BW — Upper Right', 800, 400),
    thumbnailUrl:  makeThumb('BW'),
    type:          'BW',
    toothNumbers:  [],
    quadrant:      'UR',
    providerId:    'prov-1',
    date:          '2025-12-12',
    fileName:      'BW_UR_20251212.jpg',
    fileSizeBytes: 188000,
  },

  // ── xr-12: pat-2, FMX full mouth series ──────────────────────────────────
  {
    id:            'xr-12',
    patientId:     'pat-2',
    fileUrl:       makePlaceholder('FMX — Full Mouth Series', 1000, 700),
    thumbnailUrl:  makeThumb('FMX'),
    type:          'FMX',
    toothNumbers:  [],
    quadrant:      'full',
    providerId:    'prov-1',
    date:          '2023-06-20',
    notes:         'Full mouth series on recall.',
    fileName:      'FMX_20230620.jpg',
    fileSizeBytes: 876000,
  },
];

export const MOCK_ANNOTATIONS: XrayAnnotation[] = [
  {
    id:        'ann-1',
    xrayId:    'xr-4',
    type:      'text',
    x:         45,
    y:         60,
    label:     'Working length 21mm',
    createdBy: 'Dr. Michael Torres',
    createdAt: '2026-03-30T09:30:00Z',
  },
  {
    id:        'ann-2',
    xrayId:    'xr-4',
    type:      'arrow',
    x:         48,
    y:         55,
    x2:        52,
    y2:        65,
    label:     'Apex',
    createdBy: 'Dr. Michael Torres',
    createdAt: '2026-03-30T09:31:00Z',
  },
  {
    id:        'ann-3',
    xrayId:    'xr-7',
    type:      'text',
    x:         50,
    y:         70,
    label:     'Implant seated — good bone contact',
    createdBy: 'Dr. Emily White',
    createdAt: '2026-03-30T10:15:00Z',
  },
];

// O(1) lookup by X-ray ID
export const MOCK_XRAYS_MAP: Record<string, XrayImage> = Object.fromEntries(
  MOCK_XRAYS.map(x => [x.id, x]),
);
