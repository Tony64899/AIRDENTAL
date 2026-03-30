// useAnalytics — fetches dashboard data and manages date range selection.
// Date range state lives here so all chart components share the same window.

import { useState, useEffect, useCallback } from 'react';
import * as analyticsService from '../services/analyticsService';
import type { DashboardData, DateRangePreset } from '../types/analytics';
import type { DateRange, LoadingState } from '../types/common';

// Build a DateRange from a preset label
function presetToDateRange(preset: DateRangePreset): DateRange {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { start, end: today };

    case 'this_week': {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() - start.getDay()); // Sunday
      return { start: weekStart, end: today };
    }

    case 'this_month': {
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      return { start: monthStart, end: today };
    }

    case 'last_month': {
      const lastMonthStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
      const lastMonthEnd   = new Date(start.getFullYear(), start.getMonth(), 0);
      lastMonthEnd.setHours(23, 59, 59, 999);
      return { start: lastMonthStart, end: lastMonthEnd };
    }

    case 'last_30_days':
    default: {
      const thirtyDaysAgo = new Date(start);
      thirtyDaysAgo.setDate(start.getDate() - 29);
      return { start: thirtyDaysAgo, end: today };
    }
  }
}

interface UseAnalyticsReturn {
  data:       DashboardData | null;
  loadState:  LoadingState;
  error:      string | null;
  preset:     DateRangePreset;
  dateRange:  DateRange;
  setPreset:  (preset: DateRangePreset) => void;
  refresh:    () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [preset,    setPresetState] = useState<DateRangePreset>('this_month');
  const [dateRange, setDateRange]   = useState<DateRange>(() => presetToDateRange('this_month'));
  const [data,      setData]        = useState<DashboardData | null>(null);
  const [loadState, setLoadState]   = useState<LoadingState>('idle');
  const [error,     setError]       = useState<string | null>(null);

  const fetchData = useCallback(async (range: DateRange) => {
    setLoadState('loading');
    setError(null);
    try {
      const result = await analyticsService.getDashboard(range);
      setData(result);
      setLoadState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      setLoadState('error');
    }
  }, []);

  // Fetch whenever dateRange changes
  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, fetchData]);

  // Update preset + recompute date range together
  const setPreset = useCallback((newPreset: DateRangePreset) => {
    if (newPreset !== 'custom') {
      setPresetState(newPreset);
      setDateRange(presetToDateRange(newPreset));
    }
  }, []);

  const refresh = useCallback(() => fetchData(dateRange), [dateRange, fetchData]);

  return { data, loadState, error, preset, dateRange, setPreset, refresh };
}
