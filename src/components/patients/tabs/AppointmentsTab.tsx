// AppointmentsTab — patient appointment history.
// ⚠️ HIPAA: Appointment records are PHI. Never cache or expose without authorization.

import { useState, useEffect } from 'react';
import type { Appointment, AppointmentStatus } from '../../../types/appointment';
import { getPatientAppointments }              from '../../../services/patientService';
import { MOCK_PROVIDERS }                      from '../../../constants/mockData';

interface AppointmentsTabProps {
  patientId: string;
  clinicId:  string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

/** Convert 24-hr HH:MM to 12-hr h:MM AM/PM */
function format12hr(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${suffix}`;
}

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS_BADGE: Record<AppointmentStatus, string> = {
  confirmed: 'bg-green-50 text-green-700 border border-green-200',
  scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
  arrived:   'bg-amber-50 text-amber-700 border border-amber-200',
  in_chair:  'bg-teal-50 text-teal-700 border border-teal-200',
  completed: 'bg-gray-100 text-gray-600 border border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  no_show:   'bg-red-50 text-red-700 border border-red-200',
};

// Build provider lookup
const PROVIDER_MAP: Record<string, string> = Object.fromEntries(
  MOCK_PROVIDERS.map(p => [p.id, p.name]),
);

// ── Main component ─────────────────────────────────────────────────────────

export function AppointmentsTab({ patientId, clinicId }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPatientAppointments(patientId, clinicId)
      .then(data => {
        if (!cancelled) {
          // Sort newest-first
          const sorted = [...data].sort((a, b) =>
            (b.date ?? '').localeCompare(a.date ?? ''),
          );
          setAppointments(sorted);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load appointments');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [patientId, clinicId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-16" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#0f172a]">Appointment History</h3>
      </div>

      {appointments.length === 0 ? (
        <div className="px-5 py-8 text-sm text-[#94a3b8] text-center">
          No appointments on record.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {appointments.map(apt => (
            <div key={apt.id} className="flex items-center gap-4 px-5 py-3.5">
              {/* Date */}
              <div className="w-20 flex-shrink-0">
                <div className="text-sm font-medium text-[#0f172a]">
                  {apt.date ? formatDate(apt.date) : '—'}
                </div>
                <div className="text-[10px] text-[#94a3b8]">
                  {format12hr(apt.startTime)} – {format12hr(apt.endTime)}
                </div>
              </div>

              {/* Procedure + provider */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#0f172a] truncate">
                  {apt.procedure}
                </div>
                <div className="text-xs text-[#64748b]">
                  {PROVIDER_MAP[apt.providerId] ?? apt.providerId}
                </div>
              </div>

              {/* Status badge */}
              {apt.status && (
                <span
                  className={[
                    'text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0',
                    STATUS_BADGE[apt.status],
                  ].join(' ')}
                >
                  {apt.status.replace('_', ' ')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
