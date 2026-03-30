// DashboardPage — Phase 2 Analytics Dashboard.
// Assembles all analytics components. Date range state lives here via useAnalytics().
// Layout: top metric cards → production chart + no-show chart → utilization + insights → provider table.

import { RefreshCw } from 'lucide-react';
import { DollarSign, CalendarCheck, UserX, BarChart2 } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../utils/formatUtils';

import { DateRangePicker }          from '../components/analytics/DateRangePicker';
import { MetricCard }               from '../components/analytics/MetricCard';
import { ProductionChart }          from '../components/analytics/ProductionChart';
import { NoShowRateChart }          from '../components/analytics/NoShowRateChart';
import { ChairUtilizationGrid }     from '../components/analytics/ChairUtilizationGrid';
import { InsightFeed }              from '../components/analytics/InsightFeed';
import { ProviderPerformanceTable } from '../components/analytics/ProviderPerformanceTable';
import { Alert }                    from '../components/ui/Alert';

export function DashboardPage() {
  const { data, loadState, error, preset, setPreset, refresh } = useAnalytics();

  const isLoading = loadState === 'loading' || loadState === 'idle';
  const summary   = data?.summary;

  // Pre-format metric values — show dash while loading
  const productionValue = summary
    ? formatCurrency(summary.totalProduction)
    : '—';

  const appointmentsValue = summary
    ? `${summary.completedAppointments} / ${summary.totalAppointments}`
    : '—';

  const noShowValue = summary
    ? `${(summary.noShowRate * 100).toFixed(1)}%`
    : '—';

  const utilizationValue = summary
    ? `${(summary.avgUtilization * 100).toFixed(0)}%`
    : '—';

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a]">Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Practice performance at a glance</p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker selected={preset} onChange={setPreset} />
          <button
            onClick={refresh}
            disabled={isLoading}
            aria-label="Refresh data"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(0,0,0,0.08)] text-[#64748b] hover:text-[#0f172a] hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={['w-4 h-4', isLoading ? 'animate-spin' : ''].join(' ')} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <Alert variant="error" title="Failed to load analytics">
          {error}
        </Alert>
      )}

      {/* Metric cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Production"
          value={productionValue}
          delta={summary?.productionDelta}
          icon={<DollarSign className="w-4 h-4" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Appointments"
          value={appointmentsValue}
          delta={summary?.appointmentsDelta}
          deltaLabel="vs last period"
          icon={<CalendarCheck className="w-4 h-4" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="No-Show Rate"
          value={noShowValue}
          delta={summary?.noShowDelta}
          deltaLabel="vs last period"
          deltaInverted
          icon={<UserX className="w-4 h-4" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Chair Utilization"
          value={utilizationValue}
          delta={summary?.utilizationDelta}
          deltaLabel="vs last period"
          icon={<BarChart2 className="w-4 h-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Production + No-Show row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ProductionChart data={data?.dailyProduction ?? []} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <NoShowRateChart data={data?.noShowTrend ?? []} isLoading={isLoading} />
        </div>
      </div>

      {/* Chair utilization + Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ChairUtilizationGrid data={data?.chairUtilization ?? []} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <InsightFeed insights={data?.insights ?? []} isLoading={isLoading} />
        </div>
      </div>

      {/* Full-width provider table */}
      <ProviderPerformanceTable data={data?.providerMetrics ?? []} isLoading={isLoading} />

    </div>
  );
}
