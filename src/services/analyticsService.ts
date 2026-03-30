// Analytics service — returns realistic mock dental practice data.
// All numbers reflect a typical 4-provider general dentistry practice.
// TODO (backend phase): Replace mock functions with apiFetch() calls to NestJS endpoints.

import type {
  DashboardData,
  DailyProduction,
  ProviderMetrics,
  ChairUtilizationCell,
  NoShowDataPoint,
  ActionableInsight,
  DashboardSummary,
} from '../types/analytics';
import type { DateRange } from '../types/common';
import { ROUTES } from '../constants/routes';

// Simulate network latency for realistic loading states
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock data generators ---

// Generates 30 days of daily production data ending today
function generateDailyProduction(days: number): DailyProduction[] {
  const data: DailyProduction[] = [];
  const today = new Date();
  const dailyGoal = 8500; // $8,500 daily production goal for 4 providers

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayOfWeek = date.getDay();
    // No production on Sundays; lower on Saturdays
    if (dayOfWeek === 0) continue;

    // Realistic variance: some days hit goal, some are below
    const variance = 0.65 + Math.random() * 0.55; // 65%–120% of goal
    const saturdayMultiplier = dayOfWeek === 6 ? 0.45 : 1;
    const production = Math.round(dailyGoal * variance * saturdayMultiplier);

    // Appointments: typically 12–22 per day across 4 providers
    const appointments = dayOfWeek === 6
      ? Math.floor(4 + Math.random() * 6)
      : Math.floor(12 + Math.random() * 10);

    data.push({
      date: date.toISOString().split('T')[0],
      production,
      goal: dayOfWeek === 6 ? Math.round(dailyGoal * 0.45) : dailyGoal,
      appointments,
    });
  }
  return data;
}

// Chair utilization heatmap: 7 days × 13 hours (7am–7pm)
function generateChairUtilization(): ChairUtilizationCell[] {
  const cells: ChairUtilizationCell[] = [];

  for (let day = 0; day <= 6; day++) {
    for (let hour = 7; hour <= 19; hour++) {
      let base = 0;

      if (day === 0) { base = 0; }  // Sunday: closed
      else if (day === 6) {          // Saturday: half-day
        base = hour >= 8 && hour <= 13 ? 0.45 + Math.random() * 0.3 : 0;
      } else {
        // Weekdays: peak hours 9–11am and 2–4pm
        if (hour < 8 || hour > 18) base = 0;
        else if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
          base = 0.70 + Math.random() * 0.25; // 70–95%
        } else if (hour === 8 || hour === 17 || hour === 18) {
          base = 0.40 + Math.random() * 0.25; // 40–65%
        } else {
          // Tuesday/Wednesday 2–4pm: known low utilization (insight target)
          const lowDay = (day === 2 || day === 3) && hour >= 14 && hour <= 16;
          base = lowDay ? 0.25 + Math.random() * 0.2 : 0.55 + Math.random() * 0.25;
        }
      }

      cells.push({
        dayOfWeek: day,
        hour,
        utilizationRate: Math.min(1, base),
        appointmentCount: Math.round(base * 4), // up to 4 chairs
      });
    }
  }
  return cells;
}

// 30-day no-show trend
function generateNoShowTrend(days: number): NoShowDataPoint[] {
  const data: NoShowDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue;

    const totalScheduled = Math.floor(14 + Math.random() * 8);
    const noShows = Math.floor(Math.random() * 3); // 0–2 no-shows per day
    data.push({
      date: date.toISOString().split('T')[0],
      noShows,
      totalScheduled,
      rate: noShows / totalScheduled,
    });
  }
  return data;
}

// Provider performance table
function generateProviderMetrics(): ProviderMetrics[] {
  return [
    {
      providerId: 'prov-1',
      providerName: 'Dr. Sarah Chen',
      appointments: 187,
      completedAppointments: 174,
      production: 68_400,
      avgPerAppointment: 393,
      noShowCount: 13,
      noShowRate: 0.07,
      utilizationRate: 0.82,
    },
    {
      providerId: 'prov-2',
      providerName: 'Dr. Michael Torres',
      appointments: 162,
      completedAppointments: 148,
      production: 91_200,
      avgPerAppointment: 616,
      noShowCount: 14,
      noShowRate: 0.086,
      utilizationRate: 0.76,
    },
    {
      providerId: 'prov-3',
      providerName: 'Dr. Emily White',
      appointments: 201,
      completedAppointments: 190,
      production: 57_800,
      avgPerAppointment: 304,
      noShowCount: 11,
      noShowRate: 0.055,
      utilizationRate: 0.88,
    },
    {
      providerId: 'prov-4',
      providerName: 'Dr. James Park',
      appointments: 143,
      completedAppointments: 129,
      production: 112_600,
      avgPerAppointment: 873,
      noShowCount: 14,
      noShowRate: 0.098,
      utilizationRate: 0.69,
    },
  ];
}

