// odontogramService — in-memory odontogram CRUD with audit history.
// ⚠️ HIPAA: Every change is logged to ToothHistoryEntry. No hard deletes.

import type {
  OdontogramState,
  ToothState,
  ToothSurfaceData,
  ToothHistoryEntry,
  SurfaceName,
  TreatmentStatus,
} from '../types/patient';
import { getSurfaces } from '../components/odontogram/odontogram.types';

// ── In-memory store ───────────────────────────────────────────────────────────
const store = new Map<string, OdontogramState>();

// ── Initialization helpers ────────────────────────────────────────────────────

function createFreshSurface(name: SurfaceName): ToothSurfaceData {
  return { name, status: 'healthy', chartedBy: 'System', chartedAt: '2026-01-01T00:00:00Z' };
}

export function createFreshTooth(toothNumber: number): ToothState {
  const surfaces = getSurfaces(toothNumber).map(createFreshSurface);
  return { toothNumber, surfaces, history: [] };
}

function createFreshOdontogram(patientId: string): OdontogramState {
  return {
    patientId,
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: 'System',
    mode: 'existing',
    teeth: Array.from({ length: 32 }, (_, i) => createFreshTooth(i + 1)),
  };
}

// ── Seed data helpers ─────────────────────────────────────────────────────────

function applyToothLevel(
  state: OdontogramState,
  toothNumber: number,
  status: TreatmentStatus,
  chartedBy: string,
  date: string,
  cdtCodes?: string[],
): void {
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) return;
  const entry: ToothHistoryEntry = {
    action: `Set whole-tooth status to ${status}`,
    previousStatus: tooth.toothLevelStatus ?? 'healthy',
    newStatus: status,
    chartedBy,
    chartedAt: date,
  };
  tooth.toothLevelStatus = status;
  if (cdtCodes) tooth.cdtCodes = cdtCodes;
  tooth.history.push(entry);
}

function applySurfaces(
  state: OdontogramState,
  toothNumber: number,
  surfaceNames: SurfaceName[],
  status: TreatmentStatus,
  chartedBy: string,
  date: string,
  cdtCodes?: string[],
): void {
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) return;
  for (const sn of surfaceNames) {
    const surface = tooth.surfaces.find(s => s.name === sn);
    if (surface) {
      const prevStatus = surface.status;
      surface.status = status;
      surface.chartedBy = chartedBy;
      surface.chartedAt = date;
      const entry: ToothHistoryEntry = {
        action: `Applied ${status} to ${sn.charAt(0).toUpperCase() + sn.slice(1)}`,
        surface: sn,
        previousStatus: prevStatus,
        newStatus: status,
        chartedBy,
        chartedAt: date,
      };
      tooth.history.push(entry);
    }
  }
  if (cdtCodes) {
    tooth.cdtCodes = tooth.cdtCodes
      ? [...new Set([...tooth.cdtCodes, ...cdtCodes])]
      : cdtCodes;
  }
}

// ── Seed application ──────────────────────────────────────────────────────────

