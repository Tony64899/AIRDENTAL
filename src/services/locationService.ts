// locationService — CRUD for clinic locations and provider assignments.
// All functions are async to match the real API shape.
// TODO: connect to backend API (NestJS /locations endpoints) — replace in-memory store.
// ⚠️ HIPAA: NPI and Tax ID must never appear in server logs or URL paths.

import type { Location, LocationStats, InsuranceContract, Operatory } from '../types/clinic';
import type { Provider } from '../types/provider';
import {
  MOCK_LOCATIONS,
  MOCK_LOCATION_STATS,
  MOCK_STATS_MAP,
} from '../constants/mockLocations';
import { MOCK_PROVIDERS } from '../constants/mockData';

// ── In-memory store ────────────────────────────────────────────────────────────
// Deep-clone on init so mutations don't affect the constants.
let _locations: Location[]     = MOCK_LOCATIONS.map(l => ({ ...l, operatories: [...l.operatories], businessHours: [...l.businessHours], insuranceContracts: [...l.insuranceContracts], providerIds: [...l.providerIds] }));
let _providers: Provider[]     = MOCK_PROVIDERS.map(p => ({ ...p, locationIds: [...p.locationIds] }));
let _stats:     LocationStats[] = [...MOCK_LOCATION_STATS];

const delay = (ms = 200) => new Promise<void>(r => setTimeout(r, ms));

// ── Location CRUD ─────────────────────────────────────────────────────────────

export async function getLocations(clinicId: string): Promise<Location[]> {
  await delay();
  return _locations.filter(l => l.clinicId === clinicId);
}

export async function getLocation(locationId: string): Promise<Location | null> {
  await delay();
  return _locations.find(l => l.id === locationId) ?? null;
}

export async function createLocation(
  data: Omit<Location, 'id' | 'operatories' | 'businessHours' | 'insuranceContracts' | 'providerIds'>
): Promise<Location> {
  await delay();
  const newLoc: Location = {
    ...data,
    id: `loc-${Date.now()}`,
    operatories: [],
    businessHours: [
      { dayOfWeek: 0, openTime: '09:00', closeTime: '14:00', isClosed: true  },
      { dayOfWeek: 1, openTime: '08:00', closeTime: '17:00', isClosed: false },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '17:00', isClosed: false },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '17:00', isClosed: false },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '17:00', isClosed: false },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '17:00', isClosed: false },
      { dayOfWeek: 6, openTime: '09:00', closeTime: '14:00', isClosed: true  },
    ],
    insuranceContracts: [],
    providerIds: [],
  };
  _locations = [..._locations, newLoc];
  _stats = [..._stats, { locationId: newLoc.id, todayAppointments: 0, todayProduction: 0, providerCount: 0, operatoryCount: 0 }];
  return newLoc;
}

export async function updateLocation(
  locationId: string,
  patch: Partial<Location>
): Promise<Location> {
  await delay();
  _locations = _locations.map(l =>
    l.id === locationId ? { ...l, ...patch } : l
  );
  return _locations.find(l => l.id === locationId)!;
}

export async function deleteLocation(locationId: string): Promise<void> {
  await delay();
  _locations = _locations.filter(l => l.id !== locationId);
}

// ── Operatory CRUD ────────────────────────────────────────────────────────────

export async function addOperatory(locationId: string, name: string): Promise<Operatory> {
  await delay();
  const op: Operatory = { id: `op-${Date.now()}`, name, locationId, isActive: true };
  _locations = _locations.map(l =>
    l.id === locationId ? { ...l, operatories: [...l.operatories, op] } : l
  );
  return op;
}

export async function updateOperatory(
  locationId: string,
  operatoryId: string,
  patch: Partial<Pick<Operatory, 'name' | 'isActive'>>
): Promise<void> {
  await delay();
  _locations = _locations.map(l => {
    if (l.id !== locationId) return l;
    return {
      ...l,
      operatories: l.operatories.map(op =>
        op.id === operatoryId ? { ...op, ...patch } : op
      ),
    };
  });
}

export async function deleteOperatory(locationId: string, operatoryId: string): Promise<void> {
  await delay();
  _locations = _locations.map(l => {
    if (l.id !== locationId) return l;
    return { ...l, operatories: l.operatories.filter(op => op.id !== operatoryId) };
  });
}

// ── Insurance contracts ───────────────────────────────────────────────────────

export async function addInsuranceContract(
  locationId: string,
  contract: Omit<InsuranceContract, 'id'>
): Promise<InsuranceContract> {
  await delay();
  const newContract: InsuranceContract = { ...contract, id: `ic-${Date.now()}` };
  _locations = _locations.map(l =>
    l.id === locationId
      ? { ...l, insuranceContracts: [...l.insuranceContracts, newContract] }
      : l
  );
  return newContract;
}

export async function removeInsuranceContract(
  locationId: string,
  contractId: string
): Promise<void> {
  await delay();
  _locations = _locations.map(l => {
    if (l.id !== locationId) return l;
    return { ...l, insuranceContracts: l.insuranceContracts.filter(c => c.id !== contractId) };
  });
}

// ── Provider assignment ───────────────────────────────────────────────────────

export async function getProviders(clinicId: string): Promise<Provider[]> {
  await delay();
  return _providers.filter(p => p.clinicId === clinicId);
}

export async function assignProviderToLocation(
  providerId: string,
  locationId: string
): Promise<void> {
  await delay();
  _providers = _providers.map(p => {
    if (p.id !== providerId) return p;
    if (p.locationIds.includes(locationId)) return p;
    return { ...p, locationIds: [...p.locationIds, locationId] };
  });
  _locations = _locations.map(l => {
    if (l.id !== locationId) return l;
    if (l.providerIds.includes(providerId)) return l;
    return { ...l, providerIds: [...l.providerIds, providerId] };
  });
}

export async function removeProviderFromLocation(
  providerId: string,
  locationId: string
): Promise<void> {
  await delay();
  _providers = _providers.map(p => {
    if (p.id !== providerId) return p;
    return { ...p, locationIds: p.locationIds.filter(id => id !== locationId) };
  });
  _locations = _locations.map(l => {
    if (l.id !== locationId) return l;
    return { ...l, providerIds: l.providerIds.filter(id => id !== providerId) };
  });
}

// ── Location stats ────────────────────────────────────────────────────────────

export async function getLocationStats(clinicId: string): Promise<LocationStats[]> {
  await delay();
  // In production: computed from appointments and billing records for today
  // TODO: connect to backend analytics endpoint /clinics/:clinicId/location-stats?date=today
  const locationIds = new Set(_locations.filter(l => l.clinicId === clinicId).map(l => l.id));
  return _stats.filter(s => locationIds.has(s.locationId));
}

export async function getLocationStatById(locationId: string): Promise<LocationStats | null> {
  await delay();
  return MOCK_STATS_MAP[locationId] ?? null;
}
