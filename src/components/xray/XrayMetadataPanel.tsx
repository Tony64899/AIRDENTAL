// XrayMetadataPanel — right panel showing X-ray metadata and notes.
// ⚠️ HIPAA: X-ray metadata is PHI. Only render for authenticated users.

import { useState, useEffect } from 'react';
import type { XrayImage, XrayType } from '../../types/xray';

interface XrayMetadataPanelProps {
  xray:          XrayImage | null;
  onUpdateNotes: (id: string, notes: string) => Promise<void>;
}

const XRAY_TYPE_COLORS: Record<XrayType, string> = {
  PA:   'bg-blue-900 text-blue-300',
  BW:   'bg-green-900 text-green-300',
  Pano: 'bg-purple-900 text-purple-300',
  FMX:  'bg-amber-900 text-amber-300',
  Ceph: 'bg-red-900 text-red-300',
};

const PROVIDER_NAMES: Record<string, string> = {
  'prov-1': 'Dr. Sarah Chen',
  'prov-2': 'Dr. Michael Torres',
  'prov-3': 'Dr. Emily White',
  'prov-4': 'Dr. James Park',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

export function XrayMetadataPanel({ xray, onUpdateNotes }: XrayMetadataPanelProps) {
  const [notes,   setNotes]   = useState('');
  const [saving,  setSaving]  = useState(false);

  // Sync notes when xray changes
  useEffect(() => {
    setNotes(xray?.notes ?? '');
  }, [xray?.id, xray?.notes]);

  if (!xray) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4 py-6">
        <p className="text-xs text-[#555]">Select an X-ray to view details</p>
      </div>
    );
  }

  async function handleNotesBlur() {
    if (notes === (xray?.notes ?? '')) return;
    setSaving(true);
    try {
      await onUpdateNotes(xray!.id, notes);
    } finally {
      setSaving(false);
    }
  }

  const providerName = PROVIDER_NAMES[xray.providerId] ?? xray.providerId;
  const toothLabel   = xray.toothNumbers.length > 0
    ? xray.toothNumbers.join(', ')
    : 'Full arch';

  return (
    <div className="space-y-3">

      {/* Type + date card */}
      <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${XRAY_TYPE_COLORS[xray.type]}`}>
            {xray.type}
          </span>
          {xray.quadrant && xray.quadrant !== 'full' && (
            <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded">
              {xray.quadrant}
            </span>
          )}
        </div>

        <dl className="space-y-2 text-xs">
          <div className="flex justify-between">
            <dt className="text-[#555]">Date</dt>
            <dd className="text-[#aaa] font-medium">{formatDate(xray.date)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#555]">Provider</dt>
            <dd className="text-[#aaa] font-medium">{providerName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#555]">Tooth</dt>
            <dd className="text-[#aaa] font-medium">{toothLabel}</dd>
          </div>
        </dl>
      </div>

      {/* File info */}
      <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4">
        <p className="text-[10px] font-semibold text-[#555] uppercase tracking-widest mb-2">File Info</p>
        <p className="text-xs text-[#888] break-all">{xray.fileName}</p>
        <p className="text-xs text-[#555] mt-1">{formatFileSize(xray.fileSizeBytes)}</p>
      </div>

      {/* Notes */}
      <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">
            Clinical Notes
          </p>
          {saving && (
            <span className="text-[10px] text-[#0891b2]">Saving…</span>
          )}
        </div>
        <textarea
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Clinical notes..."
          className="w-full text-sm border border-[#2a2a2a] bg-[#0d0d0d] text-[#ccc] rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] outline-none placeholder-[#444]"
        />
      </div>

      {/* DICOM placeholder */}
      <div className="p-3 bg-[#111] rounded-xl border border-[#1e1e1e] border-dashed">
        <p className="text-xs font-semibold text-[#444] uppercase tracking-widest mb-1">DICOM Metadata</p>
        <p className="text-xs text-[#444] italic">DICOM support coming in a future phase.</p>
      </div>

    </div>
  );
}
