// Analytics types — used by the Dashboard (Phase 2) and reporting features.
// These models are aggregations of appointment + billing data.

// --- Date range preset labels ---
export type DateRangePreset = 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_30_days' | 'custom';

// --- Core metric types ---

// Single day's production data (used in bar chart)
export interface DailyProduction {
  date: string;         // "2026-03-29" ISO date
  production: number;   // $ collected / billed
  goal: number;         // daily production goal
  appointments: number; // count of completed appointments
}

// Provider-level performance summary
export interface ProviderMetrics {
  providerId: string;
  providerName: string;
  appointments: number;
  completedAppointments: number;
  production: number;
  avgPerAppointment: number;
  noShowCount: number;
  noShowRate: number;     // 0–1 decimal (e.g. 0.08 = 8%)
  utilizationRate: number; // 0–1 decimal
}

// Chair utilization — one cell per hour per day of week
export interface ChairUtilizationCell {
  dayOfWeek: number;    // 0 = Sunday … 6 = Saturday
  hour: number;         // 7–19 (7am – 7pm)
  utilizationRate: number; // 0–1 decimal
  appointmentCount: number;
}

// No-show trend — one data point per day
export interface NoShowDataPoint {
  date: string;
  noShows: number;
  totalScheduled: number;
  rate: number;           // 0–1 decimal
}

// A single actionable insight surfaced by the analytics engine
export type InsightPriority = 'high' | 'medium' | 'low';
export type InsightCategory = 'revenue' | 'utilization' | 'no_show' | 'scheduling' | 'insurance';

export interface ActionableInsight {
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  impact: string;         // e.g. "Potential +$2,400/month"
  actionLabel: string;    // e.g. "Open Schedule"
  actionRoute?: string;   // route to navigate to
}

// Top-level summary metrics for the metric cards row
export interface DashboardSummary {
  // Production
  totalProduction: number;
  productionGoal: number;
  productionDelta: number;    // % change vs previous period

  // Appointments
  totalAppointments: number;
  completedAppointments: number;
  appointmentsDelta: number;

  // No-shows
  noShowRate: number;         // 0–1 decimal
  noShowDelta: number;        // change in rate vs previous period

  // Chair utilization
  avgUtilization: number;     // 0–1 decimal
  utilizationDelta: number;
}

// Full dashboard data bundle — returned by analyticsService.getDashboard()
export interface DashboardData {
  summary: DashboardSummary;
  dailyProduction: DailyProduction[];
  providerMetrics: ProviderMetrics[];
  chairUtilization: ChairUtilizationCell[];
  noShowTrend: NoShowDataPoint[];
  insights: ActionableInsight[];
}
