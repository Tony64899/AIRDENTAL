// NotificationsPage — Phase 8 Patient Notification System.
// Tabs: Settings | Templates | Log
// ⚠️ HIPAA: Notification content contains PHI (patient name + appointment time).
//            No clinical data in messages. All delivery is logged with audit trail.

import { useState, useEffect } from 'react';
import {
  Bell, Send, CheckCircle, AlertCircle, BellOff,
  X, Settings, FileText, List,
} from 'lucide-react';

import { useNotifications } from '../hooks/useNotifications';
import { ToggleSwitch }     from '../components/notifications/ToggleSwitch';
import { ScheduleEditor }   from '../components/notifications/ScheduleEditor';
import { TemplateEditor }   from '../components/notifications/TemplateEditor';
import { NotificationTable } from '../components/notifications/NotificationTable';
import { SendTestModal }    from '../components/notifications/SendTestModal';

import type { NotificationSettings, MessageTemplate, ReminderRule, NotificationType } from '../types/notification';

type MainTab = 'settings' | 'templates' | 'log';

// ── KPI card helper ──────────────────────────────────────────────────────────
interface KpiCardProps {
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  color:   string;
  bgColor: string;
}

function KpiCard({ icon, label, value, color, bgColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-[#94a3b8] font-medium">{label}</p>
        <p className="text-xl font-bold text-[#0f172a] leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Settings tab ─────────────────────────────────────────────────────────────
interface SettingsTabProps {
  settings: NotificationSettings;
  kpis:     { sentToday: number; deliveryRate: number; failedCount: number; optedOutCount: number } | null;
  onSave:   (updates: Partial<NotificationSettings>) => Promise<void>;
}

function SettingsTab({ settings, kpis, onSave }: SettingsTabProps) {
  const [form, setForm] = useState<NotificationSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync when external settings change
  useEffect(() => { setForm(settings); setIsDirty(false); }, [settings]);

  const patch = (updates: Partial<NotificationSettings>) => {
    setForm(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleScheduleChange = (rules: ReminderRule[]) => {
    patch({ reminderSchedule: rules });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-y-auto flex-1 p-6 bg-[#f8fafc] space-y-6">
      {/* KPI row */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Send className="w-5 h-5" />}
            label="Sent Today"
            value={String(kpis.sentToday)}
            color="text-[#0891b2]"
            bgColor="bg-[#e0f2fe]"
          />
          <KpiCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Delivery Rate"
            value={`${kpis.deliveryRate.toFixed(1)}%`}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <KpiCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Failed"
            value={String(kpis.failedCount)}
            color="text-red-500"
            bgColor="bg-red-50"
          />
          <KpiCard
            icon={<BellOff className="w-5 h-5" />}
            label="Opted Out"
            value={String(kpis.optedOutCount)}
            color="text-amber-500"
            bgColor="bg-amber-50"
          />
        </div>
      )}

      {/* Channel Settings + Clinic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Channel Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#0f172a] mb-4">Channel Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#0f172a]">SMS</p>
                <p className="text-xs text-[#94a3b8]">Send appointment reminders via text</p>
              </div>
              <ToggleSwitch
                checked={form.smsEnabled}
                onChange={v => patch({ smsEnabled: v })}
              />
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#0f172a]">Email</p>
                <p className="text-xs text-[#94a3b8]">Send appointment reminders via email</p>
              </div>
              <ToggleSwitch
                checked={form.emailEnabled}
                onChange={v => patch({ emailEnabled: v })}
              />
            </div>
          </div>
        </div>

        {/* Clinic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#0f172a] mb-4">Clinic Info</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Sender Name</label>
              <input
                type="text"
                value={form.senderName}
                onChange={e => patch({ senderName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                placeholder="Air Dental"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Reply-To Email</label>
              <input
                type="email"
                value={form.replyToEmail}
                onChange={e => patch({ replyToEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                placeholder="appointments@airdental.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Clinic Phone</label>
              <input
                type="tel"
                value={form.clinicPhone}
                onChange={e => patch({ clinicPhone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
                placeholder="(617) 555-0100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Schedule */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-[#0f172a] mb-5">Reminder Schedule</h3>
        <ScheduleEditor
          rules={form.reminderSchedule}
          onChange={handleScheduleChange}
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="px-5 py-2.5 text-sm font-semibold bg-[#0891b2] text-white rounded-xl hover:bg-[#0e7490] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ── Templates tab ─────────────────────────────────────────────────────────────
interface TemplatesTabProps {
  templates: MessageTemplate[];
  settings:  NotificationSettings;
  onSave:    (id: string, updates: Partial<MessageTemplate>) => Promise<void>;
}

function TemplatesTab({ templates, settings, onSave }: TemplatesTabProps) {
  const [activeType, setActiveType] = useState<NotificationType>('SMS');
  const [localTemplates, setLocalTemplates] = useState<MessageTemplate[]>(templates);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalTemplates(templates); }, [templates]);

  const template = localTemplates.find(t => t.type === activeType);

  const handleChange = (updates: Partial<MessageTemplate>) => {
    setLocalTemplates(prev => prev.map(t =>
      t.type === activeType ? { ...t, ...updates } : t,
    ));
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      await onSave(template.id, { body: template.body, subject: template.subject });
    } finally {
      setSaving(false);
    }
  };

  const formattedUpdatedAt = template
    ? new Date(template.updatedAt).toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : '';

  return (
    <div className="overflow-y-auto flex-1 p-6 bg-[#f8fafc] space-y-5">
      {/* Sub-tabs: SMS | Email */}
      <div className="flex gap-2">
        {(['SMS', 'EMAIL'] as NotificationType[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
              activeType === t
                ? 'bg-[#0891b2] text-white border-[#0891b2]'
                : 'bg-white text-[#64748b] border-gray-200 hover:border-[#0891b2] hover:text-[#0891b2]'
            }`}
          >
            {t === 'SMS' ? 'SMS' : 'Email'}
          </button>
        ))}
      </div>

      {/* Template editor card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {template ? (
          <TemplateEditor
            template={template}
            settings={settings}
            onChange={handleChange}
          />
        ) : (
          <p className="text-sm text-[#94a3b8]">No template found for {activeType}.</p>
        )}
      </div>

      {/* Save row */}
      <div className="flex items-center justify-between">
        {formattedUpdatedAt && (
          <p className="text-xs text-[#94a3b8]">
            Last saved: {formattedUpdatedAt}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !template}
          className="ml-auto px-5 py-2.5 text-sm font-semibold bg-[#0891b2] text-white rounded-xl hover:bg-[#0e7490] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}

// ── Log tab ───────────────────────────────────────────────────────────────────
interface LogTabProps {
  logs:        ReturnType<typeof useNotifications>['logs'];
  logsLoading: ReturnType<typeof useNotifications>['logsLoading'];
  onRetry:     ReturnType<typeof useNotifications>['retryLog'];
}

function LogTab({ logs, logsLoading, onRetry }: LogTabProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'SMS' | 'EMAIL'>('all');

  const filtered = logs.filter(l => {
    if (typeFilter !== 'all' && l.type !== typeFilter) return false;
    if (dateFrom && l.appointmentDate < dateFrom) return false;
    if (dateTo   && l.appointmentDate > dateTo)   return false;
    return true;
  });

  const handleExport = () => {
    const headers = ['ID', 'Patient', 'Date', 'Type', 'Status', 'Sent At', 'Message'];
    const rows = logs.map(l => [
      l.id,
      l.patientName,
      l.appointmentDate,
      l.type,
      l.status,
      l.sentAt ?? '',
      `"${l.messageContent.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notification-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTypeFilter('all');
  };

  return (
    <div className="overflow-y-auto flex-1 p-6 bg-[#f8fafc] space-y-4">
      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#64748b]">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#64748b]">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
          />
        </div>
        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'all' | 'SMS' | 'EMAIL')}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
          >
            <option value="all">All Types</option>
            <option value="SMS">SMS Only</option>
            <option value="EMAIL">Email Only</option>
          </select>
        </div>
        {(dateFrom || dateTo || typeFilter !== 'all') && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#0f172a] px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}

        <div className="ml-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-medium text-[#0891b2] border border-[#0891b2]/30 px-3 py-1.5 rounded-xl hover:bg-[#e0f2fe] transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <NotificationTable
        logs={filtered}
        isLoading={logsLoading === 'loading'}
        onRetry={onRetry}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeTab,     setActiveTab]     = useState<MainTab>('settings');
  const [showTestModal, setShowTestModal] = useState(false);

  const {
    settings, settingsLoading, saveSettings,
    templates, templatesLoading, saveTemplate,
    logs, logsLoading, retryLog,
    kpis,
    toast, clearToast,
  } = useNotifications();

  const isReady = settingsLoading !== 'loading' && templatesLoading !== 'loading';

  const TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: 'settings',  label: 'Settings',  icon: <Settings  className="w-4 h-4" /> },
    { key: 'templates', label: 'Templates', icon: <FileText  className="w-4 h-4" /> },
    { key: 'log',       label: 'Log',       icon: <List      className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#0891b2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0f172a]">Notifications</h1>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Automated appointment reminders via SMS and Email
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0891b2] border border-[#0891b2]/30 rounded-xl hover:bg-[#e0f2fe] transition-colors"
          >
            <Send className="w-4 h-4" />
            Send Test
          </button>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#0891b2] text-[#0891b2]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      {!isReady ? (
        <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#0891b2] border-t-transparent animate-spin" />
            <p className="text-sm text-[#94a3b8]">Loading notification settings…</p>
          </div>
        </div>
      ) : settings && (
        <>
          {activeTab === 'settings' && (
            <SettingsTab settings={settings} kpis={kpis} onSave={saveSettings} />
          )}
          {activeTab === 'templates' && (
            <TemplatesTab templates={templates} settings={settings} onSave={saveTemplate} />
          )}
          {activeTab === 'log' && (
            <LogTab logs={logs} logsLoading={logsLoading} onRetry={retryLog} />
          )}
        </>
      )}

      {/* ── Send Test modal ── */}
      {showTestModal && settings && (
        <SendTestModal
          templates={templates}
          settings={settings}
          onClose={() => setShowTestModal(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'}`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          }
          {toast.message}
          <button onClick={clearToast} className="ml-2 opacity-50 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
