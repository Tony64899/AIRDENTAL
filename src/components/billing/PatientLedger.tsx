// PatientLedger.tsx — full treatment ledger for a patient.
// ⚠️ HIPAA: Treatment and financial data is PHI. Display only to authorized users.

import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { TreatmentEntry } from './types';
import { getTreatmentEntries } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatUtils';
import TreatmentEntryForm from './TreatmentEntryForm';

const PROVIDERS: Record<string, string> = {
  'prov-1': 'Dr. Sarah Chen',
  'prov-2': 'Dr. Michael Torres',
  'prov-3': 'Dr. Emily White',
  'prov-4': 'Dr. James Park',
};

const STATUS_BADGE: Record<string, string> = {
  planned:   'bg-gray-100 text-gray-600',
  completed: 'bg-blue-100 text-blue-700',
  billed:    'bg-amber-100 text-amber-700',
  paid:      'bg-green-100 text-green-700',
};

interface PatientLedgerProps {
  patientId: string;
  onCreateClaim?: (entries: TreatmentEntry[]) => void;
}

export default function PatientLedger({ patientId, onCreateClaim }: PatientLedgerProps) {
  const [entries, setEntries]           = useState<TreatmentEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [showForm, setShowForm]         = useState(false);
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [providerFilter, setProvFilter] = useState('all');

  const loadEntries = () => {
    setLoading(true);
    getTreatmentEntries(patientId).then(data => {
      setEntries(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    setSelected(new Set());
    loadEntries();
  }, [patientId]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo   && e.date > dateTo)   return false;
      if (providerFilter !== 'all' && e.providerId !== providerFilter) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo, providerFilter]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedEntries = useMemo(
    () => filtered.filter(e => selected.has(e.id) && (e.status === 'completed' || e.status === 'billed')),
    [filtered, selected]
  );

  // Running total
  const totals = useMemo(() => {
    let totalFee = 0, totalIns = 0, totalPt = 0;
    filtered.forEach(e => {
      totalFee += e.fee;
      totalIns += e.insurancePaid ?? 0;
      totalPt  += e.patientPaid  ?? 0;
    });
    return { totalFee, totalIns, totalPt, balance: totalFee - totalIns - totalPt };
  }, [filtered]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
          />
          <span className="text-xs text-[#94a3b8]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
          />
          <select
            value={providerFilter}
            onChange={e => setProvFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
          >
            <option value="all">All Providers</option>
            {Object.entries(PROVIDERS).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {selectedEntries.length > 0 && onCreateClaim && (
            <button
              onClick={() => onCreateClaim(selectedEntries)}
              className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Create Claim from Selected ({selectedEntries.length})
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Procedure
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-5 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-8 px-4 py-3" />
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3 whitespace-nowrap">Date</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Tooth</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Surf.</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Code</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Description</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Provider</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3 whitespace-nowrap">Fee</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3 whitespace-nowrap">Ins. Paid</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3 whitespace-nowrap">Pt. Paid</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Balance</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-sm text-[#94a3b8]">
                    No procedures found
                  </td>
                </tr>
              ) : (
                filtered.map(entry => {
                  const balance = entry.fee - (entry.insurancePaid ?? 0) - (entry.patientPaid ?? 0);
                  const selectable = entry.status === 'completed' || entry.status === 'billed';
                  return (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-center">
                        {selectable && (
                          <input
                            type="checkbox"
                            checked={selected.has(entry.id)}
                            onChange={() => toggleSelect(entry.id)}
                            className="accent-[#0891b2]"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[#64748b] whitespace-nowrap">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2.5 text-center">{entry.toothNumber ?? '—'}</td>
                      <td className="px-3 py-2.5 text-[#64748b] text-xs">{entry.surfaces?.join('') ?? '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-[#0891b2] text-xs font-medium">{entry.cdtCode}</td>
                      <td className="px-3 py-2.5 text-[#0f172a] max-w-[180px] truncate">{entry.description}</td>
                      <td className="px-3 py-2.5 text-[#64748b] whitespace-nowrap text-xs">{PROVIDERS[entry.providerId] ?? entry.providerId}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-[#0f172a]">{formatCurrency(entry.fee / 100)}</td>
                      <td className="px-3 py-2.5 text-right text-green-700">{entry.insurancePaid != null ? formatCurrency(entry.insurancePaid / 100) : '—'}</td>
                      <td className="px-3 py-2.5 text-right text-blue-700">{entry.patientPaid != null ? formatCurrency(entry.patientPaid / 100) : '—'}</td>
                      <td className={['px-3 py-2.5 text-right font-medium', balance > 0 ? 'text-amber-700' : 'text-green-700'].join(' ')}>
                        {formatCurrency(balance / 100)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_BADGE[entry.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={7} className="px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-widest">Total</td>
                  <td className="px-3 py-3 text-right font-bold text-[#0f172a]">{formatCurrency(totals.totalFee / 100)}</td>
                  <td className="px-3 py-3 text-right font-bold text-green-700">{formatCurrency(totals.totalIns / 100)}</td>
                  <td className="px-3 py-3 text-right font-bold text-blue-700">{formatCurrency(totals.totalPt / 100)}</td>
                  <td className={['px-3 py-3 text-right font-bold', totals.balance > 0 ? 'text-amber-700' : 'text-green-700'].join(' ')}>
                    {formatCurrency(totals.balance / 100)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Add procedure modal */}
      {showForm && (
        <TreatmentEntryForm
          patientId={patientId}
          onSave={saved => {
            setEntries(prev => [saved, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
