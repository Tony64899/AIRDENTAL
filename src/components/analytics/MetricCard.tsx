// MetricCard — large number KPI card with delta indicator.
// Used in the top row of the dashboard for key metrics at a glance.

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface MetricCardProps {
  title: string;
  value: string;         // pre-formatted string (e.g. "$330,000" or "78.4%")
  delta?: number;        // % change vs previous period (positive = good unless inverted)
  deltaLabel?: string;   // e.g. "vs last month"
  deltaInverted?: boolean; // true for metrics where lower = better (e.g. no-show rate)
  icon: React.ReactNode;
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  delta,
  deltaLabel = 'vs last month',
  deltaInverted = false,
  icon,
  isLoading = false,
}: MetricCardProps) {
  // Determine if the delta is positive or negative in sentiment
  const isPositive = deltaInverted ? (delta ?? 0) < 0 : (delta ?? 0) > 0;
  const isNeutral  = delta === 0 || delta === undefined;

  const DeltaIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const deltaColor = isNeutral
    ? 'text-[#64748b]'
    : isPositive
      ? 'text-[#059669]'
      : 'text-[#dc2626]';

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-3" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      {/* Icon + title */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#64748b]">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-[#f0f9ff] flex items-center justify-center text-[#0891b2]">
          {icon}
        </div>
      </div>

      {/* Primary value */}
      <div className="text-[28px] font-bold text-[#0f172a] leading-none tracking-tight">
        {value}
      </div>

      {/* Delta badge */}
      {delta !== undefined && (
        <div className={['flex items-center gap-1.5 text-xs font-medium', deltaColor].join(' ')}>
          <DeltaIcon className="w-3.5 h-3.5" />
          <span>
            {isNeutral ? 'No change' : `${Math.abs(delta).toFixed(1)}%`}
          </span>
          <span className="text-[#94a3b8] font-normal">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
