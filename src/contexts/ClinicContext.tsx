// ClinicContext — tracks the currently active location for the entire app.
// Phase 9: Full multi-location implementation (Phase 1 was a single-location stub).
// Switching location updates the scheduler, billing, and production numbers.
// ⚠️ Multi-tenant: All service calls must include clinicId + locationId from this context.

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Location, LocationStats } from '../types/clinic';
import { MOCK_LOCATIONS, MOCK_CLINIC_NAME, MOCK_STATS_MAP } from '../constants/mockLocations';
import { getLocations, getLocationStats } from '../services/locationService';

// ── Context shape ──────────────────────────────────────────────────────────────
interface ClinicContextType {
  clinicId:           string;
  clinicName:         string;
  currentLocation:    Location;
  availableLocations: Location[];
  locationStats:      Record<string, LocationStats>;  // keyed by locationId
  switchLocation:     (locationId: string) => void;
  isLoadingLocations: boolean;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function ClinicProvider({ children }: { children: ReactNode }) {
  // Initialize with the primary location so the app is never in an undefined state.
  const primaryLocation = MOCK_LOCATIONS.find(l => l.isPrimary) ?? MOCK_LOCATIONS[0];

  const [availableLocations, setAvailableLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [currentLocation,    setCurrentLocation]    = useState<Location>(primaryLocation);
  const [locationStats,      setLocationStats]      = useState<Record<string, LocationStats>>(MOCK_STATS_MAP);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Load real locations + stats from service on mount.
  // TODO: replace with real API call when backend is available.
  useEffect(() => {
    let cancelled = false;
    setIsLoadingLocations(true);

    Promise.all([
      getLocations('clinic-1'),
      getLocationStats('clinic-1'),
    ]).then(([locs, stats]) => {
      if (cancelled) return;
      setAvailableLocations(locs);
      const statsMap = Object.fromEntries(stats.map(s => [s.locationId, s]));
      setLocationStats(statsMap);
      // Restore the current location to the freshly-loaded version
      setCurrentLocation(prev => locs.find(l => l.id === prev.id) ?? locs[0]);
    }).finally(() => {
      if (!cancelled) setIsLoadingLocations(false);
    });

    return () => { cancelled = true; };
  }, []);

  function switchLocation(locationId: string) {
    const found = availableLocations.find(l => l.id === locationId);
    if (found) setCurrentLocation(found);
  }

  return (
    <ClinicContext.Provider value={{
      clinicId: 'clinic-1',
      clinicName: MOCK_CLINIC_NAME,
      currentLocation,
      availableLocations,
      locationStats,
      switchLocation,
      isLoadingLocations,
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useClinic(): ClinicContextType {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider');
  return ctx;
}
