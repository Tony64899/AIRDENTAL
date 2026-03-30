// useXray — loads and manages X-ray list for a patient.
// ⚠️ HIPAA: In-memory only. No localStorage caching.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { XrayImage, XrayAnnotation } from '../types/xray';
import type { LoadingState } from '../types/common';
import {
  getXraysForPatient,
  getAnnotations,
  uploadXray     as uploadXrayService,
  deleteXray     as deleteXrayService,
  updateXrayNotes,
  addAnnotation  as addAnnotationService,
  deleteAnnotation as deleteAnnotationService,
} from '../services/xrayService';

interface UseXrayReturn {
  xrays:            XrayImage[];
  annotations:      XrayAnnotation[];
  loadState:        LoadingState;
  error:            string | null;
  selectedXray:     XrayImage | null;
  selectXray:       (id: string | null) => void;
  uploadXray:       (file: File, meta: Omit<XrayImage, 'id' | 'fileUrl' | 'thumbnailUrl' | 'fileSizeBytes' | 'fileName'>) => Promise<void>;
  deleteXray:       (id: string) => Promise<void>;
  updateNotes:      (id: string, notes: string) => Promise<void>;
  addAnnotation:    (ann: Omit<XrayAnnotation, 'id'>) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  refresh:          () => void;
}

export function useXray(patientId: string): UseXrayReturn {
  const [xrays,        setXrays]        = useState<XrayImage[]>([]);
  const [annotations,  setAnnotations]  = useState<XrayAnnotation[]>([]);
  const [loadState,    setLoadState]    = useState<LoadingState>('idle');
  const [error,        setError]        = useState<string | null>(null);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);

  // Tracks whether the component is still mounted to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async (pid: string) => {
    setLoadState('loading');
    setError(null);
    try {
      const imgs = await getXraysForPatient(pid);
      if (!mountedRef.current) return;
      setXrays(imgs);
      setLoadState('success');

      // Lazy-load annotations for all retrieved X-rays
      const allAnnotations: XrayAnnotation[] = [];
      for (const img of imgs) {
        const anns = await getAnnotations(img.id);
        allAnnotations.push(...anns);
      }
      if (!mountedRef.current) return;
      setAnnotations(allAnnotations);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load X-rays');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    if (!patientId) return;
    void load(patientId);
  }, [patientId, load]);

  const refresh = useCallback(() => {
    if (patientId) void load(patientId);
  }, [patientId, load]);

  const selectXray = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const selectedXray = xrays.find(x => x.id === selectedId) ?? null;

  const uploadXray = useCallback(async (
    file: File,
    meta: Omit<XrayImage, 'id' | 'fileUrl' | 'thumbnailUrl' | 'fileSizeBytes' | 'fileName'>,
  ) => {
    const newXray = await uploadXrayService(file, meta);
    setXrays(prev => [newXray, ...prev]);
    setSelectedId(newXray.id);
  }, []);

  const deleteXray = useCallback(async (id: string) => {
    await deleteXrayService(id);
    setXrays(prev => prev.filter(x => x.id !== id));
    setAnnotations(prev => prev.filter(a => a.xrayId !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    const updated = await updateXrayNotes(id, notes);
    setXrays(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const addAnnotation = useCallback(async (ann: Omit<XrayAnnotation, 'id'>) => {
    const newAnn = await addAnnotationService(ann);
    setAnnotations(prev => [...prev, newAnn]);
  }, []);

  const deleteAnnotation = useCallback(async (id: string) => {
    await deleteAnnotationService(id);
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    xrays,
    annotations,
    loadState,
    error,
    selectedXray,
    selectXray,
    uploadXray,
    deleteXray,
    updateNotes,
    addAnnotation,
    deleteAnnotation,
    refresh,
  };
}
