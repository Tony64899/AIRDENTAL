// useSchedule — React hook wrapping scheduleService.
// Manages local appointment + provider state with optimistic CRUD.
// Phase 3: all operations are mock. Phase 5+ will hit real API.

import { useState, useCallback, useEffect } from 'react';
import * as scheduleService from '../services/scheduleService';
import type { Appointment }  from '../types/appointment';
import type { Provider }     from '../types/provider';
import type { LoadingState } from '../types/common';

interface UseScheduleReturn {
  appointments:      Appointment[];
  providers:         Provider[];
  loadState:         LoadingState;
  error:             string | null;
  addAppointment:    (data: Omit<Appointment, 'id'>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  updateProvider:    (id: string, updates: Partial<Provider>) => void;
  addProvider:       (provider: Provider) => void;
  reorderProvider:   (id: string, direction: 'left' | 'right') => void;
  refresh:           () => void;
}

export function useSchedule(date?: Date): UseScheduleReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers,    setProviders]    = useState<Provider[]>([]);
  const [loadState,    setLoadState]    = useState<LoadingState>('idle');
  const [error,        setError]        = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoadState('loading');
    setError(null);
    try {
      const data = await scheduleService.getSchedule(
        date?.toISOString().split('T')[0],
      );
      setAppointments(data.appointments);
      setProviders(data.providers);
      setLoadState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule.');
      setLoadState('error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally stable — date changes handled via refresh()

  useEffect(() => { fetch(); }, [fetch]);

  // Create — optimistic: add to local list immediately after service confirms
  const addAppointment = useCallback(async (data: Omit<Appointment, 'id'>) => {
    const created = await scheduleService.createAppointment(data);
    setAppointments(prev => [...prev, created]);
    return created;
  }, []);

  // Update — optimistic: apply updates locally then sync to service
  const updateAppointment = useCallback(async (
    id:      string,
    updates: Partial<Appointment>,
  ) => {
    // Optimistic update first — keeps the UI instant
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, ...updates } : a),
    );
    await scheduleService.updateAppointment(id, updates);
  }, []);

  // Delete — optimistic: remove from local list then sync
  const deleteAppointment = useCallback(async (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    await scheduleService.deleteAppointment(id);
  }, []);

  // Provider rename — local-only (no backend call for Phase 3)
  const updateProvider = useCallback((id: string, updates: Partial<Provider>) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Add a new provider column (e.g., from "Add More Operatory" in TimeSettingsModal)
  const addProvider = useCallback((provider: Provider) => {
    setProviders(prev => [...prev, provider]);
  }, []);

  // Swap a provider one position left or right in the column order
  const reorderProvider = useCallback((id: string, direction: 'left' | 'right') => {
    setProviders(prev => {
      const idx = prev.findIndex(p => p.id === id);
      const to  = direction === 'left' ? idx - 1 : idx + 1;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }, []);

  return {
    appointments,
    providers,
    loadState,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    updateProvider,
    addProvider,
    reorderProvider,
    refresh: fetch,
  };
}
