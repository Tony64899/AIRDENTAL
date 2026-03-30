// useXrayViewer — manages the image display state (zoom, brightness, contrast, etc.)
// ⚠️ HIPAA: Viewer state is transient — no PHI is persisted here.

import { useState, useCallback } from 'react';
import type { XrayViewerState } from '../types/xray';

const DEFAULT_STATE: XrayViewerState = {
  brightness: 100,
  contrast:   100,
  invert:     false,
  zoom:       1,
  rotation:   0,
  panX:       0,
  panY:       0,
};

const ZOOM_MIN  = 0.25;
const ZOOM_MAX  = 5;
const ZOOM_STEP = 0.25;

interface UseXrayViewerReturn {
  state:           XrayViewerState;
  setBrightness:   (v: number) => void;
  setContrast:     (v: number) => void;
  setZoom:         (v: number) => void;
  zoomIn:          () => void;
  zoomOut:         () => void;
  toggleInvert:    () => void;
  rotateLeft:      () => void;
  rotateRight:     () => void;
  setPan:          (x: number, y: number) => void;
  reset:           () => void;
  cssFilter:       string;
  cssTransform:    string;
}

export function useXrayViewer(): UseXrayViewerReturn {
  const [state, setState] = useState<XrayViewerState>(DEFAULT_STATE);

  const setBrightness = useCallback((v: number) => {
    setState(prev => ({ ...prev, brightness: Math.min(200, Math.max(0, v)) }));
  }, []);

  const setContrast = useCallback((v: number) => {
    setState(prev => ({ ...prev, contrast: Math.min(200, Math.max(0, v)) }));
  }, []);

  const setZoom = useCallback((v: number) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));
    setState(prev => ({
      ...prev,
      zoom: clamped,
      // Reset pan when zoom returns to 1
      panX: clamped === 1 ? 0 : prev.panX,
      panY: clamped === 1 ? 0 : prev.panY,
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState(prev => {
      const newZoom = Math.min(ZOOM_MAX, prev.zoom + ZOOM_STEP);
      return { ...prev, zoom: newZoom };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => {
      const newZoom = Math.max(ZOOM_MIN, prev.zoom - ZOOM_STEP);
      return {
        ...prev,
        zoom: newZoom,
        panX: newZoom === 1 ? 0 : prev.panX,
        panY: newZoom === 1 ? 0 : prev.panY,
      };
    });
  }, []);

  const toggleInvert = useCallback(() => {
    setState(prev => ({ ...prev, invert: !prev.invert }));
  }, []);

  const rotateLeft = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotation: ((prev.rotation - 90 + 360) % 360) as 0 | 90 | 180 | 270,
    }));
  }, []);

  const rotateRight = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotation: ((prev.rotation + 90) % 360) as 0 | 90 | 180 | 270,
    }));
  }, []);

  const setPan = useCallback((x: number, y: number) => {
    setState(prev => ({ ...prev, panX: x, panY: y }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const cssFilter = `brightness(${state.brightness}%) contrast(${state.contrast}%)${state.invert ? ' invert(1)' : ''}`;
  const cssTransform = `scale(${state.zoom}) rotate(${state.rotation}deg)`;

  return {
    state,
    setBrightness,
    setContrast,
    setZoom,
    zoomIn,
    zoomOut,
    toggleInvert,
    rotateLeft,
    rotateRight,
    setPan,
    reset,
    cssFilter,
    cssTransform,
  };
}
