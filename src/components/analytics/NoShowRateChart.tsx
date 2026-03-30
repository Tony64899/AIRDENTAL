// NoShowRateChart — area chart of daily no-show rate over time.
// A dotted threshold line at 8% marks the industry benchmark.

import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { Skeleton } from '../ui/Skeleton';
import type { NoShowDataPoint } from '../../types/analytics';

interface NoShowRateChartProps {
  data: NoShowDataPoint[];
  isLoading?: boolean;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const rate = payload[0]?.value ?? 0;

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-[#0f172a] mb-1">{label}</p>
      <p className={['font-medium', rate > 0.08 ? 'text-[#dc2626]' : 'text-[#059669]'].join(' ')}>
        {(rate * 100).toFixed(1)}% no-show rate
      </p>
    </div>
  );
}

export function NoShowRateChart({ data, isLoading = false }: NoShowRateChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-3 w-48 mb-6" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ratePercent: d.rate,
  }));

  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[#0f172a]">No-Show Rate</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Daily rate · dashed line = 8% industry benchmark</p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="noShowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(chartData.length / 5)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            width={36}
            domain={[0, 0.2]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.08)' }} />

          {/* 8% industry benchmark */}
          <ReferenceLine
            y={0.08}
            stroke="#f59e0b"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: '8% benchmark', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }}
          />

          <Area
            type="monotone"
            dataKey="ratePercent"
            stroke="#dc2626"
            strokeWidth={2}
            fill="url(#noShowGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#dc2626' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
