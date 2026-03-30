// patientService — mock patient CRUD for Phase 4.
// All operations are in-memory (module-level array).
// ⚠️ HIPAA: Production version must use HIPAA-compliant API with full audit logging.

import type { Patient }      from '../types/patient';
import type { Appointment }  from '../types/appointment';
import { MOCK_PATIENTS }     from '../constants/mockPatients';
import { MOCK_APPOINTMENTS } from '../constants/mockData';

// Mutable in-memory store — isolated to this module
let store: Patient[] = [...MOCK_PATIENTS];

/** Simulate network latency */
const delay = () => new Promise<void>(res => setTimeout(res, 200));

// ── Queries ────────────────────────────────────────────────────────────────

/** Returns all patients for a clinic (multi-tenant: filter by clinicId) */
export async function getPatients(clinicId: string): Promise<Patient[]> {
  await delay();
  return store.filter(p => p.clinicId === clinicId);
}

/** Returns single patient — throws if not found */
export async function getPatient(id: string, clinicId: string): Promise<Patient> {
  await delay();
  const patient = store.find(p => p.id === id && p.clinicId === clinicId);
  if (!patient) throw new Error(`Patient ${id} not found`);
  return { ...patient };
}

/**
 * Search patients by name or chartNumber.
 * Case-insensitive substring match on firstName + lastName + chartNumber.
 */
export async function searchPatients(query: string, clinicId: string): Promise<Patient[]> {
  await delay();
  const q = query.toLowerCase().trim();
  return store.filter(p => {
    if (p.clinicId !== clinicId) return false;
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(q) || p.chartNumber.includes(q);
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Create new patient.
 * Assigns id ('pat-' + Date.now()) and chartNumber (zero-padded next number).
 */
export async function createPatient(
  data: Omit<Patient, 'id' | 'chartNumber'>,
  clinicId: string,
): Promise<Patient> {
  await delay();
  const clinicPatients = store.filter(p => p.clinicId === clinicId);
  const nextNum = clinicPatients.length + 1;
  const patient: Patient = {
    ...data,
    id: `pat-${Date.now()}`,
    chartNumber: String(nextNum).padStart(5, '0'),
    clinicId,
  };
  store = [...store, patient];
  return { ...patient };
}

/** Update patient fields — returns the updated patient */
export async function updatePatient(
  id: string,
  updates: Partial<Patient>,
  clinicId: string,
): Promise<Patient> {
  await delay();
  const idx = store.findIndex(p => p.id === id && p.clinicId === clinicId);
  if (idx === -1) throw new Error(`Patient ${id} not found`);
  const updated: Patient = { ...store[idx], ...updates, id, clinicId };
  store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
  return { ...updated };
}

/** Get all appointments for a patient */
export async function getPatientAppointments(
  patientId: string,
  clinicId: string,
): Promise<Appointment[]> {
  await delay();
  return MOCK_APPOINTMENTS.filter(
    a => a.patientId === patientId && a.clinicId === clinicId,
  );
}