function seedPatient(state: OdontogramState): void {
  const pid = state.patientId;

  if (pid === 'pat-1') {
    applyToothLevel(state, 19, 'crown', 'Dr. Sarah Chen', '2023-06-15T10:00:00Z', ['D2750']);
    applyToothLevel(state, 14, 'watch', 'Dr. Sarah Chen', '2026-03-30T09:00:00Z');
    applySurfaces(state, 30, ['occlusal', 'mesial', 'distal'], 'composite', 'Dr. Sarah Chen', '2022-11-02T14:00:00Z', ['D2393']);
  }

  if (pid === 'pat-3') {
    applyToothLevel(state, 30, 'rct', 'Dr. Michael Torres', '2026-03-30T08:30:00Z', ['D3330']);
    applySurfaces(state, 2, ['occlusal', 'distal'], 'caries', 'Dr. Michael Torres', '2026-03-30T08:00:00Z');
    applyToothLevel(state, 31, 'missing', 'Dr. Sarah Chen', '2020-04-10T11:00:00Z', ['D7210']);
  }

  if (pid === 'pat-5') {
    applyToothLevel(state, 19, 'implant', 'Dr. Emily White', '2026-03-30T10:00:00Z', ['D6010']);
    applyToothLevel(state, 30, 'crown', 'Dr. Emily White', '2024-09-12T09:00:00Z', ['D2740']);
    for (const tn of [1, 16, 17]) {
      applyToothLevel(state, tn, 'missing', 'Dr. Sarah Chen', '2021-03-05T09:00:00Z', ['D7240']);
    }
  }

  if (pid === 'pat-7') {
    applyToothLevel(state, 3, 'crown', 'Dr. Sarah Chen', '2019-07-22T13:00:00Z', ['D2750']);
    applySurfaces(state, 14, ['buccal', 'occlusal'], 'composite', 'Dr. Sarah Chen', '2018-03-14T10:00:00Z', ['D2392']);
    applySurfaces(state, 18, ['occlusal', 'mesial', 'distal'], 'composite', 'Dr. Sarah Chen', '2020-09-08T11:00:00Z', ['D2393']);
    applySurfaces(state, 12, ['occlusal'], 'composite', 'Dr. Sarah Chen', '2017-05-30T09:00:00Z', ['D2391']);
  }
}

// ── Store accessor (lazy-initialize + seed) ───────────────────────────────────

function getOrCreate(patientId: string): OdontogramState {
  if (!store.has(patientId)) {
    const fresh = createFreshOdontogram(patientId);
    seedPatient(fresh);
    store.set(patientId, fresh);
  }
  return store.get(patientId)!;
}

function deepClone(state: OdontogramState): OdontogramState {
  return JSON.parse(JSON.stringify(state)) as OdontogramState;
}

function delay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 150));
}

// ── Public service API ────────────────────────────────────────────────────────

export async function getOdontogram(patientId: string): Promise<OdontogramState> {
  await delay();
  return deepClone(getOrCreate(patientId));
}

export async function updateSurface(
  patientId: string,
  toothNumber: number,
  surfaceName: SurfaceName,
  newStatus: TreatmentStatus,
  chartedBy: string,
): Promise<OdontogramState> {
  await delay();
  const state = getOrCreate(patientId);
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) throw new Error(`Tooth ${toothNumber} not found`);

  const surface = tooth.surfaces.find(s => s.name === surfaceName);
  if (!surface) throw new Error(`Surface ${surfaceName} not found on tooth ${toothNumber}`);

  const previousStatus = surface.status;
  surface.status = newStatus;
  surface.chartedBy = chartedBy;
  surface.chartedAt = new Date().toISOString();

  const entry: ToothHistoryEntry = {
    action: `Applied ${newStatus} to ${surfaceName.charAt(0).toUpperCase() + surfaceName.slice(1)}`,
    surface: surfaceName,
    previousStatus,
    newStatus,
    chartedBy,
    chartedAt: surface.chartedAt,
  };
  tooth.history.push(entry);
  state.lastUpdated = new Date().toISOString();
  state.lastUpdatedBy = chartedBy;

  store.set(patientId, state);
  return deepClone(state);
}

export async function updateToothLevel(
  patientId: string,
  toothNumber: number,
  newStatus: TreatmentStatus | undefined,
  chartedBy: string,
): Promise<OdontogramState> {
  await delay();
  const state = getOrCreate(patientId);
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) throw new Error(`Tooth ${toothNumber} not found`);

  const previousStatus = tooth.toothLevelStatus ?? 'healthy';
  tooth.toothLevelStatus = newStatus;

  const entry: ToothHistoryEntry = {
    action: newStatus
      ? `Set whole-tooth status to ${newStatus}`
      : 'Cleared whole-tooth status',
    previousStatus,
    newStatus: newStatus ?? 'healthy',
    chartedBy,
    chartedAt: new Date().toISOString(),
  };
  tooth.history.push(entry);
  state.lastUpdated = new Date().toISOString();
  state.lastUpdatedBy = chartedBy;

  store.set(patientId, state);
  return deepClone(state);
}

