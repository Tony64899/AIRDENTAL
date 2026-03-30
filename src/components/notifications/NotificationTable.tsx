// NotificationTable.tsx — Notification log table with filter tabs and retry actions.
// ⚠️ HIPAA: Message content contains patient name + appointment time (PHI). No clinical data allowed.

import { useState } from 'react';
import type { NotificationLog, NotificationStatus } from '../../types/notification';
import { StatusBadge } from './StatusBadge';
import { RetryButton } from './RetryButton';

interface NotificationTableProps {
  logs:      NotificationLog[];
  isLoading: boolean;
  onRetry:   (id: string) => Promise<void>;
}

type FilterTab = 'all' | NotificationStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'queued',    label: 'Queued'    },
  { key: 'sent',      label: 'Sent'      },
  { key: 'delivered', label: 'Delivered' },
  { key: 'failed',    label: 'Failed'    },
  { key: 'opted_out', label: 'Opted Out' },
];

function formatDateTime(iso?: string): string {
  if (!iso) return 'Pending';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function formatApptDate(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM
  const [h, m] = time.split(':').map(Number);
  const d = new Date(`${date}T${time}:00`);
  const dateStr = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const hour = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${dateStr} ${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function NotificationTable({ logs, isLoading, onRetry }: NotificationTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredLogs = (activeTab === 'all' ? logs : logs.filter(l => l.status === activeTab))
    .slice()
    .sort((a, b) => {
      const ta = a.sentAt ?? '';
      const tb = b.sentAt ?? '';
      return tb.localeCompare(ta);
    });

  const countFor = (tab: FilterTab) =>
    tab === 'all' ? logs.length : logs.filter(l => l.status === tab).length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Skeleton rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-28" />
            <div className="h-4 bg-gray-100 rounded-full w-14" />
            <div className="h-4 bg-gray-100 rounded-full w-20" />
            <div className="h-3 bg-gray-100 rounded w-40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Filter tabs */}
      <div className="flex items-center gap-0 border-b border-gray-100 px-4 overflow-x-auto">
        {TABS.map(tab => {
          const count = countFor(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#0891b2] text-[#0891b2]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                isActive ? 'bg-[#e0f2fe] text-[#0891b2]' : 'bg-gray-100 text-[#94a3b8]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#94a3b8]">
          No notifications found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">Sent At</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">Patient</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">Appt Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Message Preview</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const isFailed   = log.status === 'failed';
                const isOptedOut = log.status === 'opted_out';
                const preview    = log.messageContent.length > 60
                  ? log.messageContent.slice(0, 60) + '…'
                  : log.messageContent;

                return (
                  <tr
                    key={log.id}
                    className={`border-b border-gray-50 last:border-0 ${isFailed ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                      {formatDateTime(log.sentAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#0f172a] whitespace-nowrap">
                      {log.patientName}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                      {formatApptDate(log.appointmentDate, log.appointmentTime)}
                    </td>
                    <td className="px-4 py-3">
                      {log.type === 'SMS' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          SMS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          Email
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-[#94a3b8] text-xs font-mono truncate block">
                        {preview}
                      </span>
                      {isFailed && log.errorMessage && (
                        <span className="text-red-500 text-[10px] block mt-0.5 truncate">
                          {log.errorMessage}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isFailed ? (
                        <RetryButton
                          logId={log.id}
                          retryCount={log.retryCount}
                          onRetry={onRetry}
                        />
                      ) : isOptedOut ? (
                        <span className="text-[#94a3b8] text-xs px-2.5">—</span>
                      ) : (
                        <StatusBadge status={log.status} size="sm" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
