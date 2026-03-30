# Page Prompt 06 — X-ray Upload & Viewer
# 저장 경로: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\prompts\06_xray_viewer.md
# 사용법: MASTER_PROMPT.md 복붙 후 이 내용을 아래에 이어 붙여넣으세요.

---

```
Now let's build Page 06: X-ray Upload & Viewer for Air Dental.

## Goal
Allow dentists to upload, view, and annotate dental X-rays linked to patient charts.

## X-ray Types (dental context)
- PA (Periapical) — single tooth X-ray
- BW (Bitewing) — shows upper and lower teeth together
- Pano (Panoramic) — full mouth overview
- CBCT — 3D scan (future feature, not MVP)

## Features
1. Upload X-ray images (JPEG, PNG, DICOM support)
2. Viewer with tools:
   - Zoom in / Zoom out
   - Brightness adjustment (slider)
   - Contrast adjustment (slider)
   - Invert colors (toggle) — common in dental X-ray reading
   - Rotate image
   - Measurement tool (draw line to measure in mm)
3. Link X-ray to specific tooth number (#1–32)
4. Side-by-side comparison (current vs previous X-ray)
5. Auto-tagged with: date, provider name, tooth number

## Requirements
- ⚠️ HIPAA: All X-rays stored encrypted in Azure Blob Storage
- ⚠️ HIPAA: Every view/download is audit-logged
- 👩‍💻 SISTER: Azure Blob Storage container setup with encryption at rest
- Images never stored locally — always served from Azure
- Thumbnail gallery showing all X-rays for a patient
- Sort by date, tooth number, or type

## File paths to create
frontend\src\pages\XrayPage.tsx
frontend\src\components\xray\XrayUploader.tsx
frontend\src\components\xray\XrayViewer.tsx
frontend\src\components\xray\XrayToolbar.tsx
frontend\src\components\xray\XrayGallery.tsx
frontend\src\components\xray\XrayComparison.tsx
frontend\src\hooks\useXray.ts
backend\src\xray\xray.controller.ts
backend\src\xray\xray.service.ts
backend\src\xray\xray.entity.ts

## Start here
Build XrayViewer.tsx first with zoom, brightness, contrast, and invert controls.
Then XrayUploader.tsx with drag-and-drop file upload.
```
