// ProductionChart — bar chart of daily production vs goal over the selected date range.
// Uses Recharts: ResponsiveContainer > ComposedChart > Bar (production) + Line (goal).

import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/formatUtils';
import type { DailyProduction } from '../../types/analytics';

interface ProductionChartProps {
  data: DailyProduction[];
  isLoading?: boolean;
}

// Custom tooltip shown on hover over a bar
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-[#0f172a] mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#64748b] capitalize">{entry.name}:</span>
          <span className="font-medium text-[#0f172a]">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductionChart({ data, isLoading = false }: ProductionChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-3 w-32 mb-6" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    );
  }

  // Format date strings to short display labels (e.g. "Mar 1")
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[#0f172a]">Daily Production</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Production vs daily goal</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(chartData.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            width={40}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(8,145,178,0.05)' }} />

          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={val => <span style={{ color: '#64748b' }}>{val}</span>}
          />

          {/* Goal reference line */}
          <ReferenceLine
            y={chartData[0]?.goal}
            stroke="#e2e8f0"
            strokeDasharray="4 2"
            label={{ value: 'Goal', fill: '#94a3b8', fontSize: 10, position: 'right' }}
          />

          {/* Production bars */}
          <Bar
            dataKey="production"
            name="Production"
            fill="#0891b2"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />

          {/* Goal line */}
          <Line
            dataKey="goal"
            name="Goal"
            stroke="#e2e8f0"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
