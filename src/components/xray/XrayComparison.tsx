// XrayComparison — side-by-side X-ray comparison view.
// ⚠️ HIPAA: Both images are PHI. Audit-logged as 'view' on load.

import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Sun } from 'lucide-react';
import type { XrayImage, XrayType } from '../../types/xray';
import { useXrayViewer } from '../../hooks/useXrayViewer';

interface XrayComparisonProps {
  xrays:     XrayImage[];
  primaryId: string | null;
  onClose:   () => void;
}

const XRAY_TYPE_COLORS: Record<XrayType, string> = {
  PA:   'bg-blue-900 text-blue-300',
  BW:   'bg-green-900 text-green-300',
  Pano: 'bg-purple-900 text-purple-300',
  FMX:  'bg-amber-900 text-amber-300',
  Ceph: 'bg-red-900 text-red-300',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

// ── Mini Panel ─────────────────────────────────────────────────────────────────
interface CompPanelProps {
  xrays:       XrayImage[];
  selectedId:  string;
  onSelect:    (id: string) => void;
  viewer:      ReturnType<typeof useXrayViewer>;
  label:       'Left' | 'Right';
}

function CompPanel({ xrays, selectedId, onSelect, viewer, label }: CompPanelProps) {
  const xray     = xrays.find(x => x.id === selectedId);
  const { state, zoomIn, zoomOut, setBrightness, cssFilter } = viewer;

  return (
    <div className="flex flex-col h-full">
      {/* Selector */}
      <div className="bg-[#111] border-b border-[#222] px-3 py-2 flex-shrink-0">
        <select
          value={selectedId}
          onChange={e => onSelect(e.target.value)}
          className="bg-[#111] text-white text-sm border border-[#333] rounded px-2 py-1 w-full outline-none focus:border-[#0891b2]"
          aria-label={`${label} panel X-ray selector`}
        >
          {xrays.map(x => (
            <option key={x.id} value={x.id}>
              {x.type} — Tooth {x.toothNumbers.join(',') || 'Full'} — {formatDate(x.date)}
            </option>
          ))}
        </select>
      </div>

      {/* Image area */}
      <div className="flex-1 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden">
        {xray ? (
          <img
            src={xray.fileUrl}
            alt={`${xray.type} X-ray ${xray.date}`}
            draggable={false}
            style={{
              filter:    cssFilter,
              transform: `scale(${state.zoom})`,
              maxHeight: '100%',
              maxWidth:  '100%',
              transition: 'transform 0.1s ease',
            }}
            className="object-contain select-none"
          />
        ) : (
          <p className="text-[#333] text-sm">No X-ray selected</p>
        )}
      </div>

      {/* Mini toolbar */}
      <div className="bg-[#111] border-t border-[#222] px-3 py-1.5 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={zoomOut}
          disabled={state.zoom <= 0.25}
          className="p-1 rounded text-[#666] hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[#666] font-mono text-[10px] w-10 text-center">
          {(state.zoom * 100).toFixed(0)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={state.zoom >= 5}
          className="p-1 rounded text-[#666] hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 ml-2">
          <Sun className="w-3 h-3 text-[#555]" />
          <input
            type="range"
            min={0}
            max={200}
            value={state.brightness}
            onChange={e => setBrightness(Number(e.target.value))}
            className="w-20 accent-[#0891b2]"
            aria-label="Brightness"
          />
        </div>

        {/* Label tags */}
        {xray && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${XRAY_TYPE_COLORS[xray.type]}`}>
              {xray.type}
            </span>
            <span className="text-[9px] text-[#555]">{formatDate(xray.date)}</span>
            {xray.toothNumbers.length > 0 && (
              <span className="text-[9px] text-[#444]">#{xray.toothNumbers.join(',')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Comparison Component ──────────────────────────────────────────────────
export function XrayComparison({ xrays, primaryId, onClose }: XrayComparisonProps) {
  const [leftId,   setLeftId]   = useState<string>(primaryId ?? xrays[0]?.id ?? '');
  const [rightId,  setRightId]  = useState<string>(xrays[1]?.id ?? '');
  const [syncZoom, setSyncZoom] = useState(false);

  const leftViewer  = useXrayViewer();
  const rightViewer = useXrayViewer();

  // Track which side last changed to avoid infinite loop
  const syncingRef = useRef(false);

  // Sync zoom from left → right
  useEffect(() => {
    if (!syncZoom) return;
    if (syncingRef.current) return;
    syncingRef.current = true;
    rightViewer.setZoom(leftViewer.state.zoom);
    syncingRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncZoom, leftViewer.state.zoom]);

  // Sync zoom from right → left
  useEffect(() => {
    if (!syncZoom) return;
    if (syncingRef.current) return;
    syncingRef.current = true;
    leftViewer.setZoom(rightViewer.state.zoom);
    syncingRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncZoom, rightViewer.state.zoom]);

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col">

      {/* Header bar */}
      <div className="bg-[#111] border-b border-[#222] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="text-white font-bold text-sm">Comparison Mode</h2>

        <div className="flex items-center gap-3">
          {/* Sync zoom toggle */}
          <button
            onClick={() => setSyncZoom(v => !v)}
            className={[
              'text-xs font-medium px-3 py-1 rounded-lg border transition-colors',
              syncZoom
                ? 'bg-[#0891b2]/20 text-[#0891b2] border-[#0891b2]/40'
                : 'text-[#666] border-[#333] hover:border-[#555] hover:text-[#888]',
            ].join(' ')}
            aria-pressed={syncZoom}
          >
            Sync Zoom: {syncZoom ? 'ON' : 'OFF'}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#666] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Two-panel grid */}
      <div className="flex-1 grid grid-cols-2 gap-1 overflow-hidden">
        <CompPanel
          xrays={xrays}
          selectedId={leftId}
          onSelect={setLeftId}
          viewer={leftViewer}
          label="Left"
        />
        <CompPanel
          xrays={xrays}
          selectedId={rightId}
          onSelect={setRightId}
          viewer={rightViewer}
          label="Right"
        />
      </div>
    </div>
  );
}
