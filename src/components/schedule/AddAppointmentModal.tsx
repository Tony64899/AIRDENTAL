// AddAppointmentModal — create a new appointment from the scheduler.
// Design source: Figma export (AddAppointmentModal.tsx), adapted to Air Dental brand.
// ⚠️ HIPAA: patient name is PHI — do not log or persist outside of HIPAA-compliant storage.

import { useState } from 'react';
import { X, User, Stethoscope, Clock, FileText, ChevronDown, Calendar } from 'lucide-react';
import { formatTime, toISODate } from '../../utils/dateUtils';
import { getCategoryFromProcedure } from '../../utils/procedureColors';
import type { Appointment } from '../../types/appointment';
import type { Provider }    from '../../types/provider';

interface AddAppointmentModalProps {
  providers: Provider[];
  onClose:   () => void;
  onAdd:     (appointment: Omit<Appointment, 'id'>) => void;
}

// Common dental procedures — saves front-desk staff from typing the same
// things every day. Covers ~90% of a general dentistry appointment mix.
const COMMON_PROCEDURES = [
  'Routine Cleaning',
  'Comprehensive Exam',
  'Periodic Exam',
  'Crown Preparation',
  'Crown Delivery',
  'Root Canal',
  'Tooth Extraction',
  'Dental Implant',
  'Teeth Whitening',
  'Composite Filling',
  'Amalgam Filling',
  'Orthodontic Consultation',
  'Orthodontic Adjustment',
  'Denture Fitting',
  'Emergency Visit',
  'X-Ray',
  'Scaling & Root Planing',
  'Other',
];

// 15-minute time slot options: 6:00 AM – 10:00 PM
function buildTimeOptions(): string[] {
  const opts: string[] = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      opts.push(`${hh}:${mm}`);
    }
  }
  return opts;
}
const TIME_OPTIONS = buildTimeOptions();

// Shared field style — referenced in multiple inputs/selects below
const fieldClass = (hasError: boolean) =>
  [
    'w-full py-2.5 text-sm rounded-lg outline-none border transition-colors',
    'bg-[#f8fafc] text-[#0f172a] placeholder:text-[#94a3b8]',
    'focus:ring-2 focus:ring-[#0891b2]/25 focus:border-[#0891b2]',
    hasError ? 'border-red-400' : 'border-[rgba(0,0,0,0.10)]',
  ].join(' ');

export function AddAppointmentModal({ providers, onClose, onAdd }: AddAppointmentModalProps) {
  // ── Form state ────────────────────────────────
  const [patientName, setPatientName] = useState('');
  const [date,        setDate]        = useState(toISODate(new Date()));
  const [procedure,   setProcedure]   = useState('');
  const [customProc,  setCustomProc]  = useState('');
  const [providerId,  setProviderId]  = useState(providers[0]?.id ?? '');
  const [startTime,   setStartTime]   = useState('09:00');
  const [endTime,     setEndTime]     = useState('09:30');
  const [notes,       setNotes]       = useState('');

  // ── Validation ────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!patientName.trim())                          e.patientName = 'Patient name is required';
    if (!date)                                        e.date        = 'Date is required';
    if (!procedure)                                   e.procedure   = 'Please select a procedure';
    if (procedure === 'Other' && !customProc.trim())  e.procedure   = 'Please describe the procedure';
    if (!providerId)                                  e.providerId  = 'Please select a provider';
    if (startTime >= endTime)                         e.time        = 'End time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return;
    const finalProcedure = procedure === 'Other' ? customProc.trim() : procedure;
    onAdd({
      patientName:       patientName.trim(),
      date,
      procedure:         finalProcedure,
      procedureCategory: getCategoryFromProcedure(finalProcedure),
      providerId,
      startTime,
      endTime,
      notes:             notes.trim() || undefined,
      status:            'scheduled',
      clinicId:          'clinic-1',
      locationId:        'loc-1',
    });
  };

  // ── Render ────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-[rgba(0,0,0,0.06)] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.06)]">
          <div>
            <h2 className="text-base font-semibold text-[#0f172a]">New Appointment</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#475569] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Form body ── */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Patient Name */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Patient Name
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. John Smith"
                autoFocus
                className={`${fieldClass(!!errors.patientName)} pl-9 pr-4`}
              />
            </div>
            {errors.patientName && (
              <p className="text-xs text-red-500 mt-1">{errors.patientName}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`${fieldClass(!!errors.date)} pl-9 pr-4`}
              />
            </div>
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Procedure */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Procedure
            </label>
            <div className="relative">
              <Stethoscope size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              <select
                value={procedure}
                onChange={e => setProcedure(e.target.value)}
                className={`${fieldClass(!!errors.procedure)} pl-9 pr-8 appearance-none`}
              >
                <option value="">Select a procedure…</option>
                {COMMON_PROCEDURES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>
            {/* Free-text for "Other" */}
            {procedure === 'Other' && (
              <input
                type="text"
                value={customProc}
                onChange={e => setCustomProc(e.target.value)}
                placeholder="Describe the procedure…"
                className={`${fieldClass(false)} px-3 mt-2`}
              />
            )}
            {errors.procedure && (
              <p className="text-xs text-red-500 mt-1">{errors.procedure}</p>
            )}
          </div>

          {/* Provider — 2-column button grid */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {providers.map(p => {
                const isSelected = providerId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProviderId(p.id)}
                    className={[
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-medium border transition-all duration-150',
                      isSelected
                        ? 'border-[#0891b2] bg-[#f0f9ff] text-[#0e7490]'
                        : 'border-[rgba(0,0,0,0.10)] hover:border-[rgba(0,0,0,0.20)] text-[#475569]',
                    ].join(' ')}
                  >
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.providerId && (
              <p className="text-xs text-red-500 mt-1">{errors.providerId}</p>
            )}
          </div>

          {/* Time range */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Time
            </label>
            <div className="flex items-center gap-2">
              {/* Start */}
              <div className="relative flex-1">
                <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                <select
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className={`${fieldClass(!!errors.time)} pl-9 pr-2 appearance-none`}
                >
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>
              </div>

              <span className="text-[#94a3b8] text-sm font-medium">→</span>

              {/* End */}
              <div className="relative flex-1">
                <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                <select
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className={`${fieldClass(!!errors.time)} pl-9 pr-2 appearance-none`}
                >
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>
              </div>
            </div>
            {errors.time && (
              <p className="text-xs text-red-500 mt-1">{errors.time}</p>
            )}
          </div>

          {/* Notes — optional */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1.5">
              Notes{' '}
              <span className="normal-case font-normal text-[#94a3b8]">(optional)</span>
            </label>
            <div className="relative">
              <FileText size={13} className="absolute left-3 top-3 text-[#94a3b8]" />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Patient has latex allergy, needs interpreter…"
                rows={3}
                className={`${fieldClass(false)} pl-9 pr-4 resize-none`}
              />
            </div>
          </div>

        </div>{/* /form body */}

        {/* ── Footer ── */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.06)] bg-[#f8fafc]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border border-[rgba(0,0,0,0.10)] text-[#475569] hover:bg-[#f1f5f9] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-[#0891b2] hover:bg-[#0e7490] active:bg-[#155e75] text-white shadow-sm transition-colors"
          >
            Add Appointment
          </button>
        </div>

      </div>
    </div>
  );
}
