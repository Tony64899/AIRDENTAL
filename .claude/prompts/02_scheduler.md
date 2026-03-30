# Page Prompt 02 — Appointment Scheduler
# 저장 경로: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\prompts\02_scheduler.md
# 사용법: MASTER_PROMPT.md 복붙 후 이 내용을 아래에 이어 붙여넣으세요.

---

```
Now let's build Page 02: Appointment Scheduler for Air Dental.

## Reference Design
- See designs\screenshots\curve_dental_scheduler.png for visual reference
- See designs\design_docs\scheduler_design_doc.txt for detailed spec

## Layout
- Left 20%: Patient info panel (top) + Mini calendar (bottom)
- Right 80%: Main calendar grid

## Main Calendar Grid
- Vertical axis: time (default 7am–8pm, 14 hours, 56 cells)
- Each cell = 15 minutes
- Hour boundaries: thicker border (1.5px) for visual clarity
- Horizontal axis: one column per provider/operatory

## Gear button — vertical axis (top-left of time column)
- Click → dropdown with "Preset Time Frame"
- Preset Time Frame popup:
  - Start time: [number input] [AM/PM dropdown]
  - End time: [number input] [AM/PM dropdown]
  - Numbers limited to 1–12
  - "Enter" button + keyboard Enter key to confirm
  - Rebuilds entire grid on confirm

## Gear button — column headers (each provider column)
- Click → dropdown with:
  - "Rename Provider" → inline edit, Enter to confirm
  - "Rename Operatory" → inline edit, Enter to confirm

## Appointment blocks
- Color coding:
  - Blue (#B5D4F4) = Confirmed
  - Green (#C0DD97) = Completed
  - Amber (#FAC775) = New patient
  - Red (#F09595) = Emergency / Urgent
  - Gray (#D3D1C7) = Cancelled / Unconfirmed
- Each block shows: time range, patient name, procedure
- Click block → updates patient panel on left sidebar

## Drag to book
- Drag across empty cells → opens "New Appointment" modal
- Modal fields: Patient search, Procedure, Appointment type, Notes

## Multi-location
- Location switcher in top toolbar
- Each location has its own set of providers/columns

## File paths to create
frontend\src\pages\SchedulerPage.tsx
frontend\src\components\scheduler\CalendarGrid.tsx
frontend\src\components\scheduler\AppointmentBlock.tsx
frontend\src\components\scheduler\NewAppointmentModal.tsx
frontend\src\components\scheduler\TimeGutter.tsx
frontend\src\components\scheduler\ColumnHeader.tsx
frontend\src\components\scheduler\PatientPanel.tsx
frontend\src\components\scheduler\MiniCalendar.tsx
frontend\src\hooks\useScheduler.ts
backend\src\appointments\appointments.controller.ts
backend\src\appointments\appointments.service.ts
backend\src\appointments\appointments.entity.ts

## Start here
Build SchedulerPage.tsx and CalendarGrid.tsx first.
Use the HTML prototype from designs\ as the visual reference.
```