// Actionable insights — the app's key differentiator
function generateInsights(): ActionableInsight[] {
  return [
    {
      id: 'ins-1',
      category: 'utilization',
      priority: 'high',
      title: 'Tue–Wed 2–4 PM consistently underbooked',
      description:
        'Chair utilization drops to 25–35% on Tuesday and Wednesday afternoons. ' +
        'Opening these slots to hygiene recall patients could recover significant production.',
      impact: 'Potential +$3,200/month',
      actionLabel: 'Open Schedule',
      actionRoute: ROUTES.SCHEDULE,
    },
    {
      id: 'ins-2',
      category: 'no_show',
      priority: 'high',
      title: 'Dr. Park no-show rate above 9%',
      description:
        'Dr. Park\'s no-show rate (9.8%) is nearly double Dr. White\'s (5.5%). ' +
        'Sending a 2-hour SMS reminder for his appointments has reduced no-shows by 40% in comparable practices.',
      impact: 'Recover ~$8,700/month',
      actionLabel: 'Set Up Reminders',
      actionRoute: ROUTES.NOTIFICATIONS,
    },
    {
      id: 'ins-3',
      category: 'revenue',
      priority: 'medium',
      title: 'Production goal missed 4 of last 5 Mondays',
      description:
        'Monday production averages 71% of goal. This is commonly caused by weekend cancellations ' +
        'that don\'t get filled. Consider a same-day call list for Monday slots.',
      impact: 'Potential +$1,800/month',
      actionLabel: 'View Schedule',
      actionRoute: ROUTES.SCHEDULE,
    },
    {
      id: 'ins-4',
      category: 'insurance',
      priority: 'medium',
      title: '14 claims pending for 30+ days',
      description:
        'You have 14 insurance claims that have been pending for over 30 days without a response. ' +
        'Following up on these could unlock $12,400 in outstanding reimbursements.',
      impact: '$12,400 outstanding',
      actionLabel: 'View Claims',
      actionRoute: ROUTES.BILLING,
    },
    {
      id: 'ins-5',
      category: 'scheduling',
      priority: 'low',
      title: 'Dr. Torres averaging 38-min appointments',
      description:
        'Dr. Torres consistently finishes root canals in less time than the 60-min blocks scheduled. ' +
        'Adjusting his template to 45-minute blocks could open 2–3 additional slots per day.',
      impact: 'Potential +$1,200/day',
      actionLabel: 'View Schedule',
      actionRoute: ROUTES.SCHEDULE,
    },
  ];
}

// Compute summary from generated data
function computeSummary(
  dailyProduction: DailyProduction[],
  providerMetrics: ProviderMetrics[],
  noShowTrend: NoShowDataPoint[],
  utilization: ChairUtilizationCell[],
): DashboardSummary {
  const totalProduction  = providerMetrics.reduce((sum, p) => sum + p.production, 0);
  const productionGoal   = 8_500 * 22; // 22 working days/month

  const totalAppointments     = providerMetrics.reduce((sum, p) => sum + p.appointments, 0);
  const completedAppointments = providerMetrics.reduce((sum, p) => sum + p.completedAppointments, 0);

  const totalNoShows    = noShowTrend.reduce((sum, d) => sum + d.noShows, 0);
  const totalScheduled  = noShowTrend.reduce((sum, d) => sum + d.totalScheduled, 0);
  const noShowRate      = totalNoShows / totalScheduled;

  const weekdayCells    = utilization.filter(c => c.dayOfWeek > 0 && c.dayOfWeek < 6 && c.utilizationRate > 0);
  const avgUtilization  = weekdayCells.reduce((sum, c) => sum + c.utilizationRate, 0) / weekdayCells.length;

  return {
    totalProduction,
    productionGoal,
    productionDelta: 8.4,       // % vs last month (mock)
    totalAppointments,
    completedAppointments,
    appointmentsDelta: 5.2,
    noShowRate,
    noShowDelta: -1.3,          // negative = improved (fewer no-shows)
    avgUtilization,
    utilizationDelta: 3.1,
  };
}

// --- Public API ---

export async function getDashboard(_dateRange?: DateRange): Promise<DashboardData> {
  await delay(600); // simulate realistic API latency

  const dailyProduction  = generateDailyProduction(30);
  const providerMetrics  = generateProviderMetrics();
  const chairUtilization = generateChairUtilization();
  const noShowTrend      = generateNoShowTrend(30);
  const insights         = generateInsights();
  const summary          = computeSummary(dailyProduction, providerMetrics, noShowTrend, chairUtilization);

  return { summary, dailyProduction, providerMetrics, chairUtilization, noShowTrend, insights };
}
