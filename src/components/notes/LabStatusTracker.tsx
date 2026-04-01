// LabStatusTracker — horizontal step progress bar for Lab notes.
// Click any step to update the lab case status.
// Shows who last updated the status (M/D/YYYY - H:MM AM format).
// Shows per-step timestamps below each step label.

import { Check } from 'lucide-react';
import type { LabStatus } from '../../types/notes';
import { LAB_STEPS } from '../../types/notes';

interface Props {
  current:          LabStatus;
  onChange:         (status: LabStatus) => void;
  updatedBy?:       string | null;   // display name of last person who changed status
  updatedAt?:       string | null;   // ISO timestamp of last status change
  stepTimestamps?:  Partial<Record<LabStatus, string>>;  // ISO timestamp per step
  disabled?:        boolean;
}

/** Format ISO → M/D/YYYY - H:MM AM/PM */
function fmtDateTime(iso: string): string {
  const d    = new Date(iso);
  const mo   = d.getMonth() + 1;
  const day  = d.getDate();
  const yr   = d.getFullYear();
  const hr24 = d.getHours();
  const min  = String(d.getMinutes()).padStart(2, '0');
  const ampm = hr24 >= 12 ? 'PM' : 'AM';
  const hr12 = hr24 % 12 || 12;
  return `${mo}/${day}/${yr} - ${hr12}:${min} ${ampm}`;
}

/** Format ISO → M/D/YYYY */
function fmtStepDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

/** Format ISO → H:MM AM/PM */
function fmtStepTime(iso: string): string {
  const d    = new Date(iso);
  const hr24 = d.getHours();
  const min  = String(d.getMinutes()).padStart(2, '0');
  const ampm = hr24 >= 12 ? 'PM' : 'AM';
  const hr12 = hr24 % 12 || 12;
  return `${hr12}:${min} ${ampm}`;
}

export default function LabStatusTracker({
  current, onChange, updatedBy, updatedAt, stepTimestamps = {}, disabled = false,
}: Props) {
  const currentIdx = LAB_STEPS.findIndex(s => s.key === current);

  return (
    <div className="px-6 py-4 border-b border-slate-100 bg-orange-50/40">

      {/* Header row: label + last-updated attribution */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Lab Case Status
        </p>
        {updatedBy && updatedAt && (
          <p className="text-[11px] text-slate-400 tabular-nums">
            Last updated by&nbsp;
            <span className="font-semibold text-slate-600">{updatedBy}</span>
            &nbsp;·&nbsp;{fmtDateTime(updatedAt)}
          </p>
        )}
      </div>

      {/* Steps + connectors */}
      <div className="flex items-start">
        {LAB_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent   = idx === currentIdx;
          const ts          = stepTimestamps[step.key];

          return (
            <div key={step.key} className="flex items-start flex-1 last:flex-none">

              {/* Step circle + label + per-step timestamp */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && onChange(step.key)}
                  title={step.label}
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none',
                    disabled ? 'cursor-default' : 'cursor-pointer',
                    isCompleted
                      ? 'bg-[#0B3A70] border-2 border-[#0B3A70] hover:bg-[#0B3A70]/80'
                      : isCurrent
                        ? 'bg-[#0B3A70] border-2 border-[#0B3A70] ring-4 ring-[#0B3A70]/20'
                        : 'bg-white border-2 border-slate-300 hover:border-[#0B3A70]/50',
                  ].join(' ')}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  {isCurrent   && <span className="w-2 h-2 rounded-full bg-white" />}
                  {!isCompleted && !isCurrent && <span className="w-2 h-2 rounded-full bg-slate-200" />}
                </button>

                <p className={[
                  'text-[10px] font-semibold whitespace-nowrap',
                  isCurrent   ? 'text-[#0B3A70]' :
                  isCompleted ? 'text-slate-500'  : 'text-slate-400',
                ].join(' ')}>
                  {step.label}
                </p>

                {/* Per-step timestamp — shown only when the step has been reached */}
                {ts ? (
                  <div className="flex flex-col items-center leading-tight">
                    <span className="text-[9px] text-slate-400 tabular-nums whitespace-nowrap">
                      {fmtStepDate(ts)}
                    </span>
                    <span className="text-[9px] text-slate-400 tabular-nums whitespace-nowrap">
                      {fmtStepTime(ts)}
                    </span>
                  </div>
                ) : (
                  /* Reserve height so circles stay vertically aligned when some steps lack timestamps */
                  <div className="h-[22px]" />
                )}
              </div>

              {/* Connector line */}
              {idx < LAB_STEPS.length - 1 && (
                <div className="flex-1 flex items-center pt-3.5 px-0.5">
                  <div className={[
                    'flex-1 h-0.5 rounded-full transition-colors duration-300',
                    idx < currentIdx ? 'bg-[#0B3A70]' : 'bg-slate-200',
                  ].join(' ')} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
