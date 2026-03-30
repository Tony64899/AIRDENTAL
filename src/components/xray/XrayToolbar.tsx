// XrayToolbar — horizontal controls bar below the X-ray viewer.
// ⚠️ HIPAA: Part of the X-ray viewer — only accessible to authenticated users.

import {
  ZoomIn,
  ZoomOut,
  Sun,
  SlidersHorizontal,
  Eye,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Maximize,
  Minimize,
  MessageSquare,
} from 'lucide-react';
import type { XrayViewerState } from '../../types/xray';

interface XrayToolbarProps {
  viewerState:         XrayViewerState;
  onZoomIn:            () => void;
  onZoomOut:           () => void;
  onSetBrightness:     (v: number) => void;
  onSetContrast:       (v: number) => void;
  onToggleInvert:      () => void;
  onRotateLeft:        () => void;
  onRotateRight:       () => void;
  onReset:             () => void;
  onFullscreen:        () => void;
  onToggleAnnotations: () => void;
  showAnnotations:     boolean;
  isFullscreen:        boolean;
}

const iconBtn = 'p-1.5 rounded text-[#666] hover:text-white hover:bg-white/10 transition-colors';
const divider = <span className="w-px h-5 bg-[#2a2a2a] flex-shrink-0" />;

export function XrayToolbar({
  viewerState,
  onZoomIn,
  onZoomOut,
  onSetBrightness,
  onSetContrast,
  onToggleInvert,
  onRotateLeft,
  onRotateRight,
  onReset,
  onFullscreen,
  onToggleAnnotations,
  showAnnotations,
  isFullscreen,
}: XrayToolbarProps) {
  const { zoom, brightness, contrast, invert } = viewerState;
  const atMinZoom = zoom <= 0.25;
  const atMaxZoom = zoom >= 5;

  return (
    <div className="bg-[#111] border-t border-[#222] px-4 py-2 flex items-center gap-4 flex-wrap flex-shrink-0">

      {/* Group 1 — Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          disabled={atMinZoom}
          className={`${iconBtn} disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[#666] font-mono text-xs w-12 text-center">
          {(zoom * 100).toFixed(0)}%
        </span>
        <button
          onClick={onZoomIn}
          disabled={atMaxZoom}
          className={`${iconBtn} disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {divider}

      {/* Group 2 — Brightness */}
      <div className="flex items-center gap-1.5">
        <Sun className="w-3.5 h-3.5 text-[#666]" />
        <input
          type="range"
          min={0}
          max={200}
          value={brightness}
          onChange={e => onSetBrightness(Number(e.target.value))}
          className="w-24 accent-[#0891b2]"
          title="Brightness"
          aria-label="Brightness"
        />
        <span className="text-[#555] text-xs w-8 text-right">{brightness}%</span>
      </div>

      {divider}

      {/* Group 3 — Contrast */}
      <div className="flex items-center gap-1.5">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#666]" />
        <input
          type="range"
          min={0}
          max={200}
          value={contrast}
          onChange={e => onSetContrast(Number(e.target.value))}
          className="w-24 accent-[#0891b2]"
          title="Contrast"
          aria-label="Contrast"
        />
        <span className="text-[#555] text-xs w-8 text-right">{contrast}%</span>
      </div>

      {divider}

      {/* Group 4 — Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleInvert}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            invert ? 'text-yellow-400 bg-yellow-400/10' : 'text-[#666] hover:text-white hover:bg-white/10'
          }`}
          title="Invert colors"
          aria-label={invert ? 'Invert on' : 'Invert off'}
          aria-pressed={invert}
        >
          <Eye className="w-3.5 h-3.5" />
          Invert
        </button>

        <button
          onClick={onRotateLeft}
          className={iconBtn}
          title="Rotate left"
          aria-label="Rotate left 90°"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onRotateRight}
          className={iconBtn}
          title="Rotate right"
          aria-label="Rotate right 90°"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {divider}

      {/* Group 5 — Actions */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onToggleAnnotations}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            showAnnotations ? 'text-[#0891b2] bg-[#0891b2]/10' : 'text-[#666] hover:text-white hover:bg-white/10'
          }`}
          title="Toggle annotations"
          aria-label={showAnnotations ? 'Hide annotations' : 'Show annotations'}
          aria-pressed={showAnnotations}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Notes
        </button>

        <button
          onClick={onReset}
          className={`${iconBtn} hover:text-white`}
          title="Reset view"
          aria-label="Reset view"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onFullscreen}
          className={`${iconBtn} hover:text-white`}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
