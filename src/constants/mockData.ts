// Shared mock data factory — single source for all fake data used in development.
// Using obviously fake names and IDs to avoid any confusion with real PHI.
// ⚠️ HIPAA: All names here are fictional. Never use real patient data in mock constants.

import type { Appointment } from '../types/appointment';
import type { Provider }    from '../types/provider';

// ── Providers ──────────────────────────────────────────────────────────────
// color field removed in Phase 3 — appointment blocks now use procedure-category colors.
// Phase 9: locationIds[] added for multi-location support.
// prov-1 (Chen) works Main + Downtown; prov-2 (Torres) works Main + Westside.
// prov-5 and prov-6 are Downtown-only and Westside-only providers added in Phase 9.
export const MOCK_PROVIDERS: Provider[] = [
  { id: 'prov-1', name: 'Dr. Sarah Chen',      operatory: 'Operatory 1', specialty: 'General Dentistry', clinicId: 'clinic-1', locationId: 'loc-1', locationIds: ['loc-1', 'loc-2'] },
  { id: 'prov-2', name: 'Dr. Michael Torres',  operatory: 'Operatory 2', specialty: 'Endodontics',        clinicId: 'clinic-1', locationId: 'loc-1', locationIds: ['loc-1', 'loc-3'] },
  { id: 'prov-3', name: 'Dr. Emily White',     operatory: 'Operatory 3', specialty: 'General Dentistry', clinicId: 'clinic-1', locationId: 'loc-1', locationIds: ['loc-1']         },
  { id: 'prov-4', name: 'Dr. James Park',      operatory: 'Operatory 4', specialty: 'Orthodontics',      clinicId: 'clinic-1', locationId: 'loc-2', locationIds: ['loc-2']         },
  { id: 'prov-5', name: 'Dr. Priya Patel',     operatory: 'Operatory 1', specialty: 'General Dentistry', clinicId: 'clinic-1', locationId: 'loc-2', locationIds: ['loc-2']         },
  { id: 'prov-6', name: 'Dr. Carlos Rivera',   operatory: 'Operatory 1', specialty: 'General Dentistry', clinicId: 'clinic-1', locationId: 'loc-3', locationIds: ['loc-3']         },
];

