// InsightFeed — actionable AI-style insight cards sorted by priority.
// High priority insights show a red accent; medium = amber; low = slate.
// Each card has a category icon, title, description, impact badge, and CTA.

import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Clock, AlertTriangle, CalendarDays, FileText,
} from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import type { ActionableInsight, InsightPriority, InsightCategory } from '../../types/analytics';

interface InsightFeedProps {
  insights: ActionableInsight[];
  isLoading?: boolean;
}

const PRIORITY_ORDER: Record<InsightPriority, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_STYLES: Record<InsightPriority, { bar: string; badge: string; badgeText: string }> = {
  high:   { bar: 'bg-red-500',    badge: 'bg-red-50',    badgeText: 'text-red-600' },
  medium: { bar: 'bg-amber-400',  badge: 'bg-amber-50',  badgeText: 'text-amber-700' },
  low:    { bar: 'bg-slate-300',  badge: 'bg-slate-100', badgeText: 'text-slate-600' },
};

const CATEGORY_ICONS: Record<InsightCategory, React.ReactNode> = {
  revenue:     <TrendingUp  className="w-4 h-4" />,
  utilization: <Clock       className="w-4 h-4" />,
  no_show:     <AlertTriangle className="w-4 h-4" />,
  scheduling:  <CalendarDays className="w-4 h-4" />,
  insurance:   <FileText    className="w-4 h-4" />,
};

const CATEGORY_ICON_BG: Record<InsightCategory, string> = {
  revenue:     'bg-cyan-50 text-cyan-600',
  utilization: 'bg-violet-50 text-violet-600',
  no_show:     'bg-red-50 text-red-600',
  scheduling:  'bg-emerald-50 text-emerald-600',
  insurance:   'bg-amber-50 text-amber-600',
};

function InsightCard({ insight }: { insight: ActionableInsight }) {
  const navigate = useNavigate();
  const styles = PRIORITY_STYLES[insight.priority];

  function handleAction() {
    if (insight.actionRoute) navigate(insight.actionRoute);
  }

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-[rgba(0,0,0,0.06)] bg-white hover:shadow-sm transition-shadow relative overflow-hidden">
      {/* Priority accent bar on left edge */}
      <div className={['absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl', styles.bar].join(' ')} />

      {/* Category icon */}
      <div className={['mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center', CATEGORY_ICON_BG[insight.category]].join(' ')}>
        {CATEGORY_ICONS[insight.category]}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[#0f172a] leading-snug">{insight.title}</p>
          <span className={['flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide', styles.badge, styles.badgeText].join(' ')}>
            {insight.priority}
          </span>
        </div>
        <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{insight.description}</p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium text-[#059669]">{insight.impact}</span>
          {insight.actionRoute && (
            <button
              onClick={handleAction}
              className="text-xs font-semibold text-[#0891b2] hover:text-[#0e7490] transition-colors"
            >
              {insight.actionLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsightFeed({ insights, isLoading = false }: InsightFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
        <Skeleton className="h-5 w-36 mb-1" />
        <Skeleton className="h-3 w-48 mb-5" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl mb-2" />)}
      </div>
    );
  }

  const sorted = [...insights].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#0f172a]">Insights &amp; Recommendations</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Sorted by priority · {sorted.length} active</p>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-[#64748b] text-center py-6">No insights for this period.</p>
        )}
      </div>
    </div>
  );
}
