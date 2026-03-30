// notificationService — mock notification CRUD with 200ms simulated delay.
// ⚠️ HIPAA: All notification data is PHI. Production requires encrypted transit (TLS 1.3).
//
// TODO: Replace all mock responses with real API calls:
//   GET  /api/settings/notifications
//   PUT  /api/settings/notifications
//   GET  /api/notifications/templates
//   PUT  /api/notifications/templates/:id
//   GET  /api/notifications/logs
//   POST /api/notifications/:id/retry
//   POST /api/notifications/test
//   GET  /api/patients/:id/notification-prefs
//   PUT  /api/patients/:id/notification-prefs

import type {
  NotificationSettings,
  MessageTemplate,
  NotificationLog,
  NotificationStatus,
  NotificationType,
  PatientNotificationPrefs,
} from '../types/notification';

import {
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_TEMPLATES,
  MOCK_NOTIFICATION_LOGS,
  MOCK_PATIENT_PREFS_MAP,
} from '../constants/mockNotifications';

// ── In-memory mutable copies ───────────────────────────────────────────────
let _settings: NotificationSettings = structuredClone(MOCK_NOTIFICATION_SETTINGS);
let _templates: MessageTemplate[]   = structuredClone(MOCK_TEMPLATES);
let _logs: NotificationLog[]        = structuredClone(MOCK_NOTIFICATION_LOGS);
const _patientPrefs: Record<string, PatientNotificationPrefs> = structuredClone(MOCK_PATIENT_PREFS_MAP);

const delay = (ms = 200) => new Promise<void>(resolve => setTimeout(resolve, ms));

// ── Template rendering utility ─────────────────────────────────────────────
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(k, v), template);
}

// ── Settings ───────────────────────────────────────────────────────────────
export async function getSettings(): Promise<NotificationSettings> {
  await delay();
  return structuredClone(_settings);
}

export async function updateSettings(updates: Partial<NotificationSettings>): Promise<NotificationSettings> {
  await delay();
  _settings = { ...structuredClone(_settings), ...updates, updatedAt: new Date().toISOString() };
  return structuredClone(_settings);
}

// ── Templates ──────────────────────────────────────────────────────────────
export async function getTemplates(): Promise<MessageTemplate[]> {
  await delay();
  return structuredClone(_templates);
}

export async function updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
  await delay();
  const idx = _templates.findIndex(t => t.id === id);
  if (idx === -1) throw new Error(`Template not found: ${id}`);
  _templates[idx] = { ..._templates[idx], ...updates, updatedAt: new Date().toISOString() };
  return structuredClone(_templates[idx]);
}

// ── Logs ───────────────────────────────────────────────────────────────────
export async function getLogs(filter?: {
  status?:    NotificationStatus;
  type?:      NotificationType;
  patientId?: string;
  dateFrom?:  string;
  dateTo?:    string;
}): Promise<NotificationLog[]> {
  await delay();
  let result = structuredClone(_logs);

  if (filter) {
    if (filter.status)    result = result.filter(l => l.status === filter.status);
    if (filter.type)      result = result.filter(l => l.type === filter.type);
    if (filter.patientId) result = result.filter(l => l.patientId === filter.patientId);
    if (filter.dateFrom)  result = result.filter(l => l.appointmentDate >= filter.dateFrom!);
    if (filter.dateTo)    result = result.filter(l => l.appointmentDate <= filter.dateTo!);
  }

  return result;
}

export async function retryNotification(id: string): Promise<NotificationLog> {
  await delay();
  const idx = _logs.findIndex(l => l.id === id);
  if (idx === -1) throw new Error(`Notification not found: ${id}`);
  _logs[idx] = {
    ..._logs[idx],
    status: 'queued',
    retryCount: _logs[idx].retryCount + 1,
    errorMessage: undefined,
  };
  return structuredClone(_logs[idx]);
}

export async function sendTestNotification(
  type: NotificationType,
  recipientPhone?: string,
  recipientEmail?: string,
  patientName?: string,
): Promise<{ success: boolean; previewContent: string }> {
  // TODO: connect to NestJS notification service (Twilio/SendGrid)
  // For mock: returns rendered template content only
  await delay();

  const template = _templates.find(t => t.type === type);
  if (!template) throw new Error(`No template found for type: ${type}`);

  const vars: Record<string, string> = {
    '{patient_name}': patientName ?? 'John Smith',
    '{date}':         'Monday, March 30, 2026',
    '{time}':         '9:00 AM',
    '{provider}':     'Dr. Sarah Chen',
    '{clinic_name}':  _settings.senderName,
    '{clinic_phone}': _settings.clinicPhone,
  };

  const previewContent = renderTemplate(template.body, vars);

  // Suppress unused parameter warnings in mock implementation
  void recipientPhone;
  void recipientEmail;

  return {
    success: true,
    previewContent,
  };
}

// ── Patient Preferences ────────────────────────────────────────────────────
export async function getPatientPrefs(patientId: string): Promise<PatientNotificationPrefs> {
  await delay();
  const prefs = _patientPrefs[patientId];
  if (!prefs) throw new Error(`Patient preferences not found: ${patientId}`);
  return structuredClone(prefs);
}

export async function updatePatientPrefs(
  patientId: string,
  updates: Partial<PatientNotificationPrefs>,
): Promise<PatientNotificationPrefs> {
  await delay();
  if (!_patientPrefs[patientId]) throw new Error(`Patient preferences not found: ${patientId}`);
  _patientPrefs[patientId] = { ..._patientPrefs[patientId], ...updates };
  return structuredClone(_patientPrefs[patientId]);
}

// ── KPI Summary ────────────────────────────────────────────────────────────
export async function getNotificationKpis(): Promise<{
  sentToday:     number;
  deliveryRate:  number;
  failedCount:   number;
  optedOutCount: number;
}> {
  await delay();
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = _logs.filter(l => l.sentAt && l.sentAt.startsWith(today));
  const sentToday = todayLogs.length;

  const totalResolved = _logs.filter(l => l.status === 'delivered' || l.status === 'failed').length;
  const deliveredCount = _logs.filter(l => l.status === 'delivered').length;
  const deliveryRate = totalResolved > 0 ? Math.round((deliveredCount / totalResolved) * 1000) / 10 : 0;

  const failedCount   = _logs.filter(l => l.status === 'failed').length;
  const optedOutCount = _logs.filter(l => l.status === 'opted_out').length;

  return { sentToday, deliveryRate, failedCount, optedOutCount };
}