// ── Appointments ───────────────────────────────────────────────────────────
// Dates set relative to 2026-03-30 (today per system context).
// apt-1 through apt-7 are on today so the grid is populated on first load.
// apt-8 (yesterday) and apt-9 (tomorrow) verify date-filtering works.
export const MOCK_APPOINTMENTS: Appointment[] = [
  // ── Today: 2026-03-30 ────────────────────────────────────────────────────
  { id: 'apt-1', date: '2026-03-30', patientName: 'John Smith',     procedure: 'Crown Preparation',       procedureCategory: 'prosthodontic', providerId: 'prov-1', startTime: '09:00', endTime: '10:30', status: 'confirmed', notes: 'Patient prefers local anesthesia', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-1' },
  { id: 'apt-2', date: '2026-03-30', patientName: 'Emma Johnson',   procedure: 'Routine Cleaning',         procedureCategory: 'preventive',    providerId: 'prov-1', startTime: '11:00', endTime: '12:00', status: 'scheduled', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-2' },
  { id: 'apt-3', date: '2026-03-30', patientName: 'Michael Brown',  procedure: 'Root Canal',               procedureCategory: 'endodontic',    providerId: 'prov-2', startTime: '08:00', endTime: '09:30', status: 'arrived',   notes: 'Follow-up appointment', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-3' },
  { id: 'apt-4', date: '2026-03-30', patientName: 'Sophia Davis',   procedure: 'Teeth Whitening',          procedureCategory: 'cosmetic',      providerId: 'prov-2', startTime: '14:00', endTime: '15:00', status: 'scheduled', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-4' },
  { id: 'apt-5', date: '2026-03-30', patientName: 'Oliver Wilson',  procedure: 'Dental Implant',           procedureCategory: 'implant',       providerId: 'prov-3', startTime: '10:00', endTime: '12:00', status: 'confirmed', notes: 'Surgical procedure - requires assistant', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-5' },
  { id: 'apt-6', date: '2026-03-30', patientName: 'Ava Martinez',   procedure: 'Orthodontic Consultation', procedureCategory: 'orthodontic',   providerId: 'prov-4', startTime: '13:00', endTime: '13:45', status: 'scheduled', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-6' },
  { id: 'apt-7', date: '2026-03-30', patientName: 'William Garcia', procedure: 'Composite Filling',        procedureCategory: 'restorative',   providerId: 'prov-3', startTime: '15:30', endTime: '16:30', status: 'scheduled', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-7' },
  // ── Yesterday: 2026-03-29 ── should NOT appear when viewing 3/30 ────────
  { id: 'apt-8', date: '2026-03-29', patientName: 'Liam Thompson',  procedure: 'Periodic Exam',            procedureCategory: 'preventive',    providerId: 'prov-1', startTime: '10:00', endTime: '10:45', status: 'completed', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-8' },
  // ── Tomorrow: 2026-03-31 ── should NOT appear when viewing 3/30 ─────────
  { id: 'apt-9', date: '2026-03-31', patientName: 'Mia Anderson',   procedure: 'Scaling & Root Planing',   procedureCategory: 'periodontic',   providerId: 'prov-2', startTime: '09:00', endTime: '10:00', status: 'scheduled', clinicId: 'clinic-1', locationId: 'loc-1', patientId: 'pat-9' },
];

// ── Mock Patient Info ───────────────────────────────────────────────────────
// Shown in the sidebar when an appointment is single-clicked.
// All data is fictional. Phase 4 will replace with real patient chart lookups.
// ⚠️ HIPAA: In production, this data must only be fetched server-side with audit logging.

export type BillingStatus = 'billing_alert' | 'balance_remaining' | 'all_paid';
export type BiologicalSex = 'male' | 'female';

export interface PatientInfo {
  dob: string;                  // ISO YYYY-MM-DD
  gender: BiologicalSex;
  phone: string;                // E.164-style US number: "+1 (617) 645-0000"
  allergies: string[];
  medicalConditions: string[];
  billingStatus: BillingStatus;
  balance?: number;             // outstanding balance in USD cents (positive = owed, negative = credit)
}

export const MOCK_PATIENT_INFO: Record<string, PatientInfo> = {
  'pat-1': { dob: '1985-04-12', gender: 'male',   phone: '+1 (617) 423-8801', allergies: ['Penicillin'],          medicalConditions: ['Hypertension'],              billingStatus: 'billing_alert',    balance: 42500 },
  'pat-2': { dob: '1990-08-23', gender: 'female', phone: '+1 (781) 554-2247', allergies: [],                      medicalConditions: [],                            billingStatus: 'all_paid',         balance: 0 },
  'pat-3': { dob: '1978-11-05', gender: 'male',   phone: '+1 (508) 319-6630', allergies: ['Aspirin', 'Latex'],    medicalConditions: ['Diabetes Type 2'],           billingStatus: 'balance_remaining', balance: 12000 },
  'pat-4': { dob: '1995-02-17', gender: 'female', phone: '+1 (617) 887-4412', allergies: [],                      medicalConditions: ['Anxiety'],                   billingStatus: 'all_paid',         balance: 0 },
  'pat-5': { dob: '1982-07-30', gender: 'male',   phone: '+1 (339) 204-7758', allergies: ['Amoxicillin'],         medicalConditions: ['Blood thinners (Warfarin)'], billingStatus: 'billing_alert',    balance: 78000 },
  'pat-6': { dob: '2008-12-01', gender: 'female', phone: '+1 (617) 645-0933', allergies: [],                      medicalConditions: [],                            billingStatus: 'all_paid',         balance: 0 },
  'pat-7': { dob: '1970-03-22', gender: 'male',   phone: '+1 (781) 762-5521', allergies: ['Codeine'],             medicalConditions: ['Thyroid disorder'],          billingStatus: 'balance_remaining', balance: 5500 },
  'pat-8': { dob: '1999-06-14', gender: 'male',   phone: '+1 (857) 341-9004', allergies: [],                      medicalConditions: [],                            billingStatus: 'all_paid',         balance: 0 },
  'pat-9': { dob: '1988-09-08', gender: 'female', phone: '+1 (617) 290-8816', allergies: ['Sulfa'],               medicalConditions: ['Asthma'],                    billingStatus: 'balance_remaining', balance: 9000 },
};
