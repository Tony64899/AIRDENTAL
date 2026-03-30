# 🏢 Page Prompt 08 — Multi-Location Management
# 저장 경로: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\prompts\08_multi_location.md
# 사용법: MASTER_PROMPT.md 복붙 후, 이 파일 내용을 바로 아래에 추가로 복붙

---

```
Let's build Page 08: Multi-Location Management for Air Dental.

## Purpose
Allow dental groups or DSOs to manage multiple clinic locations
under one Air Dental account.

## Location Dashboard (Admin only)
- Cards for each clinic location
- Each card shows: clinic name, address, # of providers, today's appointments, production today
- "Add location" button
- "Switch location" — changes active location context for scheduler/charts

## Location Settings (per location)
- Clinic name
- Address, phone, fax, email
- NPI number (Type 2 — organizational) ⚠️ HIPAA
- Tax ID
- Operating hours (per day of week, open/closed toggle)
- Operatory list (e.g. Op 1, Op 2, Op 3)
- Provider list (which providers work at this location)
- Insurance contracts (which insurances accepted at this location)

## Provider Assignment
- Each provider (dentist, hygienist) can be assigned to one or multiple locations
- Schedule view filters by location
- A provider at multiple locations appears in correct column per location

## Patient Records — Shared vs Location-Specific
- Patient demographics: shared across all locations (one record)
- Appointment history: location-tagged
- X-rays and clinical notes: shared (accessible from any location)
- Billing: location-specific (separate NPI billing per location)

## Location Switcher (top nav bar)
- Dropdown in top nav: "Inspire Dental — Main Office ▾"
- Click → switches entire app context to selected location
- Scheduler, production numbers, provider list all update to selected location

## Reporting (per location vs combined)
- Production report: per location or all locations combined
- Provider report: per location
- Export to CSV

## Save location
Frontend: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\frontend\src\pages\Locations.tsx
Components: C:\...\frontend\src\components\locations\

Start with the Location Dashboard page and location switcher in the nav bar.
👨‍💻 BIL TASK: Review database schema for multi-tenancy (location_id on all relevant tables).
👩‍💻 SISTER TASK: Confirm Azure PostgreSQL row-level security setup for multi-location data isolation.
```
