// usePatient — loads a single patient record by ID.
// ⚠️ HIPAA: PHI in memory only — never serialized to localStorage.

import { useState, useEffect, useCallback } from 'react';
import type { Patient }     from '../types/patient';
import type { LoadingState } from '../types/common';
import {
  getPatient,
  updatePatient as updatePatientService,
} from '../services/patientService';

// Phase 9 will use ClinicContext
const CLINIC_ID = 'clinic-1';

interface UsePatientResult {
  patient:       Patient | null;
  loadState:     LoadingState;
  error:         string | null;
  updatePatient: (updates: Partial<Patient>) => Promise<void>;
  refresh:       () => void;
}

export function usePatient(patientId: string | undefined): UsePatientResult {
  const [patient,   setPatient]   = useState<Patient | null>(null);
  const [loadState, setLoadState] = useState<LoadingState>('idle');
  const [error,     setError]     = useState<string | null>(null);

  const fetchPatient = useCallback(async (id: string) => {
    setLoadState('loading');
    setError(null);
    try {
      const data = await getPatient(id, CLINIC_ID);
      setPatient(data);
      setLoadState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient');
      setLoadState('error');
      setPatient(null);
    }
  }, []);

  useEffect(() => {
    if (!patientId) {
      setPatient(null);
      setLoadState('idle');
      setError(null);
      return;
    }
    void fetchPatient(patientId);
  }, [patientId, fetchPatient]);

  const updatePatient = useCallback(async (updates: Partial<Patient>) => {
    if (!patient) return;
    await updatePatientService(patient.id, updates, CLINIC_ID);
    await fetchPatient(patient.id);
  }, [patient, fetchPatient]);

  const refresh = useCallback(() => {
    if (patientId) void fetchPatient(patientId);
  }, [patientId, fetchPatient]);

  return { patient, loadState, error, updatePatient, refresh };
}
