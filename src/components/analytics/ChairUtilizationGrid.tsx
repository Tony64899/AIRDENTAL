// ChairUtilizationGrid — CSS Grid heatmap of chair occupancy by day × hour.
// No chart library: a 7-column × 13-row grid of colored divs.
// Color intensity: white (0%) → teal-100 → teal-400 → teal-700 (100%).

import { Fragment } from 'react';
import { Skeleton } from '../ui/Skeleton';
import type { ChairUtilizationCell } from '../../types/analytics';

interface ChairUtilizationGridProps {
  data: ChairUtilizationCell[];
  isLoading?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

function formatHour(h: number): string {
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

// Map 0–1 utilization to a background color in the teal palette
function utilizationColor(rate: number): string {
  if (rate === 0)    return 'rgba(241,245,249,1)';   // slate-100 — empty
  if (rate < 0.25)   return 'rgba(207,250,254,1)';   // cyan-100
  if (rate < 0.50)   return 'rgba(103,232,249,0.6)'; // cyan-300
  if (rate < 0.75)   return 'rgba(6,182,212,0.7)';   // cyan-500
  if (rate < 0.90)   return 'rgba(8,145,178,0.85)';  // cyan-600
  return 'rgba(14,116,144,1)';                        // cyan-700 — fully booked
}

function textColor(rate: number): string {
  return rate >= 0.5 ? '#ffffff' : '#0f172a';
}

export function ChairUtilizationGrid({ data, isLoading = false }: ChairUtilizationGridProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
        <Skeleton className="h-5 w-44 mb-1" />
        <Skeleton className="h-3 w-52 mb-6" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    );
  }

  // Build a fast lookup: `${dayOfWeek}-${hour}` → ChairUtilizationCell
  const lookup = new Map<string, ChairUtilizationCell>();
  for (const cell of data) {
    lookup.set(`${cell.dayOfWeek}-${cell.hour}`, cell);
  }

  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[#0f172a]">Chair Utilization</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Avg occupancy by day &amp; hour · darker = busier</p>
      </div>

      {/* Grid layout: hour labels in col 0, day columns 1–7 */}
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: '28px repeat(7, 1fr)' }}
      >
        {/* Header row: blank corner + day labels */}
        <div />
        {DAYS.map(day => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-[#94a3b8] pb-1"
          >
            {day}
          </div>
        ))}

        {/* Data rows — one per hour */}
        {HOURS.map(hour => (
          <Fragment key={hour}>
            {/* Hour label */}
            <div
              className="flex items-center justify-end pr-1.5 text-[10px] text-[#94a3b8] leading-none"
              style={{ height: 22 }}
            >
              {formatHour(hour)}
            </div>

            {/* Day cells */}
            {DAYS.map((_, dayIndex) => {
              const cell = lookup.get(`${dayIndex}-${hour}`);
              const rate = cell?.utilizationRate ?? 0;
              const count = cell?.appointmentCount ?? 0;

              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  title={count > 0 ? `${DAYS[dayIndex]} ${formatHour(hour)}: ${(rate * 100).toFixed(0)}% (${count} appt${count !== 1 ? 's' : ''})` : undefined}
                  className="rounded-sm transition-opacity hover:opacity-80 cursor-default"
                  style={{
                    height: 22,
                    backgroundColor: utilizationColor(rate),
                    color: textColor(rate),
                  }}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-[10px] text-[#94a3b8]">Empty</span>
        {[0, 0.2, 0.45, 0.7, 0.92].map(rate => (
          <div
            key={rate}
            className="w-5 h-3 rounded-sm"
            style={{ backgroundColor: utilizationColor(rate) }}
          />
        ))}
        <span className="text-[10px] text-[#94a3b8]">Full</span>
      </div>
    </div>
  );
}
