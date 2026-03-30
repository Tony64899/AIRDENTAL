// useOdontogram — state management for the interactive tooth chart.
// Handles: load, paint surface, paint whole tooth, undo/redo, auto-save (30s).
// ⚠️ HIPAA: In-memory only. Do not persist to localStorage.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { OdontogramState, TreatmentStatus, SurfaceName } from '../types/patient';
import type { LoadingState } from '../types/common';
import {
  getOdontogram,
  updateSurface,
  updateToothLevel,
  updateToothNotes,
  linkCDTCode,
  unlinkCDTCode,
  clearTooth,
  saveOdontogram,
  updateMode,
} from '../services/odontogramService';

// Phase 9 will replace this with auth context
const CURRENT_PROVIDER = 'Dr. Sarah Chen';

export interface UseOdontogramReturn {
  odontogram:            OdontogramState | null;
  loadState:             LoadingState;
  error:                 string | null;
  // Toolbar state
  selectedTreatment:     TreatmentStatus;
  setSelectedTreatment:  (t: TreatmentStatus) => void;
  // Interaction handlers
  handleSurfaceClick:    (toothNumber: number, surface: SurfaceName) => void;
  handleToothLevelSet:   (toothNumber: number, status: TreatmentStatus) => void;
  handleClearTooth:      (toothNumber: number) => void;
  handleClearAll:        () => void;
  updateNotes:           (toothNumber: number, notes: string) => void;
  linkCDT:               (toothNumber: number, code: string) => void;
  unlinkCDT:             (toothNumber: number, code: string) => void;
  // Mode
  setMode:               (mode: 'existing' | 'planned') => void;
  // Undo / Redo
  undo:                  () => void;
  redo:                  () => void;
  canUndo:               boolean;
  canRedo:               boolean;
  // Save state
  pendingChanges:        boolean;
  saving:                boolean;
  lastSaved:             Date | null;
  save:                  () => Promise<void>;
}

