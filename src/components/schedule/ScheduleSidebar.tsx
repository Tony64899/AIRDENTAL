// ScheduleSidebar — left panel of the scheduler.
// Top section: patient summary for the single-clicked appointment.
// Bottom section: monthly mini calendar for date navigation.
// ⚠️ HIPAA: patient info shown here is UI-only from mock data.
//            Phase 4 will fetch via HIPAA-compliant API with audit logging.

import { useState, useEffect }  from 'react';
import { Link }                  from 'react-router-dom';
import { Phone, AlertCircle, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import {
  isToday,
  getDaysInMonth,
  getFirstDayOfMonth,
  MONTH_NAMES,
  SHORT_DAY_NAMES,
} from '../../utils/dateUtils';
import { MOCK_PATIENT_INFO } from '../../constants/mockData';
import { patientChartUrl }   from '../../constants/routes';
import type { Appointment }  from '../../types/appointment';

interface ScheduleSidebarProps {
  currentDate:          Date;
  onDateChange:         (date: Date) => void;
  selectedAppointment?: Appointment | null;  // single-clicked appointment
}

// ── Billing status config ─────────────────────────────────────────────────
const BILLING_CFG = {
  billing_alert: {
    bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700',
    Icon: AlertCircle, label: 'Billing Alert',
  },
  balance_remaining: {
    bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700',
    Icon: AlertTriangle, label: 'Balance Remaining',
  },
  all_paid: {
    bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700',
    Icon: CheckCircle, label: 'All Paid',
  },
} as const;

/** Calculate age in whole years from an ISO DOB string to today. */
function calcAge(dob: string): number {
  const [y, m, d] = dob.split('-').map(Number);
  const today  = new Date();
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
  return age;
}

/** Format ISO YYYY-MM-DD → MM/DD/YYYY */
function formatDOB(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

/** Format USD cents → "$425.00" */
function formatBalance(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

// ── Patient info sub-component ────────────────────────────────────────────
function PatientPanel({ appointment }: { appointment: Appointment }) {
  const info    = appointment.patientId ? MOCK_PATIENT_INFO[appointment.patientId] : null;
  const billing = info ? BILLING_CFG[info.billingStatus] : null;

  return (
    <div className="space-y-3">
      {/* Name */}
      <div>
        <div className="font-semibold text-[#0f172a] text-sm leading-tight">
          {appointment.patientName}
        </div>
        <div className="text-[10px] text-[#94a3b8] mt-0.5">Patient</div>
      </div>

      {/* Billing status badge */}
      {billing && info && (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${billing.bg} ${billing.border} ${billing.text}`}
        >
          <billing.Icon size={12} />
          {billing.label}
          {info.balance !== undefined && info.balance > 0 && (
            <span className="ml-0.5">{formatBalance(info.balance)}</span>
          )}
        </div>
      )}

      {info ? (
        <>
          {/* Gender */}
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">
              Gender
            </div>
            <div className="text-xs text-[#0f172a]">
              {info.gender === 'male' ? '(Biological) Male' : '(Biological) Female'}
            </div>
          </div>

          {/* Date of Birth + Age */}
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">
              Date of Birth
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#0f172a]">{formatDOB(info.dob)}</span>
              <span className="text-[10px] text-[#64748b] bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                {calcAge(info.dob)} yrs
              </span>
            </div>
          </div>

          {/* Cell Phone */}
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">
              Cell Phone
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={11} className="text-[#94a3b8] flex-shrink-0" />
              <span className="text-xs text-[#0f172a]">{info.phone}</span>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Allergies
            </div>
            {info.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {info.allergies.map(a => (
                  <span
                    key={a}
                    className="bg-red-50 text-red-700 border border-red-200 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94a3b8]">None known</div>
            )}
          </div>

          {/* Medical Conditions */}
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Medical Conditions
            </div>
            {info.medicalConditions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {info.medicalConditions.map(c => (
                  <span
                    key={c}
                    className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94a3b8]">None reported</div>
            )}
          </div>
        </>
      ) : (
        <div className="text-xs text-[#94a3b8] italic">No chart record found.</div>
      )}

      {/* View Full Chart link — only when patientId is available */}
      {appointment.patientId && (
        <Link
          to={patientChartUrl(appointment.patientId)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#0891b2] hover:text-[#0e7490] hover:underline transition-colors"
        >
          View Full Chart
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function ScheduleSidebar({
  currentDate,
  onDateChange,
  selectedAppointment,
}: ScheduleSidebarProps) {
  // calMonth drives which month the mini calendar displays.
  // Initialised from currentDate and kept in sync whenever currentDate
  // moves to a different month (e.g. header < / > navigation crosses a month boundary).
  const [calMonth, setCalMonth] = useState(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );

  // Sync mini-calendar month when the header navigates to a new month
  useEffect(() => {
    setCalMonth(prev => {
      if (
        prev.getFullYear() !== currentDate.getFullYear() ||
        prev.getMonth()    !== currentDate.getMonth()
      ) {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }
      return prev;
    });
  }, [currentDate]);

  const year        = calMonth.getFullYear();
  const month       = calMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const d = new Date(year, month, day);
    onDateChange(d);
  };

  /** Jump back to today's date and sync the calendar to today's month. */
  const handleGoToday = () => {
    const today = new Date();
    setCalMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateChange(today);
  };

  const isSelected = (day: number) =>
    day === currentDate.getDate() &&
    month === currentDate.getMonth() &&
    year  === currentDate.getFullYear();

  const isDayToday = (day: number) => isToday(new Date(year, month, day));

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">

      {/* ── Top: Patient Info Panel ── */}
      <div className="flex-1 overflow-y-auto p-4 border-b border-gray-200 min-h-0">
        <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">
          Patient
        </p>
        {selectedAppointment ? (
          <PatientPanel appointment={selectedAppointment} />
        ) : (
          <div className="text-xs text-[#94a3b8] leading-relaxed">
            Click an appointment to see the patient summary here.
          </div>
        )}
      </div>

      {/* ── Bottom: Mini Calendar ── */}
      <div className="p-4 flex-shrink-0">

        {/* Month navigation row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#0f172a]">
            {MONTH_NAMES[month]} {year}
          </span>
          <div className="flex items-center gap-0.5">
            {/* Today button */}
            <button
              onClick={handleGoToday}
              className="text-[9px] font-semibold text-[#0891b2] hover:bg-[#e0f2fe] px-2 py-1 rounded-md transition-colors mr-1"
              title="Go to today"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#64748b]" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-px mb-0.5">
          {SHORT_DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[9px] font-medium text-[#94a3b8] py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-px">
          {/* Empty cells before first day */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}

          {/* Day buttons */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const sel = isSelected(day);
            const tod = isDayToday(day);
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={[
                  'aspect-square flex items-center justify-center text-[10px] rounded-md transition-colors',
                  sel
                    ? 'bg-[#0891b2] text-white font-semibold'
                    : tod
                    ? 'bg-[#e0f2fe] text-[#0891b2] font-semibold'
                    : 'hover:bg-gray-100 text-[#475569]',
                ].join(' ')}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