export async function updateToothNotes(
  patientId: string,
  toothNumber: number,
  notes: string,
): Promise<OdontogramState> {
  await delay();
  const state = getOrCreate(patientId);
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) throw new Error(`Tooth ${toothNumber} not found`);

  tooth.notes = notes;
  state.lastUpdated = new Date().toISOString();

  store.set(patientId, state);
  return deepClone(state);
}

export async function linkCDTCode(
  patientId: string,
  toothNumber: number,
  cdtCode: string,
): Promise<OdontogramState> {
  await delay();
  const state = getOrCreate(patientId);
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) throw new Error(`Tooth ${toothNumber} not found`);

  if (!tooth.cdtCodes) {
    tooth.cdtCodes = [cdtCode];
  } else if (!tooth.cdtCodes.includes(cdtCode)) {
    tooth.cdtCodes.push(cdtCode);
  }
  state.lastUpdated = new Date().toISOString();

  store.set(patientId, state);
  return deepClone(state);
}

export async function unlinkCDTCode(
  patientId: string,
  toothNumber: number,
  cdtCode: string,
): Promise<OdontogramState> {
  await delay();
  const state = getOrCreate(patientId);
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) throw new Error(`Tooth ${toothNumber} not found`);

  if (tooth.cdtCodes) {
    tooth.cdtCodes = tooth.cdtCodes.filter(c => c !== cdtCode);
  }
  state.lastUpdated = new Date().toISOString();

  store.set(patientId, state);
  return deepClone(state);
}

export async function clearTooth(
  patientId: string,
  toothNumber: number,
  chartedBy: string,
): Promise<OdontogramState> {
  await delay();
  const state = getOrCreate(patientId);
  const tooth = state.teeth[toothNumber - 1];
  if (!tooth) throw new Error(`Tooth ${toothNumber} not found`);

  const prevToothLevel = tooth.toothLevelStatus ?? 'healthy';
  const now = new Date().toISOString();

  for (const surface of tooth.surfaces) {
    const prevStatus = surface.status;
    if (prevStatus !== 'healthy') {
      const entry: ToothHistoryEntry = {
        action: `Cleared ${surface.name} surface`,
        surface: surface.name,
        previousStatus: prevStatus,
        newStatus: 'healthy',
        chartedBy,
        chartedAt: now,
      };
      tooth.history.push(entry);
    }
    surface.status = 'healthy';
    surface.chartedBy = chartedBy;
    surface.chartedAt = now;
  }

  if (tooth.toothLevelStatus) {
    const entry: ToothHistoryEntry = {
      action: 'Cleared whole-tooth status',
      previousStatus: prevToothLevel,
      newStatus: 'healthy',
      chartedBy,
      chartedAt: now,
    };
    tooth.history.push(entry);
    tooth.toothLevelStatus = undefined;
  }

  state.lastUpdated = now;
  state.lastUpdatedBy = chartedBy;

  store.set(patientId, state);
  return deepClone(state);
}

export async function saveOdontogram(
  patientId: string,
  state: OdontogramState,
): Promise<OdontogramState> {
  await delay();
  const updated: OdontogramState = {
    ...state,
    lastUpdated: new Date().toISOString(),
  };
  store.set(patientId, updated);
  return deepClone(updated);
}

export async function updateMode(
  patientId: string,
  mode: 'existing' | 'planned',
): Promise<OdontogramState> {
  await delay();
  const state = getOrCreate(patientId);
  state.mode = mode;
  state.lastUpdated = new Date().toISOString();
  store.set(patientId, state);
  return deepClone(state);
}
