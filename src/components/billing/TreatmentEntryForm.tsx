// TreatmentEntryForm.tsx — modal for adding/editing a single treatment entry.
// ⚠️ HIPAA: Treatment entries are PHI. All saves must be audit-logged in production.

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { TreatmentEntry, CdtCode } from './types';
import { addTreatmentEntry, updateTreatmentEntry } from '../../services/billingService';
import CdtCodeLookup from './CdtCodeLookup';
import { formatCurrency } from '../../utils/formatUtils';

const PROVIDERS = [
  { id: 'prov-1', name: 'Dr. Sarah Chen' },
  { id: 'prov-2', name: 'Dr. Michael Torres' },
  { id: 'prov-3', name: 'Dr. Emily White' },
  { id: 'prov-4', name: 'Dr. James Park' },
];

const SURFACES = ['M', 'D', 'O', 'B', 'L'];

interface TreatmentEntryFormProps {
  patientId: string;
  entry?:    TreatmentEntry;
  onSave:    (entry: TreatmentEntry) => void;
  onClose:   () => void;
}

export default function TreatmentEntryForm({ patientId, entry, onSave, onClose }: TreatmentEntryFormProps) {
  const [date, setDate]               = useState(entry?.date ?? new Date().toISOString().split('T')[0]);
  const [providerId, setProviderId]   = useState(entry?.providerId ?? 'prov-1');
  const [toothNumber, setToothNumber] = useState<string>(entry?.toothNumber?.toString() ?? '');
  const [surfaces, setSurfaces]       = useState<string[]>(entry?.surfaces ?? []);
  const [cdtCode, setCdtCode]         = useState(entry?.cdtCode ?? '');
  const [description, setDescription] = useState(entry?.description ?? '');
  const [feeDisplay, setFeeDisplay]   = useState(entry ? (entry.fee / 100).toFixed(2) : '');
  const [notes, setNotes]             = useState(entry?.notes ?? '');
  const [status, setStatus]           = useState<'planned' | 'completed'>(
    entry ? (entry.status === 'planned' ? 'planned' : 'completed') : 'completed'
  );
  const [saving, setSaving]           = useState(false);
  const [showCdtLookup, setShowCdtLookup] = useState(!entry);

  const handleSelectCode = (code: CdtCode) => {
    setCdtCode(code.code);
    setDescription(code.description);
    setFeeDisplay((code.defaultFee / 100).toFixed(2));
    setShowCdtLookup(false);
  };

  const toggleSurface = (s: string) => {
    setSurfaces(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSave = async () => {
    if (!cdtCode || !date) return;
    setSaving(true);
    try {
      const feeCents = Math.round(parseFloat(feeDisplay || '0') * 100);
      const payload: Omit<TreatmentEntry, 'id'> = {
        patientId,
        providerId,
        date,
        cdtCode,
        description,
        fee: feeCents,
        status,
        notes: notes || undefined,
        toothNumber: toothNumber ? parseInt(toothNumber) : undefined,
        surfaces: surfaces.length > 0 ? surfaces : undefined,
      };
      let saved: TreatmentEntry;
      if (entry) {
        saved = await updateTreatmentEntry(entry.id, payload);
      } else {
        saved = await addTreatmentEntry(payload);
      }
      onSave(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-[#0f172a]">
            {entry ? 'Edit Procedure' : 'Add Procedure'}
          </h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Row: date + provider */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Date of Service</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Provider</label>
              <select
                value={providerId}
                onChange={e => setProviderId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: tooth + surfaces */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Tooth # (optional)</label>
              <input
                type="number"
                min={1}
                max={32}
                value={toothNumber}
                onChange={e => setToothNumber(e.target.value)}
                placeholder="1–32"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Surfaces (optional)</label>
              <div className="flex gap-2 flex-wrap">
                {SURFACES.map(s => (
                  <label key={s} className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={surfaces.includes(s)}
                      onChange={() => toggleSurface(s)}
                      className="accent-[#0891b2]"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* CDT Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#64748b]">CDT Code</label>
              <button
                onClick={() => setShowCdtLookup(v => !v)}
                className="text-xs text-[#0891b2] hover:underline"
              >
                {showCdtLookup ? 'Hide lookup' : 'Search codes'}
              </button>
            </div>
            <input
              type="text"
              value={cdtCode}
              onChange={e => setCdtCode(e.target.value)}
              placeholder="e.g. D2391"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
            {showCdtLookup && (
              <div className="mt-2 border border-gray-200 rounded-xl p-3 bg-[#f8fafc]">
                <CdtCodeLookup onSelect={handleSelectCode} embedded />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>

          {/* Fee + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Fee (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={feeDisplay}
                  onChange={e => setFeeDisplay(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                />
              </div>
              {feeDisplay && !isNaN(parseFloat(feeDisplay)) && (
                <p className="text-xs text-[#94a3b8] mt-0.5">{formatCurrency(parseFloat(feeDisplay))}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'planned' | 'completed')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
              >
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#64748b] hover:text-[#0f172a] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !cdtCode || !date}
            className="px-4 py-2 text-sm bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : entry ? 'Save Changes' : 'Add Procedure'}
          </button>
        </div>
      </div>
    </div>
  );
}
