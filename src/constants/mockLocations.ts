// Mock location data — 3 physical offices under one Inspire Dental account.
// Phase 9: Multi-location management.
// ⚠️ HIPAA: NPI / Tax ID values below are fictional. Never use real identifiers in mock data.

import type { Location, LocationStats, InsuranceContract, BusinessHours } from '../types/clinic';

// ── Shared insurance contracts ────────────────────────────────────────────────
const IC_DELTA: InsuranceContract = {
  id: 'ic-1', carrier: 'Delta Dental', planType: 'PPO',
  contractId: 'DD-SF-20230101', effectiveDate: '2023-01-01', isActive: true,
};
const IC_CIGNA: InsuranceContract = {
  id: 'ic-2', carrier: 'Cigna Dental', planType: 'PPO',
  contractId: 'CG-SF-20230601', effectiveDate: '2023-06-01', isActive: true,
};
const IC_AETNA: InsuranceContract = {
  id: 'ic-3', carrier: 'Aetna', planType: 'PPO',
  effectiveDate: '2022-01-01', isActive: true,
};
const IC_METLIFE: InsuranceContract = {
  id: 'ic-4', carrier: 'MetLife', planType: 'PPO',
  effectiveDate: '2022-01-01', isActive: true,
};
const IC_MEDICAL: InsuranceContract = {
  id: 'ic-5', carrier: 'Denti-Cal (Medi-Cal)', planType: 'Medicaid',
  effectiveDate: '2023-01-01', isActive: true,
};

// ── Business hours helper ─────────────────────────────────────────────────────
function makeHours(
  options: Partial<{ monFriOpen: string; monFriClose: string; satOpen: string; satClose: string; satClosed: boolean; sunClosed: boolean }>
): BusinessHours[] {
  const {
    monFriOpen  = '08:00',
    monFriClose = '17:00',
    satOpen     = '09:00',
    satClose    = '14:00',
    satClosed   = true,
    sunClosed   = true,
  } = options;

  return [
    { dayOfWeek: 0, openTime: '09:00', closeTime: '14:00', isClosed: sunClosed },
    { dayOfWeek: 1, openTime: monFriOpen, closeTime: monFriClose, isClosed: false },
    { dayOfWeek: 2, openTime: monFriOpen, closeTime: monFriClose, isClosed: false },
    { dayOfWeek: 3, openTime: monFriOpen, closeTime: monFriClose, isClosed: false },
    { dayOfWeek: 4, openTime: monFriOpen, closeTime: monFriClose, isClosed: false },
    { dayOfWeek: 5, openTime: monFriOpen, closeTime: monFriClose, isClosed: false },
    { dayOfWeek: 6, openTime: satOpen,    closeTime: satClose,    isClosed: satClosed },
  ];
}

// ── Mock locations ────────────────────────────────────────────────────────────
export const MOCK_LOCATIONS: Location[] = [
  // ── loc-1: Main Office ────────────────────────────────────────────────────
  {
    id: 'loc-1',
    clinicId: 'clinic-1',
    name: 'Main Office',
    address: '123 Dental Way',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    phone: '4155550100',
    fax:   '4155550101',
    email: 'main@inspiredelta.com',
    npi:   '1234567890',
    taxId: '12-3456789',
    timezone: 'America/Los_Angeles',
    operatories: [
      { id: 'op-1-1', name: 'Op 1', locationId: 'loc-1', isActive: true  },
      { id: 'op-1-2', name: 'Op 2', locationId: 'loc-1', isActive: true  },
      { id: 'op-1-3', name: 'Op 3', locationId: 'loc-1', isActive: true  },
      { id: 'op-1-4', name: 'Op 4', locationId: 'loc-1', isActive: false },
    ],
    businessHours: makeHours({}),
    insuranceContracts: [IC_DELTA, IC_CIGNA, IC_AETNA, IC_METLIFE],
    providerIds: ['prov-1', 'prov-2', 'prov-3'],
    isActive: true,
    isPrimary: true,
  },

  // ── loc-2: Downtown Office ────────────────────────────────────────────────
  {
    id: 'loc-2',
    clinicId: 'clinic-1',
    name: 'Downtown Office',
    address: '456 Market Street, Suite 800',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    phone: '4155550200',
    fax:   '4155550201',
    email: 'downtown@inspiredelta.com',
    npi:   '1234567891',
    taxId: '12-3456790',
    timezone: 'America/Los_Angeles',
    operatories: [
      { id: 'op-2-1', name: 'Op 1', locationId: 'loc-2', isActive: true },
      { id: 'op-2-2', name: 'Op 2', locationId: 'loc-2', isActive: true },
      { id: 'op-2-3', name: 'Op 3', locationId: 'loc-2', isActive: true },
    ],
    businessHours: makeHours({ monFriOpen: '07:00', monFriClose: '18:00', satClosed: false }),
    insuranceContracts: [IC_DELTA, IC_METLIFE, IC_MEDICAL],
    providerIds: ['prov-1', 'prov-4', 'prov-5'],
    isActive: true,
    isPrimary: false,
  },

  // ── loc-3: Westside Office ────────────────────────────────────────────────
  {
    id: 'loc-3',
    clinicId: 'clinic-1',
    name: 'Westside Office',
    address: '789 Ocean Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94112',
    phone: '4155550300',
    fax:   undefined,
    email: 'westside@inspiredelta.com',
    npi:   '1234567892',
    taxId: '12-3456791',
    timezone: 'America/Los_Angeles',
    operatories: [
      { id: 'op-3-1', name: 'Op 1', locationId: 'loc-3', isActive: true },
      { id: 'op-3-2', name: 'Op 2', locationId: 'loc-3', isActive: true },
    ],
    businessHours: makeHours({ monFriOpen: '09:00', monFriClose: '17:00', satClosed: true }),
    insuranceContracts: [IC_DELTA, IC_CIGNA, IC_MEDICAL],
    providerIds: ['prov-2', 'prov-6'],
    isActive: true,
    isPrimary: false,
  },
];

export const MOCK_LOCATIONS_MAP: Record<string, Location> =
  Object.fromEntries(MOCK_LOCATIONS.map(l => [l.id, l]));

// ── Dashboard stats (mocked — would come from analytics service in production) ─
export const MOCK_LOCATION_STATS: LocationStats[] = [
  { locationId: 'loc-1', todayAppointments: 18, todayProduction: 387500, providerCount: 3, operatoryCount: 3 },
  { locationId: 'loc-2', todayAppointments: 12, todayProduction: 241000, providerCount: 3, operatoryCount: 3 },
  { locationId: 'loc-3', todayAppointments:  7, todayProduction: 128500, providerCount: 2, operatoryCount: 2 },
];

export const MOCK_STATS_MAP: Record<string, LocationStats> =
  Object.fromEntries(MOCK_LOCATION_STATS.map(s => [s.locationId, s]));

export const MOCK_CLINIC_NAME = 'Inspire Dental';
