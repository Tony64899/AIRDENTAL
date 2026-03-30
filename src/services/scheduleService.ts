// scheduleService — CRUD operations for appointments and providers.
// Mock mode: all data is in-memory, no network calls.
// TODO (backend phase): replace IS_MOCK branches with real NestJS endpoints.
// ⚠️ HIPAA: never log appointment data; all IDs are opaque strings.

import { apiFetch, IS_MOCK } from './api';
import type { Appointment } from '../types/appointment';
import type { Provider }    from '../types/provider';
import { MOCK_APPOINTMENTS, MOCK_PROVIDERS } from '../constants/mockData';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export interface ScheduleData {
  appointments: Appointment[];
  providers:    Provider[];
}

// --- Read ---

export async function getSchedule(_date?: string): Promise<ScheduleData> {
  if (IS_MOCK) {
    await delay(300);
    // Return copies so callers can mutate without dirtying the constant
    return {
      appointments: MOCK_APPOINTMENTS.map(a => ({ ...a })),
      providers:    MOCK_PROVIDERS.map(p => ({ ...p })),
    };
  }
  return apiFetch<ScheduleData>('/schedule');
}

// --- Create ---

export async function createAppointment(
  data: Omit<Appointment, 'id'>,
): Promise<Appointment> {
  if (IS_MOCK) {
    await delay(200);
    return { ...data, id: `apt-${Date.now()}` };
  }
  return apiFetch<Appointment>('/appointments', {
    method: 'POST',
    body:   JSON.stringify(data),
  });
}

// --- Update ---

export async function updateAppointment(
  id:      string,
  updates: Partial<Appointment>,
): Promise<void> {
  if (IS_MOCK) {
    await delay(150);
    return;
  }
  return apiFetch<void>(`/appointments/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify(updates),
  });
}

// --- Delete ---

export async function deleteAppointment(id: string): Promise<void> {
  if (IS_MOCK) {
    await delay(150);
    return;
  }
  return apiFetch<void>(`/appointments/${id}`, { method: 'DELETE' });
}

// --- Provider rename (local-only until multi-location backend) ---

export async function updateProvider(
  id:      string,
  updates: Partial<Provider>,
): Promise<void> {
  if (IS_MOCK) {
    await delay(100);
    return;
  }
  return apiFetch<void>(`/providers/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify(updates),
  });
}
