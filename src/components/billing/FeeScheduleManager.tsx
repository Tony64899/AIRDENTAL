// FeeScheduleManager.tsx — admin fee schedule viewer and editor.
// ⚠️ HIPAA: Fee schedule data, while not directly PHI, supports billing for PHI.

import { useState, useEffect } from 'react';
import { Tag, Save, Plus } from 'lucide-react';
import type { FeeSchedule, FeeScheduleEntry } from './types';
import { getFeeSchedules, updateFeeSchedule } from '../../services/billingService';
import { CDT_BY_CODE } from './mockData';
import { formatCurrency } from '../../utils/formatUtils';

export default function FeeScheduleManager() {
  const [schedules, setSchedules]     = useState<FeeSchedule[]>([]);
  const [selected, setSelected]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [editedFees, setEditedFees]   = useState<Record<string, string>>({});
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    getFeeSchedules().then(data => {
      setSchedules(data);
      if (data.length > 0) setSelected(data[0].id);
      setLoading(false);
    });
  }, []);

  const currentSchedule = schedules.find(s => s.id === selected);

  const handleFeeChange = (cdtCode: string, value: string) => {
    setEditedFees(prev => ({ ...prev, [cdtCode]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!currentSchedule) return;
    setSaving(true);
    try {
      const updatedFees: FeeScheduleEntry[] = currentSchedule.fees.map(f => ({
        ...f,
        allowedAmount: editedFees[f.cdtCode] != null
          ? Math.round(parseFloat(editedFees[f.cdtCode] || '0') * 100)
          : f.allowedAmount,
      }));
      const updated = await updateFeeSchedule(currentSchedule.id, { fees: updatedFees });
      setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditedFees({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const TYPE_BADGE: Record<string, string> = {
    UCR:       'bg-blue-100 text-blue-700',
    Insurance: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="flex gap-5 h-full">
      {/* Left: schedule list */}
      <div className="w-52 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
            <Tag className="w-4 h-4 text-[#0891b2]" />
            <h2 className="text-xs font-semibold text-[#0f172a]">Fee Schedules</h2>
          </div>
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="py-2">
              {schedules.map(fs => (
                <button
                  key={fs.id}
                  onClick={() => { setSelected(fs.id); setEditedFees({}); setSaved(false); }}
                  className={[
                    'w-full text-left px-4 py-3 transition-colors',
                    selected === fs.id ? 'bg-[#e0f2fe]' : 'hover:bg-gray-50',
                  ].join(' ')}
                >
                  <p className={`text-sm font-medium ${selected === fs.id ? 'text-[#0891b2]' : 'text-[#0f172a]'}`}>{fs.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TYPE_BADGE[fs.type] ?? 'bg-gray-100 text-gray-600'}`}>{fs.type}</span>
                    <span className="text-[10px] text-[#94a3b8]">{fs.effectiveDate}</span>
                  </div>
                </button>
              ))}
              <button className="w-full text-left px-4 py-2.5 flex items-center gap-1.5 text-xs text-[#0891b2] hover:bg-[#f0f9ff] transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Schedule
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: fee table */}
      <div className="flex-1 min-w-0">
        {!currentSchedule ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-[#94a3b8]">
            Select a fee schedule to view and edit fees.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-semibold text-[#0f172a]">{currentSchedule.name}</h2>
                <p className="text-xs text-[#94a3b8]">Effective {currentSchedule.effectiveDate} &middot; {currentSchedule.fees.length} codes</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || Object.keys(editedFees).length === 0}
                className={[
                  'flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-colors font-medium',
                  saved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[#0891b2] text-white hover:bg-[#0e7490] disabled:opacity-50',
                ].join(' ')}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-5 py-3">Code</th>
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Description</th>
                    <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">UCR Fee</th>
                    <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-5 py-3">Allowed Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSchedule.fees.map(entry => {
                    const code = CDT_BY_CODE[entry.cdtCode];
                    const isEdited = editedFees[entry.cdtCode] != null;
                    const displayVal = isEdited
                      ? editedFees[entry.cdtCode]
                      : (entry.allowedAmount / 100).toFixed(2);
                    return (
                      <tr key={entry.cdtCode} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-2.5 font-mono text-[#0891b2] text-xs font-medium">{entry.cdtCode}</td>
                        <td className="px-3 py-2.5 text-[#0f172a] text-xs">{code?.description ?? entry.cdtCode}</td>
                        <td className="px-3 py-2.5 text-right text-[#94a3b8] text-xs">
                          {code ? formatCurrency(code.defaultFee / 100) : '—'}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span className="text-xs text-[#94a3b8]">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={displayVal}
                              onChange={e => handleFeeChange(entry.cdtCode, e.target.value)}
                              className={[
                                'w-24 text-right border rounded-lg px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#0891b2]/30 focus:border-[#0891b2]',
                                isEdited ? 'border-[#0891b2] bg-[#f0f9ff] text-[#0891b2]' : 'border-gray-200',
                              ].join(' ')}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
