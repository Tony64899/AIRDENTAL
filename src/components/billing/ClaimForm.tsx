// ClaimForm.tsx — new claim creation form (simplified ADA claim form).
// ⚠️ HIPAA: Claim/patient data is PHI. All form submissions must be audit-logged.

import { useState, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Claim, ClaimLine, TreatmentEntry } from './types';
import { createClaim } from '../../services/billingService';
import { CDT_BY_CODE, CDT_CODES } from './mockData';
import { MOCK_PATIENTS } from '../../constants/mockPatients';
import { formatCurrency } from '../../utils/formatUtils';

const PROVIDERS = [
  { id: 'prov-1', name: 'Dr. Sarah Chen' },
  { id: 'prov-2', name: 'Dr. Michael Torres' },
  { id: 'prov-3', name: 'Dr. Emily White' },
  { id: 'prov-4', name: 'Dr. James Park' },
];

interface LineRow {
  id:          string;
  date:        string;
  cdtCode:     string;
  toothNumber: string;
  surfaces:    string;
  fee:         string;
}

interface ClaimFormProps {
  initialEntries?: TreatmentEntry[];
  onSubmit:        (claim: Claim) => void;
  onClose:         () => void;
}

export default function ClaimForm({ initialEntries, onSubmit, onClose }: ClaimFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [patientId, setPatientId] = useState(initialEntries?.[0]?.patientId ?? '');
  const [providerId, setProvider] = useState(initialEntries?.[0]?.providerId ?? 'prov-1');
  const [lines, setLines]         = useState<LineRow[]>(() =>
    (initialEntries?.length ?? 0) > 0
      ? initialEntries!.map((e, i) => ({
          id: `row-${i}`,
          date: e.date,
          cdtCode: e.cdtCode,
          toothNumber: e.toothNumber?.toString() ?? '',
          surfaces: e.surfaces?.join('') ?? '',
          fee: (e.fee / 100).toFixed(2),
        }))
      : [{ id: 'row-0', date: today, cdtCode: '', toothNumber: '', surfaces: '', fee: '' }]
  );
  const [saving, setSaving] = useState(false);

  const patient = useMemo(() => MOCK_PATIENTS.find(p => p.id === patientId), [patientId]);

  const addLine = () => {
    setLines(prev => [...prev, { id: `row-${Date.now()}`, date: today, cdtCode: '', toothNumber: '', surfaces: '', fee: '' }]);
  };

  const removeLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof LineRow, value: string) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      // Auto-fill fee when CDT code is selected
      if (field === 'cdtCode' && CDT_BY_CODE[value]) {
        updated.fee = (CDT_BY_CODE[value].defaultFee / 100).toFixed(2);
      }
      return updated;
    }));
  };

  const totalCharged = lines.reduce((sum, l) => sum + (parseFloat(l.fee) || 0), 0);

  const handleSave = async (markReady: boolean) => {
    if (!patientId || lines.length === 0) return;
    setSaving(true);
    try {
      const claimLines: ClaimLine[] = lines.map((l, i) => ({
        lineNumber: i + 1,
        dateOfService: l.date,
        cdtCode: l.cdtCode,
        toothNumber: l.toothNumber ? parseInt(l.toothNumber) : undefined,
        surfaces: l.surfaces ? l.surfaces.split('') : undefined,
        fee: Math.round((parseFloat(l.fee) || 0) * 100),
        status: 'pending',
      }));

      const newClaim = await createClaim({
        patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : patientId,
        insurancePlanId: patient?.primaryInsurance?.memberId ?? '',
        insuranceName: patient?.primaryInsurance?.carrier ?? 'Unknown',
        claimType: 'P',
        status: markReady ? 'ready' : 'draft',
        totalCharged: Math.round(totalCharged * 100),
        lines: claimLines,
      });
      onSubmit(newClaim);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-[#0f172a]">New Claim</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Section 1 — Patient & Subscriber */}
          <div>
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">1. Patient &amp; Subscriber</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Patient</label>
                <select
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                >
                  <option value="">Select patient…</option>
                  {MOCK_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — #{p.chartNumber}</option>
                  ))}
                </select>
              </div>
              {patient && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#64748b] mb-1">Date of Birth</label>
                    <input
                      readOnly
                      value={new Date(patient.dateOfBirth + 'T12:00:00').toLocaleDateString('en-US')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-[#64748b]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#64748b] mb-1">Address</label>
                    <input
                      readOnly
                      value={patient.address ? `${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zip}` : '—'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-[#64748b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748b] mb-1">Primary Insurance</label>
                    <input
                      readOnly
                      value={patient.primaryInsurance?.carrier ?? 'None on file'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-[#64748b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748b] mb-1">Member ID</label>
                    <input
                      readOnly
                      value={patient.primaryInsurance?.memberId ?? '—'}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono text-[#64748b]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2 — Provider */}
          <div>
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">2. Provider</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Rendering Provider</label>
                <select
                  value={providerId}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                >
                  {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">NPI</label>
                <input readOnly value="00000000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono text-[#64748b]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Tax ID</label>
                <input readOnly value="00-0000000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono text-[#64748b]" />
              </div>
            </div>
          </div>

          {/* Section 3 — Procedure Lines */}
          <div>
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">3. Procedure Lines</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr>
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-2">Date</th>
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-2">CDT Code</th>
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-2">Tooth</th>
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-2">Surfaces</th>
                    <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-2">Fee</th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map(line => (
                    <tr key={line.id} className="border-b border-gray-100">
                      <td className="py-1.5 pr-2">
                        <input
                          type="date"
                          value={line.date}
                          onChange={e => updateLine(line.id, 'date', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <select
                          value={line.cdtCode}
                          onChange={e => updateLine(line.id, 'cdtCode', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                        >
                          <option value="">Select…</option>
                          {CDT_CODES.map(c => (
                            <option key={c.code} value={c.code}>{c.code} — {c.layperson}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="number"
                          min={1}
                          max={32}
                          value={line.toothNumber}
                          onChange={e => updateLine(line.id, 'toothNumber', e.target.value)}
                          placeholder="1–32"
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0891b2]/30"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={line.surfaces}
                          onChange={e => updateLine(line.id, 'surfaces', e.target.value)}
                          placeholder="MOBDL"
                          className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0891b2]/30"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8]">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.fee}
                            onChange={e => updateLine(line.id, 'fee', e.target.value)}
                            className="w-24 border border-gray-200 rounded-lg pl-5 pr-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#0891b2]/30"
                          />
                        </div>
                      </td>
                      <td className="py-1.5">
                        {lines.length > 1 && (
                          <button
                            onClick={() => removeLine(line.id)}
                            className="p-1 text-[#94a3b8] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addLine}
              className="flex items-center gap-1.5 text-xs text-[#0891b2] hover:text-[#0e7490] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Procedure
            </button>
          </div>

          {/* Section 4 — Totals */}
          <div className="bg-[#f8fafc] rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[#64748b]">Total Charged</p>
            <p className="text-xl font-bold text-[#0f172a]">{formatCurrency(totalCharged)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#64748b] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !patientId}
            className="px-4 py-2 text-sm border border-[#0891b2] text-[#0891b2] rounded-lg hover:bg-[#f0f9ff] disabled:opacity-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !patientId}
            className="px-4 py-2 text-sm bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
          >
            Mark Ready to Submit
          </button>
        </div>
      </div>
    </div>
  );
}
