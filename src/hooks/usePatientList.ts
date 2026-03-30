// usePatientList — paginated+filtered patient list with debounced search.
// ⚠️ HIPAA: Results are in-memory only. No caching in localStorage.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Patient }     from '../types/patient';
import type { LoadingState } from '../types/common';
import { getPatients, searchPatients } from '../services/patientService';

// Phase 9 will use ClinicContext — hardcoded for now
const CLINIC_ID = 'clinic-1';

interface UsePatientListResult {
  patients:        Patient[];
  loadState:       LoadingState;
  error:           string | null;
  searchQuery:     string;
  setSearchQuery:  (q: string) => void;
  refresh:         () => void;
}

export function usePatientList(): UsePatientListResult {
  const [patients,    setPatients]    = useState<Patient[]>([]);
  const [loadState,   setLoadState]   = useState<LoadingState>('idle');
  const [error,       setError]       = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(async () => {
    setLoadState('loading');
    setError(null);
    try {
      const data = await getPatients(CLINIC_ID);
      setPatients(data);
      setLoadState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
      setLoadState('error');
    }
  }, []);

  // Initial load
  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length < 2) {
      // If query was cleared, reload all
      if (searchQuery.length === 0) {
        void loadAll();
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadState('loading');
      setError(null);
      try {
        const data = await searchPatients(searchQuery, CLINIC_ID);
        setPatients(data);
        setLoadState('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setLoadState('error');
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, loadAll]);

  return {
    patients,
    loadState,
    error,
    searchQuery,
    setSearchQuery,
    refresh: loadAll,
  };
}
