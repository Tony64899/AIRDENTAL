// EraProcessor.tsx — ERA / EOB list view.
// ⚠️ HIPAA: Remittance data is PHI. Display only to billing-authorized users.

import { useState, useEffect, useMemo } from 'react';
import { Receipt } from 'lucide-react';
import type { RemittanceAdvice } from './types';
import { getRemittanceAdvices, postEra } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatUtils';

interface EraProcessorProps {
  onViewEra: (eraId: string) => void;
}

export default function EraProcessor({ onViewEra }: EraProcessorProps) {
  const [eras, setEras]       = useState<RemittanceAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState<string | null>(null);

  useEffect(() => {
    getRemittanceAdvices().then(data => {
      setEras(data);
      setLoading(false);
    });
  }, []);

  const summary = useMemo(() => {
    const unposted = eras.filter(e => !e.posted).length;
    const total    = eras.reduce((s, e) => s + e.totalPaid, 0);
    const now = new Date();
    const thisMonth = eras
      .filter(e => {
        const d = new Date(e.receivedDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, e) => s + e.totalPaid, 0);
    return { unposted, total, thisMonth };
  }, [eras]);

  const handlePost = async (eraId: string) => {
    setPosting(eraId);
    try {
      const updated = await postEra(eraId);
      setEras(prev => prev.map(e => e.id === eraId ? updated : e));
    } finally {
      setPosting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Unposted ERAs</p>
          <p className="text-2xl font-bold text-amber-600">{summary.unposted}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Total Received</p>
          <p className="text-2xl font-bold text-[#0f172a]">{formatCurrency(summary.total / 100)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">This Month</p>
          <p className="text-2xl font-bold text-[#0891b2]">{formatCurrency(summary.thisMonth / 100)}</p>
        </div>
      </div>

      {/* ERA table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <Receipt className="w-4 h-4 text-[#0891b2]" />
          <h2 className="text-sm font-semibold text-[#0f172a]">Electronic Remittance Advices</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-5 py-3">ERA ID</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Payer</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Received</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Check #</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Check Date</th>
                  <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Total Paid</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {eras.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-sm text-[#94a3b8]">No ERAs received</td>
                  </tr>
                ) : (
                  eras.map(era => (
                    <tr key={era.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-[#0891b2] font-medium">{era.id}</td>
                      <td className="px-3 py-3 text-[#0f172a] font-medium">{era.payerName}</td>
                      <td className="px-3 py-3 text-[#64748b] text-xs whitespace-nowrap">
                        {new Date(era.receivedDate + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-[#64748b]">{era.checkNumber ?? '—'}</td>
                      <td className="px-3 py-3 text-[#64748b] text-xs whitespace-nowrap">
                        {era.checkDate ? new Date(era.checkDate + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-[#0f172a]">{formatCurrency(era.totalPaid / 100)}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${era.posted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {era.posted ? 'Posted' : 'Unposted'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewEra(era.id)}
                            className="text-xs text-[#0891b2] hover:text-[#0e7490] font-medium"
                          >
                            Review
                          </button>
                          {!era.posted && (
                            <button
                              onClick={() => handlePost(era.id)}
                              disabled={posting === era.id}
                              className="text-xs px-2.5 py-1 bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
                            >
                              {posting === era.id ? 'Posting…' : 'Post Payment'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
