// CalendarHeader — top bar of the scheduler.
// Shows date navigation, Day/Week toggle, Privacy Mode button, and daily stats.
// ⚠️ HIPAA: Privacy Mode is UI-only — PHI remains in memory; audit logging still applies.
//            When Privacy Mode is ON, production/collection figures are hidden from view.

import { ChevronLeft, ChevronRight, Settings, Eye, EyeOff } from 'lucide-react';
import { formatDateLong } from '../../utils/dateUtils';

// Mock daily production/collection totals — Phase 4 will pull from real analytics.
const MOCK_DAILY = { production: 8_450, collection: 7_200 };

interface CalendarHeaderProps {
  currentDate:          Date;
  view:                 'day' | 'week';
  privacyMode:          boolean;
  onViewChange:         (view: 'day' | 'week') => void;
  onPreviousDay:        () => void;
  onNextDay:            () => void;
  onOpenTimeSettings:   () => void;
  onTogglePrivacyMode:  () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  privacyMode,
  onViewChange,
  onPreviousDay,
  onNextDay,
  onOpenTimeSettings,
  onTogglePrivacyMode,
}: CalendarHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between gap-4">

        {/* ── Left: title + date navigation ── */}
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold text-[#0f172a]">Schedule</h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPreviousDay}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4 text-[#475569]" />
            </button>
            <div className="text-sm text-[#475569] min-w-[240px] text-center">
              {formatDateLong(currentDate)}
            </div>
            <button
              onClick={onNextDay}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4 text-[#475569]" />
            </button>
          </div>
        </div>

        {/* ── Right: stats + privacy mode + view toggle + settings ── */}
        <div className="flex items-center gap-3">

          {/* Daily Production / Collection boxes — hidden when Privacy Mode is ON */}
          {!privacyMode && (
            <>
              <div className="bg-[#f0fdf4] border border-[#86efac] rounded-lg px-3 py-1.5 text-center">
                <div className="text-[9px] font-semibold text-[#16a34a] uppercase tracking-widest leading-none mb-0.5">
                  Production
                </div>
                <div className="text-sm font-bold text-[#15803d] leading-none">
                  ${MOCK_DAILY.production.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#eff6ff] border border-[#93c5fd] rounded-lg px-3 py-1.5 text-center">
                <div className="text-[9px] font-semibold text-[#2563eb] uppercase tracking-widest leading-none mb-0.5">
                  Collection
                </div>
                <div className="text-sm font-bold text-[#1d4ed8] leading-none">
                  ${MOCK_DAILY.collection.toLocaleString()}
                </div>
              </div>
            </>
          )}

          {/* Privacy Mode toggle */}
          <button
            onClick={onTogglePrivacyMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              privacyMode
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'text-[#64748b] hover:bg-gray-100'
            }`}
            title="Toggle Privacy Mode (P)"
          >
            {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="text-xs">Privacy</span>
            {privacyMode && (
              <span className="bg-amber-500/20 text-amber-600 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                ON
              </span>
            )}
          </button>

          {/* Day / Week toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                view === 'day'
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => onViewChange('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                view === 'week'
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Week
            </button>
          </div>

          {/* Time range settings */}
          <button
            onClick={onOpenTimeSettings}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Time range settings"
          >
            <Settings className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>

      </div>
    </div>
  );
}
