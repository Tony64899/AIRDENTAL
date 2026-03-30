// XrayAnnotationPanel — right panel for managing X-ray annotations.
// ⚠️ HIPAA: Annotations are part of the X-ray record (PHI). Authenticated access only.

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { XrayImage, XrayAnnotation, AnnotationType } from '../../types/xray';

interface XrayAnnotationPanelProps {
  xray:        XrayImage | null;
  annotations: XrayAnnotation[];
  onAdd:       (ann: Omit<XrayAnnotation, 'id'>) => Promise<void>;
  onDelete:    (id: string) => Promise<void>;
}

const ANNOTATION_TYPES: AnnotationType[] = ['text', 'arrow'];

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function XrayAnnotationPanel({
  xray,
  annotations,
  onAdd,
  onDelete,
}: XrayAnnotationPanelProps) {
  const [annType,  setAnnType]  = useState<AnnotationType>('text');
  const [xPos,     setXPos]     = useState('50');
  const [yPos,     setYPos]     = useState('50');
  const [label,    setLabel]    = useState('');
  const [adding,   setAdding]   = useState(false);

  if (!xray) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4 py-6">
        <p className="text-xs text-[#555]">Select an X-ray to manage annotations</p>
      </div>
    );
  }

  const xrayAnnotations = annotations.filter(a => a.xrayId === xray.id);

  async function handleAdd() {
    if (!label.trim()) return;
    setAdding(true);
    try {
      await onAdd({
        xrayId:    xray.id,
        type:      annType,
        x:         Math.min(100, Math.max(0, Number(xPos))),
        y:         Math.min(100, Math.max(0, Number(yPos))),
        label:     label.trim(),
        createdBy: 'Dr. Sarah Chen',
        createdAt: new Date().toISOString(),
      });
      setLabel('');
      setXPos('50');
      setYPos('50');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-3">

      {/* Add annotation form */}
      <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4">
        <p className="text-[10px] font-semibold text-[#555] uppercase tracking-widest mb-3">
          Add Marker
        </p>

        {/* Type selector */}
        <div className="flex gap-1.5 mb-3">
          {ANNOTATION_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setAnnType(t)}
              className={[
                'px-3 py-1 rounded-lg text-xs font-semibold transition-colors border capitalize',
                annType === t
                  ? 'bg-[#0891b2] text-white border-[#0891b2]'
                  : 'text-[#555] border-[#2a2a2a] hover:border-[#0891b2] hover:text-[#0891b2]',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Position inputs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-[10px] text-[#555] mb-1" htmlFor="ann-x">X position %</label>
            <input
              id="ann-x"
              type="number"
              min={0}
              max={100}
              value={xPos}
              onChange={e => setXPos(e.target.value)}
              className="w-full text-xs border border-[#2a2a2a] bg-[#0d0d0d] text-[#ccc] rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#555] mb-1" htmlFor="ann-y">Y position %</label>
            <input
              id="ann-y"
              type="number"
              min={0}
              max={100}
              value={yPos}
              onChange={e => setYPos(e.target.value)}
              className="w-full text-xs border border-[#2a2a2a] bg-[#0d0d0d] text-[#ccc] rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
        </div>

        {/* Label */}
        <div className="mb-3">
          <label className="block text-[10px] text-[#555] mb-1" htmlFor="ann-label">Label</label>
          <input
            id="ann-label"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void handleAdd(); }}
            placeholder="e.g. Caries, Apex, Working length..."
            className="w-full text-xs border border-[#2a2a2a] bg-[#0d0d0d] text-[#ccc] rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] placeholder-[#444]"
          />
        </div>

        <button
          onClick={() => void handleAdd()}
          disabled={adding || !label.trim()}
          className="w-full py-1.5 bg-[#0891b2] text-white text-xs font-semibold rounded-lg hover:bg-[#0e7490] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? 'Adding…' : 'Add Marker'}
        </button>
      </div>

      {/* Annotations list */}
      <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4">
        <p className="text-[10px] font-semibold text-[#555] uppercase tracking-widest mb-3">
          Annotations ({xrayAnnotations.length})
        </p>

        {xrayAnnotations.length === 0 ? (
          <p className="text-xs text-[#444] italic">
            No annotations yet. Add markers to highlight findings.
          </p>
        ) : (
          <div className="space-y-2">
            {xrayAnnotations.map(ann => (
              <div
                key={ann.id}
                className="flex items-start justify-between gap-2 p-2 bg-[#0d0d0d] rounded-lg border border-[#1e1e1e]"
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {/* Yellow pin */}
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#ccc] font-medium truncate">{ann.label}</p>
                    <p className="text-[10px] text-[#555] mt-0.5">
                      {ann.x.toFixed(0)}%, {ann.y.toFixed(0)}%
                      <span className="mx-1">·</span>
                      <span className="capitalize">{ann.type}</span>
                    </p>
                    <p className="text-[10px] text-[#444] mt-0.5">
                      {ann.createdBy} · {formatDate(ann.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => void onDelete(ann.id)}
                  className="p-1 rounded text-[#555] hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0"
                  aria-label={`Delete annotation: ${ann.label}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Future scope notice */}
      <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl">
        <p className="text-xs text-amber-700/80 font-medium">
          Advanced drawing tools (measurement lines, region marking) — coming in a future release.
        </p>
      </div>

    </div>
  );
}
