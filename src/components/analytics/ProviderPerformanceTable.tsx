// ProviderPerformanceTable — sortable table of per-provider KPIs.
// Columns: Provider, Appts, Completed, Production, Avg/Appt, No-Show Rate, Utilization.

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/formatUtils';
import type { ProviderMetrics } from '../../types/analytics';

interface ProviderPerformanceTableProps {
  data: ProviderMetrics[];
  isLoading?: boolean;
}

type SortKey = keyof Pick<
  ProviderMetrics,
  'providerName' | 'appointments' | 'completedAppointments' | 'production' | 'avgPerAppointment' | 'noShowRate' | 'utilizationRate'
>;

function SortIcon({ column, sortKey, direction }: { column: SortKey; sortKey: SortKey; direction: 'asc' | 'desc' }) {
  if (column !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return direction === 'asc'
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />;
}

function UtilizationBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const color = pct >= 80 ? '#0891b2' : pct >= 50 ? '#0ea5e9' : '#bae6fd';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden" style={{ minWidth: 48 }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-[#64748b] w-8 text-right">{pct}%</span>
    </div>
  );
}

function NoShowPill({ rate }: { rate: number }) {
  const pct = (rate * 100).toFixed(1);
  const isHigh = rate > 0.08;
  return (
    <span
      className={[
        'inline-block px-1.5 py-0.5 rounded text-xs font-medium',
        isHigh ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700',
      ].join(' ')}
    >
      {pct}%
    </span>
  );
}

export function ProviderPerformanceTable({ data, isLoading = false }: ProviderPerformanceTableProps) {
  const [sortKey, setSortKey]         = useState<SortKey>('production');
  const [sortDirection, setDirection] = useState<'asc' | 'desc'>('desc');

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-3 w-40 mb-5" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full mb-2 rounded-lg" />)}
      </div>
    );
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setDirection('desc');
    }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === 'string'
      ? (av as string).localeCompare(bv as string)
      : (av as number) - (bv as number);
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const columns: { key: SortKey; label: string; align: 'left' | 'right' | 'center' }[] = [
    { key: 'providerName',           label: 'Provider',     align: 'left' },
    { key: 'appointments',           label: 'Appts',        align: 'right' },
    { key: 'completedAppointments',  label: 'Completed',    align: 'right' },
    { key: 'production',             label: 'Production',   align: 'right' },
    { key: 'avgPerAppointment',      label: 'Avg / Appt',   align: 'right' },
    { key: 'noShowRate',             label: 'No-Show',      align: 'center' },
    { key: 'utilizationRate',        label: 'Utilization',  align: 'left' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[#0f172a]">Provider Performance</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Click column header to sort</p>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={[
                    'px-3 py-2 text-xs font-semibold text-[#64748b] select-none cursor-pointer',
                    'border-b border-[rgba(0,0,0,0.06)] hover:text-[#0f172a] transition-colors',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon column={col.key} sortKey={sortKey} direction={sortDirection} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.providerId}
                className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}
              >
                <td className="px-3 py-2.5 font-medium text-[#0f172a] whitespace-nowrap">{row.providerName}</td>
                <td className="px-3 py-2.5 text-right text-[#64748b]">{row.appointments}</td>
                <td className="px-3 py-2.5 text-right text-[#64748b]">{row.completedAppointments}</td>
                <td className="px-3 py-2.5 text-right font-medium text-[#0f172a]">{formatCurrency(row.production)}</td>
                <td className="px-3 py-2.5 text-right text-[#64748b]">{formatCurrency(row.avgPerAppointment)}</td>
                <td className="px-3 py-2.5 text-center">
                  <NoShowPill rate={row.noShowRate} />
                </td>
                <td className="px-3 py-2.5" style={{ minWidth: 120 }}>
                  <UtilizationBar rate={row.utilizationRate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
