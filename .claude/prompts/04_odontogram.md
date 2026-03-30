# Page Prompt 04 — Odontogram (Interactive Tooth Chart)
# Save to: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\.claude\prompts\04_odontogram.md
# Usage: Paste MASTER_PROMPT.md first, then paste this file contents below it.

---

```
Now let's build Page 04: Odontogram (Interactive Tooth Chart) for Air Dental.

---

## Overview

Build a fully interactive, clinical-grade odontogram (tooth chart) component
embedded within the Patient Chart page. This is one of the most critical and
unique features of any dental software — it must be accurate, intuitive, and
fast to use chairside during a patient visit.

I am a DMD dentist. I will validate all clinical logic. Ask me if anything
is unclear about dental anatomy or workflow.

---

## Numbering System

- Standard: Universal Numbering System (US standard)
- Upper arch (maxillary): #1 through #16, displayed left to right on screen
  - Patient's upper right = screen left (#1 = upper right 3rd molar)
  - Patient's upper left = screen right (#16 = upper left 3rd molar)
- Lower arch (mandibular): #17 through #32, displayed left to right on screen
  - Patient's lower left = screen left (#17 = lower left 3rd molar)
  - Patient's lower right = screen right (#32 = lower right 3rd molar)
- Include all 32 teeth including wisdom teeth (#1, #16, #17, #32)
- Label each tooth with its number below (upper arch) or above (lower arch)

---

## Tooth Anatomy — Surfaces (5 surfaces per tooth)

Each tooth must have 5 independently clickable surfaces.

For POSTERIOR teeth (molars and premolars — #1–5, #12–21, #28–32):
- Mesial (M)     — left side of tooth (toward midline)
- Distal (D)     — right side of tooth (away from midline)
- Occlusal (O)   — center biting surface
- Buccal (B)     — outer surface facing the cheek
- Lingual (L)    — inner surface facing the tongue

For ANTERIOR teeth (incisors and canines — #6–11, #22–27):
- Mesial (M)     — left side
- Distal (D)     — right side
- Incisal (I)    — cutting edge (replaces Occlusal for anteriors)
- Buccal (B)     — outer/facial surface
- Lingual (L)    — inner surface

SVG layout per tooth (top-down view):
┌─────────────────┐
│   Buccal (B)    │
├────┬───────┬────┤
│ M  │   O   │ D  │
├────┴───────┴────┤
│   Lingual (L)   │
└─────────────────┘

---

## Color Coding System

Apply colors to individual surfaces OR the entire tooth:

| Color       | Hex     | Meaning                             |
|-------------|---------|-------------------------------------|
| White/Clear | #FFFFFF | Healthy — no finding                |
| Blue        | #4A90D9 | Existing restoration (already done) |
| Red         | #E74C3C | Treatment needed / Caries detected  |
| Gold        | #F1C40F | Crown (full coverage)               |
| Silver/Gray | #95A5A6 | Amalgam restoration                 |
| Green       | #27AE60 | Implant                             |
| Dark Gray   | #555555 | Missing tooth (extracted)           |
| Purple      | #8E44AD | Root canal treated (RCT)            |
| Orange      | #E67E22 | Partial crown / Onlay               |
| Pink        | #FF69B4 | Veneer                              |

Rules:
- Surface-level color: applied to individual surface polygon only
- Tooth-level color: applied to entire tooth (e.g. missing, implant, crown)
- Missing tooth: render as outline only with an X drawn through it
- Implant: render with a small screw symbol below the tooth number

---

## Toolbar (top of odontogram)

Left side:
- [ Existing ] [ Planned ] toggle button — switches charting mode
  - Existing mode: charting what HAS already been done (blue tones)
  - Planned mode: charting what NEEDS to be done (red tones)
- Display current mode clearly (e.g. "Mode: EXISTING")

Center:
- Treatment type dropdown — select what to apply on next click:
  Healthy | Caries | Composite | Amalgam | Crown | Missing |
  Implant | RCT | Veneer | Onlay | Watch
- Clicking a surface immediately applies the selected treatment

Right side:
- [ Undo ] (Ctrl+Z)
- [ Redo ] (Ctrl+Y)
- [ Clear All ] with confirmation dialog
- [ Print ] — print-friendly view of the tooth chart
- [ Save ] — manual save trigger
- Status indicator: "All changes saved" or "Unsaved changes..."
- Auto-save every 30 seconds silently in the background

---

## Interactions

1. Click a surface → apply selected treatment to that surface
2. Click tooth number → select entire tooth
3. Right-click tooth → context menu:
   - Set as Missing
   - Set as Implant
   - Add / Edit Note
   - Clear this tooth
   - View change history
4. Hover over surface → tooltip showing:
   - Tooth name (e.g. "Tooth #14 — Upper Left 1st Molar")
   - Surface name (e.g. "Occlusal")
   - Current status + who charted it + when
5. Double-click tooth → open Tooth Detail Panel

---

## Tooth Detail Panel

Opens as a right-side panel or modal on double-click:
- Tooth number and full name in header
- Free-text notes field
- Linked CDT codes (e.g. D2391 — Resin composite, 1 surface, posterior)
- Charted by: [provider name] on [date]
- Change history log (all past changes to this tooth)
- [ Save ] button

---

## Perio Integration — Placeholder Only

Structure the data model to support future perio charting:
- 6 probing depths per tooth (MB, B, DB, ML, L, DL)
- Bleeding on probing (BOP) flags
- Recession measurements
- Furcation involvement grade

Do NOT build this UI now. Just include the fields in the data model.

---

## TypeScript Data Model

```typescript
type TreatmentStatus =
  | 'healthy'
  | 'caries'
  | 'composite'
  | 'amalgam'
  | 'crown'
  | 'missing'
  | 'implant'
  | 'rct'
  | 'veneer'
  | 'onlay'
  | 'watch';

