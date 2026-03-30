// ClaimsDashboard.tsx — main billing claims list with KPI bar and status filters.
// ⚠️ HIPAA: All claim data is PHI. Render only for authenticated, authorized users.

import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Clock, AlertCircle, FileText, Plus } from 'lucide-react';
import type { Claim, ClaimStatus } from './types';
import { getClaims, getBillingKpis } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatUtils';

interface ClaimsDashboardProps {
  onViewClaim:    (claimId: string) => void;
  onCreateClaim?: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-600',
  ready:        'bg-blue-100 text-blue-700',
  submitted:    'bg-indigo-100 text-indigo-700',
  acknowledged: 'bg-cyan-100 text-cyan-700',
  pending:      'bg-amber-100 text-amber-700',
  paid:         'bg-green-100 text-green-700',
  denied:       'bg-red-100 text-red-700',
  rejected:     'bg-red-100 text-red-700',
  appealed:     'bg-orange-100 text-orange-700',
};

const TABS: { id: ClaimStatus | 'all'; label: string }[] = [
  { id: 'all',       label: 'All'       },
  { id: 'draft',     label: 'Draft'     },
  { id: 'submitted', label: 'Submitted' },
  { id: 'pending',   label: 'Pending'   },
  { id: 'paid',      label: 'Paid'      },
  { id: 'denied',    label: 'Denied'    },
];

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function DaysOutBadge({ days }: { days: number }) {
  const color = days < 30 ? 'bg-green-100 text-green-700' : days <= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${color}`}>
      {days}d
    </span>
  );
}

export default function ClaimsDashboard({ onViewClaim, onCreateClaim }: ClaimsDashboardProps) {
  const [claims, setClaims]   = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<ClaimStatus | 'all'>('all');
  const [kpis, setKpis]       = useState({ totalOutstanding: 0, avgDaysToPayment: 0, denialRate: 0, claimsPending: 0 });

  useEffect(() => {
    Promise.all([
      getClaims(),
      getBillingKpis(),
    ]).then(([claimsData, kpisData]) => {
      setClaims(claimsData);
      setKpis(kpisData);
      setLoading(false);
    });
  }, []);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: claims.length };
    TABS.slice(1).forEach(t => {
      counts[t.id] = claims.filter(c => c.status === t.id).length;
    });
    return counts;
  }, [claims]);

  const filtered = useMemo(() => {
    if (tab === 'all') return claims;
    return claims.filter(c => c.status === tab);
  }, [claims, tab]);

  return (
    <div>
      {/* KPI bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Outstanding</p>
            <p className="text-lg font-bold text-[#0f172a] leading-tight">{formatCurrency(kpis.totalOutstanding / 100)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Avg Days to Pay</p>
            <p className="text-lg font-bold text-[#0f172a] leading-tight">{kpis.avgDaysToPayment}d</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Denial Rate</p>
            <p className="text-lg font-bold text-[#0f172a] leading-tight">{kpis.denialRate}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Pending</p>
            <p className="text-lg font-bold text-[#0f172a] leading-tight">{kpis.claimsPending}</p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-200">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors',
                  tab === t.id
                    ? 'bg-[#e0f2fe] text-[#0891b2] font-semibold'
                    : 'text-[#64748b] hover:bg-gray-50',
                ].join(' ')}
              >
                {t.label}
                <span className={[
                  'inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold',
                  tab === t.id ? 'bg-[#0891b2] text-white' : 'bg-gray-200 text-gray-600',
                ].join(' ')}>
                  {tabCounts[t.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
          {onCreateClaim && (
            <button
              onClick={onCreateClaim}
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] transition-colors"
            >
              <Plus className="w-4 h-4" /> New Claim
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-5 py-3">Claim ID</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Insurance</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Submitted</th>
                  <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Amount</th>
                  <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Status</th>
                  <th className="text-center text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Days Out</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-sm text-[#94a3b8]">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  filtered.map(claim => {
                    const days = claim.dateSubmitted ? daysAgo(claim.dateSubmitted) : 0;
                    return (
                      <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-xs text-[#0891b2] font-medium">#{claim.id}</td>
                        <td className="px-3 py-3 text-[#0f172a] font-medium">{claim.patientName}</td>
                        <td className="px-3 py-3 text-[#64748b] text-xs">{claim.insuranceName}</td>
                        <td className="px-3 py-3 text-[#64748b] text-xs whitespace-nowrap">
                          {claim.dateSubmitted
                            ? new Date(claim.dateSubmitted + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-[#0f172a]">{formatCurrency(claim.totalCharged / 100)}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_BADGE[claim.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {claim.dateSubmitted ? <DaysOutBadge days={days} /> : <span className="text-[#94a3b8]">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => onViewClaim(claim.id)}
                            className="text-xs text-[#0891b2] hover:text-[#0e7490] font-medium whitespace-nowrap"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