export function useOdontogram(patientId: string): UseOdontogramReturn {
  const [odontogram, setOdontogram]         = useState<OdontogramState | null>(null);
  const [loadState,  setLoadState]           = useState<LoadingState>('idle');
  const [error,      setError]               = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentStatus>('composite');
  const [pendingChanges, setPendingChanges]  = useState(false);
  const [saving,     setSaving]              = useState(false);
  const [lastSaved,  setLastSaved]           = useState<Date | null>(null);
  const [canUndo,    setCanUndo]             = useState(false);
  const [canRedo,    setCanRedo]             = useState(false);

  // Undo/redo stacks stored in refs — changes do not trigger re-renders
  const undoRef = useRef<OdontogramState[]>([]);
  const redoRef = useRef<OdontogramState[]>([]);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadState('loading');
    setError(null);
    getOdontogram(patientId)
      .then(data => {
        setOdontogram(data);
        setLoadState('success');
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load odontogram');
        setLoadState('error');
      });
  }, [patientId]);

  // ── Auto-save every 30s ─────────────────────────────────────────────────────
  const saveRef = useRef<() => Promise<void>>();

  const save = useCallback(async () => {
    if (!odontogram) return;
    setSaving(true);
    try {
      const saved = await saveOdontogram(patientId, odontogram);
      setOdontogram(saved);
      setPendingChanges(false);
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  }, [patientId, odontogram]);

  // Keep saveRef current so the interval can call the latest save
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pendingChanges && saveRef.current) {
        void saveRef.current();
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [pendingChanges]);

  // ── Mutation helpers ────────────────────────────────────────────────────────
  function pushUndo(snapshot: OdontogramState) {
    undoRef.current.push(snapshot);
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }

  const undo = useCallback(async () => {
    if (undoRef.current.length === 0 || !odontogram) return;
    const prev = undoRef.current.pop()!;
    redoRef.current.push(odontogram);
    setCanUndo(undoRef.current.length > 0);
    setCanRedo(true);
    const saved = await saveOdontogram(patientId, prev);
    setOdontogram(saved);
    setPendingChanges(true);
  }, [patientId, odontogram]);

  const redo = useCallback(async () => {
    if (redoRef.current.length === 0 || !odontogram) return;
    const next = redoRef.current.pop()!;
    undoRef.current.push(odontogram);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    const saved = await saveOdontogram(patientId, next);
    setOdontogram(saved);
    setPendingChanges(true);
  }, [patientId, odontogram]);

  // ── Surface click ───────────────────────────────────────────────────────────
  const handleSurfaceClick = useCallback((toothNumber: number, surface: SurfaceName) => {
    if (!odontogram) return;
    pushUndo(odontogram);
    updateSurface(patientId, toothNumber, surface, selectedTreatment, CURRENT_PROVIDER)
      .then(updated => {
        setOdontogram(updated);
        setPendingChanges(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Update failed'));
  }, [patientId, odontogram, selectedTreatment]);

  // ── Tooth level set ─────────────────────────────────────────────────────────
  const handleToothLevelSet = useCallback((toothNumber: number, status: TreatmentStatus) => {
    if (!odontogram) return;
    pushUndo(odontogram);
    updateToothLevel(patientId, toothNumber, status, CURRENT_PROVIDER)
      .then(updated => {
        setOdontogram(updated);
        setPendingChanges(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Update failed'));
  }, [patientId, odontogram]);

  // ── Clear tooth ─────────────────────────────────────────────────────────────
  const handleClearTooth = useCallback((toothNumber: number) => {
    if (!odontogram) return;
    pushUndo(odontogram);
    clearTooth(patientId, toothNumber, CURRENT_PROVIDER)
      .then(updated => {
        setOdontogram(updated);
        setPendingChanges(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Clear failed'));
  }, [patientId, odontogram]);

  // ── Clear all ───────────────────────────────────────────────────────────────
  const handleClearAll = useCallback(() => {
    if (!odontogram) return;
    pushUndo(odontogram);
    const clearAll = async () => {
      let state = odontogram;
      for (const tooth of state.teeth) {
        state = await clearTooth(patientId, tooth.toothNumber, CURRENT_PROVIDER);
      }
      setOdontogram(state);
      setPendingChanges(true);
    };
    clearAll().catch(err => setError(err instanceof Error ? err.message : 'Clear all failed'));
  }, [patientId, odontogram]);

  // ── Notes ───────────────────────────────────────────────────────────────────
  const updateNotes = useCallback((toothNumber: number, notes: string) => {
    updateToothNotes(patientId, toothNumber, notes)
      .then(updated => {
        setOdontogram(updated);
        setPendingChanges(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Notes update failed'));
  }, [patientId]);

  // ── CDT codes ───────────────────────────────────────────────────────────────
  const linkCDT = useCallback((toothNumber: number, code: string) => {
    linkCDTCode(patientId, toothNumber, code)
      .then(updated => {
        setOdontogram(updated);
        setPendingChanges(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Link CDT failed'));
  }, [patientId]);

  const unlinkCDT = useCallback((toothNumber: number, code: string) => {
    unlinkCDTCode(patientId, toothNumber, code)
      .then(updated => {
        setOdontogram(updated);
        setPendingChanges(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Unlink CDT failed'));
  }, [patientId]);

  // ── Mode ────────────────────────────────────────────────────────────────────
  const setMode = useCallback((mode: 'existing' | 'planned') => {
    updateMode(patientId, mode)
      .then(updated => setOdontogram(updated))
      .catch(err => setError(err instanceof Error ? err.message : 'Mode update failed'));
  }, [patientId]);

  return {
    odontogram,
    loadState,
    error,
    selectedTreatment,
    setSelectedTreatment,
    handleSurfaceClick,
    handleToothLevelSet,
    handleClearTooth,
    handleClearAll,
    updateNotes,
    linkCDT,
    unlinkCDT,
    setMode,
    undo,
    redo,
    canUndo,
    canRedo,
    pendingChanges,
    saving,
    lastSaved,
    save,
  };
}
