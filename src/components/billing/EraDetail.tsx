// EraDetail.tsx — full ERA breakdown with claim accordion and post action.
// ⚠️ HIPAA: Remittance data is PHI. Display only to billing-authorized users.

import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import type { RemittanceAdvice } from './types';
import { getRemittanceAdvices, postEra } from '../../services/billingService';
import { CARC_CODES } from './utils/carcCodes';
import { formatCurrency } from '../../utils/formatUtils';

interface EraDetailProps {
  eraId:  string;
  onBack: () => void;
  onPost: (eraId: string) => void;
}

export default function EraDetail({ eraId, onBack, onPost }: EraDetailProps) {
  const [era, setEra]             = useState<RemittanceAdvice | null>(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set(['0']));
  const [posting, setPosting]     = useState(false);
  const [posted, setPosted]       = useState(false);

  useEffect(() => {
    getRemittanceAdvices().then(eras => {
      const found = eras.find(e => e.id === eraId);
      if (found) {
        setEra(found);
        setPosted(found.posted);
        // Expand all by default
        setExpanded(new Set(found.claims.map((_, i) => String(i))));
      }
      setLoading(false);
    });
  }, [eraId]);

  const toggleExpanded = (idx: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handlePost = async () => {
    if (!era) return;
    setPosting(true);
    try {
      const updated = await postEra(era.id);
      setEra(updated);
      setPosted(true);
      onPost(era.id);
    } finally {
      setPosting(false);
    }
  };

  if (loading || !era) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748b] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-[#0f172a]">ERA from {era.payerName}</h2>
            <p className="text-xs text-[#64748b]">
              {era.checkNumber && <>Check #{era.checkNumber}&nbsp;&middot;&nbsp;</>}
              {era.checkDate && <>Date: {new Date(era.checkDate + 'T12:00:00').toLocaleDateString('en-US')}&nbsp;&middot;&nbsp;</>}
              Received: {new Date(era.receivedDate + 'T12:00:00').toLocaleDateString('en-US')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-semibold">Total Paid</p>
            <p className="text-xl font-bold text-[#0f172a]">{formatCurrency(era.totalPaid / 100)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-semibold">Claims</p>
            <p className="text-xl font-bold text-[#0f172a]">{era.claims.length}</p>
          </div>
        </div>
      </div>

      {/* Claims accordion */}
      <div className="space-y-3">
        {era.claims.map((ec, i) => {
          const isOpen = expanded.has(String(i));
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Accordion header */}
              <button
                onClick={() => toggleExpanded(String(i))}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="font-mono text-xs text-[#0891b2] font-medium">#{ec.claimId}</span>
                  <span className="font-medium text-[#0f172a]">{ec.patientName}</span>
                  <span className="text-xs text-[#64748b]">DOS: {new Date(ec.dateOfService + 'T12:00:00').toLocaleDateString('en-US')}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-4 text-sm">
                    <span className="text-[#64748b]">Chgd: <span className="font-medium text-[#0f172a]">{formatCurrency(ec.totalCharged / 100)}</span></span>
                    <span className="text-[#64748b]">Allwd: <span className="font-medium text-[#0f172a]">{formatCurrency(ec.totalAllowed / 100)}</span></span>
                    <span className="text-[#64748b]">Paid: <span className="font-bold text-green-700">{formatCurrency(ec.totalPaid / 100)}</span></span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#94a3b8]" /> : <ChevronDown className="w-4 h-4 text-[#94a3b8]" />}
                </div>
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                  {/* Line details table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Code</th>
                          <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Charged</th>
                          <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Allowed</th>
                          <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Paid</th>
                          <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2">Adj. Codes</th>
                          <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2">Adj. Amounts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ec.lineDetails.map((ld, j) => {
                          const hasDiscrepancy = ld.charged !== ld.allowed;
                          return (
                            <tr key={j} className={['border-b border-gray-100', hasDiscrepancy ? 'bg-amber-50' : ''].join(' ')}>
                              <td className="py-2 pr-3 font-mono text-[#0891b2] text-xs font-medium">{ld.cdtCode}</td>
                              <td className="py-2 pr-3 text-right">{formatCurrency(ld.charged / 100)}</td>
                              <td className={['py-2 pr-3 text-right', hasDiscrepancy ? 'text-amber-700 font-medium' : ''].join(' ')}>
                                {formatCurrency(ld.allowed / 100)}
                              </td>
                              <td className="py-2 pr-3 text-right text-green-700 font-bold">{formatCurrency(ld.paid / 100)}</td>
                              <td className="py-2">
                                {ld.adjustments.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {ld.adjustments.map((adj, k) => (
                                      <div key={k} className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600 font-mono">{adj.groupCode}-{adj.reasonCode}</span>
                                        <span className="text-xs text-[#64748b]">{CARC_CODES[adj.reasonCode] ?? adj.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[#94a3b8] text-xs">—</span>
                                )}
                              </td>
                              <td className="py-2 text-right">
                                {ld.adjustments.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {ld.adjustments.map((adj, k) => (
                                      <div key={k} className="text-xs text-amber-700">
                                        {formatCurrency(adj.amount / 100)}
                                      </div>
                                    ))}
                                  </div>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Claim-level adjustments */}
                  {ec.adjustments.length > 0 && (
                    <div className="bg-amber-50 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-amber-700 mb-2">Claim-Level Adjustments</p>
                      {ec.adjustments.map((adj, k) => (
                        <div key={k} className="flex items-center justify-between text-xs">
                          <span className="text-amber-700">
                            <span className="font-mono font-bold mr-2">{adj.groupCode}-{adj.reasonCode}</span>
                            {CARC_CODES[adj.reasonCode] ?? adj.description}
                          </span>
                          <span className="font-bold text-amber-700">{formatCurrency(adj.amount / 100)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Patient responsibility */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Patient Responsibility</p>
                      <p className="text-lg font-bold text-amber-700">{formatCurrency(ec.patientResponsibility / 100)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post Payment button */}
      <div className="flex justify-end">
        {posted ? (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-100 text-green-700 rounded-xl font-medium">
            <CheckCircle className="w-5 h-5" />
            ERA Posted — Payments Applied
          </div>
        ) : (
          <button
            onClick={handlePost}
            disabled={posting}
            className="px-6 py-3 bg-[#0891b2] text-white rounded-xl font-medium hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
          >
            {posting ? 'Posting Payments…' : 'Post Payment'}
          </button>
        )}
      </div>
    </div>
  );
}
