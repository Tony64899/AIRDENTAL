// LabStatusTracker — horizontal step progress bar for Lab notes.
// Click any step to update the lab case status.
// Visual: ●━━━━━●━━━━━◯━━━━━◯━━━━━◯
//          Preparing  Sent  At Lab  Shipped  Received

import { Check } from 'lucide-react';
import type { LabStatus } from '../../types/notes';
import { LAB_STEPS } from '../../types/notes';

interface Props {
  current:  LabStatus;
  onChange: (status: LabStatus) => void;
  disabled?: boolean;
}

export default function LabStatusTracker({ current, onChange, disabled = false }: Props) {
  const currentIdx = LAB_STEPS.findIndex(s => s.key === current);

  return (
    <div className="px-6 py-4 border-b border-slate-100 bg-orange-50/40">
      {/* Track label */}
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Lab Case Status
      </p>

      {/* Steps + connectors */}
      <div className="flex items-start">
        {LAB_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent   = idx === currentIdx;
          const isUpcoming  = idx > currentIdx;

          return (
            <div key={step.key} className="flex items-start flex-1 last:flex-none">
              {/* Step */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && onChange(step.key)}
                  title={`${step.label} — ${step.sublabel}`}
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none',
                    !disabled && 'cursor-pointer',
                    isCompleted
                      ? 'bg-[#0B3A70] border-2 border-[#0B3A70] hover:bg-[#0B3A70]/80'
                      : isCurrent
                        ? 'bg-[#0B3A70] border-2 border-[#0B3A70] ring-4 ring-[#0B3A70]/20'
                        : 'bg-white border-2 border-slate-300 hover:border-[#0B3A70]/50',
                  ].join(' ')}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  {isCurrent  && <span className="w-2 h-2 rounded-full bg-white" />}
                  {isUpcoming && <span className="w-2 h-2 rounded-full bg-slate-200" />}
                </button>

                {/* Step label */}
                <div className="text-center">
                  <p className={[
                    'text-[10px] font-semibold whitespace-nowrap',
                    isCurrent   ? 'text-[#0B3A70]' :
                    isCompleted ? 'text-slate-500'  : 'text-slate-400',
                  ].join(' ')}>
                    {step.label}
                  </p>
                  <p className="text-[9px] text-slate-400 whitespace-nowrap">{step.sublabel}</p>
                </div>
              </div>

              {/* Connector line between steps */}
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
