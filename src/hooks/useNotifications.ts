// useNotifications — state management for the notification module.
// ⚠️ HIPAA: Notification data contains PHI. Never log or expose to non-authenticated clients.

import { useState, useEffect, useCallback } from 'react';
import type { LoadingState } from '../types/common';
import type {
  NotificationSettings,
  MessageTemplate,
  NotificationLog,
  NotificationStatus,
  NotificationType,
} from '../types/notification';
import {
  getSettings,
  updateSettings,
  getTemplates,
  updateTemplate,
  getLogs,
  retryNotification,
  getNotificationKpis,
} from '../services/notificationService';

interface UseNotificationsReturn {
  // Settings
  settings:        NotificationSettings | null;
  settingsLoading: LoadingState;
  saveSettings:    (updates: Partial<NotificationSettings>) => Promise<void>;

  // Templates
  templates:        MessageTemplate[];
  templatesLoading: LoadingState;
  saveTemplate:     (id: string, updates: Partial<MessageTemplate>) => Promise<void>;

  // Logs
  logs:         NotificationLog[];
  logsLoading:  LoadingState;
  logFilter:    { status?: NotificationStatus; type?: NotificationType };
  setLogFilter: (f: { status?: NotificationStatus; type?: NotificationType }) => void;
  retryLog:     (id: string) => Promise<void>;
  refreshLogs:  () => void;

  // KPIs
  kpis: { sentToday: number; deliveryRate: number; failedCount: number; optedOutCount: number } | null;

  // Toast state
  toast:      { message: string; type: 'success' | 'error' } | null;
  clearToast: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [settings,        setSettings]        = useState<NotificationSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState<LoadingState>('idle');

  const [templates,        setTemplates]        = useState<MessageTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState<LoadingState>('idle');

  const [logs,        setLogs]        = useState<NotificationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<LoadingState>('idle');
  const [logFilter,   setLogFilter]   = useState<{ status?: NotificationStatus; type?: NotificationType }>({});

  const [kpis, setKpis] = useState<{ sentToday: number; deliveryRate: number; failedCount: number; optedOutCount: number } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-clear toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load settings on mount
  useEffect(() => {
    setSettingsLoading('loading');
    getSettings()
      .then(data => { setSettings(data); setSettingsLoading('success'); })
      .catch(() => setSettingsLoading('error'));
  }, []);

  // Load templates on mount
  useEffect(() => {
    setTemplatesLoading('loading');
    getTemplates()
      .then(data => { setTemplates(data); setTemplatesLoading('success'); })
      .catch(() => setTemplatesLoading('error'));
  }, []);

  // Load KPIs on mount
  useEffect(() => {
    getNotificationKpis()
      .then(data => setKpis(data))
      .catch(() => {/* silently fail for KPIs */});
  }, []);

  // Load logs (re-runs when filter changes)
  const fetchLogs = useCallback(() => {
    setLogsLoading('loading');
    getLogs(logFilter)
      .then(data => { setLogs(data); setLogsLoading('success'); })
      .catch(() => setLogsLoading('error'));
  }, [logFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const saveSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    try {
      const updated = await updateSettings(updates);
      setSettings(updated);
      setToast({ message: 'Settings saved successfully.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save settings. Please try again.', type: 'error' });
    }
  }, []);

  const saveTemplate = useCallback(async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const updated = await updateTemplate(id, updates);
      setTemplates(prev => prev.map(t => t.id === id ? updated : t));
      setToast({ message: 'Template saved successfully.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save template. Please try again.', type: 'error' });
    }
  }, []);

  const retryLog = useCallback(async (id: string) => {
    try {
      await retryNotification(id);
      fetchLogs();
      setToast({ message: 'Notification queued for retry.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to retry notification. Please try again.', type: 'error' });
    }
  }, [fetchLogs]);

  const clearToast = useCallback(() => setToast(null), []);

  return {
    settings,
    settingsLoading,
    saveSettings,

    templates,
    templatesLoading,
    saveTemplate,

    logs,
    logsLoading,
    logFilter,
    setLogFilter,
    retryLog,
    refreshLogs: fetchLogs,

    kpis,

    toast,
    clearToast,
  };
}