type SurfaceName =
  | 'mesial'
  | 'distal'
  | 'occlusal'
  | 'buccal'
  | 'lingual'
  | 'incisal';

interface ToothSurface {
  name: SurfaceName;
  status: TreatmentStatus;
  chartedBy: string;
  chartedAt: string;
  notes?: string;
}

interface ToothHistoryEntry {
  action: string;
  surface?: string;
  previousStatus: TreatmentStatus;
  newStatus: TreatmentStatus;
  chartedBy: string;
  chartedAt: string;
}

interface ToothState {
  toothNumber: number;          // 1–32
  surfaces: ToothSurface[];     // 5 surfaces per tooth
  toothLevelStatus?: TreatmentStatus; // whole-tooth conditions
  notes?: string;
  history: ToothHistoryEntry[];
  // Perio placeholders (future)
  probingDepths?: number[];     // [MB, B, DB, ML, L, DL]
  bleeding?: boolean[];
  recession?: number[];
}

interface OdontogramState {
  patientId: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  mode: 'existing' | 'planned';
  teeth: ToothState[];          // array of 32
}
```

---

## HIPAA Requirements

⚠️ HIPAA: Every change must be audit-logged — who, what, when. No deletions allowed.
⚠️ HIPAA: Role-based access:
- Dentist: full read + write
- Hygienist: read + write
- Front Desk: read-only
- Admin: full access

---

## File Structure

```
frontend\src\components\odontogram\
├── Odontogram.tsx              ← main parent component
├── UpperArch.tsx               ← teeth #1–16
├── LowerArch.tsx               ← teeth #17–32
├── Tooth.tsx                   ← single tooth SVG
├── ToothSurface.tsx            ← single clickable surface polygon
├── OdontogramToolbar.tsx       ← toolbar (mode, treatment, buttons)
├── ToothContextMenu.tsx        ← right-click menu
├── ToothDetailPanel.tsx        ← note + history side panel
├── ToothTooltip.tsx            ← hover tooltip
└── odontogram.types.ts         ← all TypeScript interfaces above

frontend\src\hooks\
└── useOdontogram.ts            ← state, undo/redo, auto-save

backend\src\odontogram\
├── odontogram.controller.ts
├── odontogram.service.ts
├── odontogram.entity.ts
└── odontogram-history.entity.ts
```

---

## API Endpoints

```
GET   /api/odontogram/:patientId                        → load full chart
POST  /api/odontogram/:patientId                        → create new chart
PATCH /api/odontogram/:patientId/tooth/:toothNumber     → update one tooth
GET   /api/odontogram/:patientId/history                → full audit log
```

---

## Build Order

Follow this exact sequence — do not skip steps:

1. odontogram.types.ts — define all interfaces first
2. OdontogramToolbar.tsx — mode toggle + treatment selector
3. ToothSurface.tsx — single clickable SVG polygon
4. Tooth.tsx — one full tooth with 5 surfaces
5. UpperArch.tsx — all 16 upper teeth
6. LowerArch.tsx — all 16 lower teeth
7. Odontogram.tsx — combine upper + lower + toolbar
8. useOdontogram.ts — state management, undo/redo, auto-save
9. ToothTooltip.tsx
10. ToothContextMenu.tsx
11. ToothDetailPanel.tsx
12. Backend files (entity → service → controller)

---

## Start Here

Begin with Step 1: odontogram.types.ts
Define all TypeScript interfaces exactly as written in the Data Model section above.

Then Step 2: Build Tooth.tsx
- One posterior tooth rendered as SVG
- 5 individually clickable surface polygons (B, M, O, D, L)
- Each surface highlights on hover
- Clicking a surface console.log() the surface name for now
- Apply color from the Color Coding table based on surface status prop
- Show tooth number label below the SVG

Show me the complete file for each step before moving to the next.
Ask me if anything about the dental anatomy or clinical workflow is unclear.
```