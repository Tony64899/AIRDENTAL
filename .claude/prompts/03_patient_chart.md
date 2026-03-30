# Page Prompt 03 — Patient Chart
# 저장 경로: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\prompts\03_patient_chart.md
# 사용법: MASTER_PROMPT.md 복붙 후 이 내용을 아래에 이어 붙여넣으세요.

---

```
Now let's build Page 03: Patient Chart for Air Dental.

## Goal
A complete patient profile and clinical record page.

## Sections to build (tabs)
1. Demographics — name, DOB, address, phone, email, SSN (encrypted)
2. Medical History — allergies, medications, conditions, last physical
3. Dental History — previous dentist, reason for visit, chief complaint
4. Treatment Notes — SOAP format (Subjective, Objective, Assessment, Plan)
5. Appointment History — list of past and upcoming appointments
6. Documents — uploaded consent forms, X-rays (link to xray viewer)

## Requirements
- ⚠️ HIPAA: SSN and DOB must be masked by default (show last 4 only), click to reveal
- ⚠️ HIPAA: Every field edit is audit-logged (who changed what, when)
- ⚠️ HIPAA: Role-based field visibility (Front Desk cannot see clinical notes)
- Patient search bar (by name, DOB, or chart number)
- "New Patient" button to create a new chart
- Profile photo upload (optional)
- Insurance info tab (carrier, group #, member ID)
- Emergency contact fields

## Design
- Left sidebar: patient photo + key stats (DOB, insurance, last visit)
- Right main area: tabbed content
- Clean, professional — similar to Epic or modern EHR

## File paths to create
frontend\src\pages\PatientChartPage.tsx
frontend\src\components\patients\PatientHeader.tsx
frontend\src\components\patients\PatientTabs.tsx
frontend\src\components\patients\DemographicsTab.tsx
frontend\src\components\patients\MedicalHistoryTab.tsx
frontend\src\components\patients\TreatmentNotesTab.tsx
frontend\src\components\patients\AppointmentHistoryTab.tsx
frontend\src\hooks\usePatient.ts
backend\src\patients\patients.controller.ts
backend\src\patients\patients.service.ts
backend\src\patients\patients.entity.ts

## Start here
Build PatientChartPage.tsx and PatientHeader.tsx first.
```
