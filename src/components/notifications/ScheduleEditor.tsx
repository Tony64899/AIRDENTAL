// ScheduleEditor.tsx — Visual reminder schedule editor with timeline UI.
// Shows 3 configurable reminder rules connected by a dashed vertical timeline.

import { MessageSquare, Mail } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import type { ReminderRule } from '../../types/notification';

interface ScheduleEditorProps {
  rules:     ReminderRule[];
  onChange:  (rules: ReminderRule[]) => void;
  disabled?: boolean;
}

function updateRule(rules: ReminderRule[], id: string, patch: Partial<ReminderRule>): ReminderRule[] {
  return rules.map(r => r.id === id ? { ...r, ...patch } : r);
}

export function ScheduleEditor({ rules, onChange, disabled = false }: ScheduleEditorProps) {
  return (
    <div className="relative pl-8">
      {/* Dashed vertical timeline line */}
      <div
        className="absolute left-3 top-5 bottom-5 w-px border-l-2 border-dashed border-gray-200"
        aria-hidden="true"
      />

      <div className="space-y-4">
        {rules.map((rule, idx) => {
          const isLast = idx === rules.length - 1;

          return (
            <div
              key={rule.id}
              className={`relative bg-white rounded-xl border border-gray-200 p-4 transition-opacity ${
                !rule.enabled ? 'opacity-50' : ''
              }`}
            >
              {/* Timeline dot */}
              <span
                className={`absolute -left-[21px] top-5 w-3 h-3 rounded-full border-2 border-white ${
                  rule.enabled ? 'bg-green-500' : 'bg-gray-400'
                }`}
                aria-hidden="true"
              />

              {/* Connector line override for last item */}
              {isLast && (
                <span
                  className="absolute -left-[20.5px] -top-4 w-px h-4 bg-[#f8fafc]"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Rule label */}
                <div>
                  <p className="font-semibold text-sm text-[#0f172a]">{rule.label}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    {rule.hoursBeforeAppointment}h before appointment
                  </p>
                </div>

                {/* Toggles row */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* SMS toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <MessageSquare className="w-3.5 h-3.5 text-[#64748b]" />
                    <span className="text-xs text-[#64748b] mr-1">SMS</span>
                    <ToggleSwitch
                      size="sm"
                      checked={rule.sendSms}
                      onChange={v => onChange(updateRule(rules, rule.id, { sendSms: v }))}
                      disabled={disabled || !rule.enabled}
                    />
                  </label>

                  {/* Email toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <Mail className="w-3.5 h-3.5 text-[#64748b]" />
                    <span className="text-xs text-[#64748b] mr-1">Email</span>
                    <ToggleSwitch
                      size="sm"
                      checked={rule.sendEmail}
                      onChange={v => onChange(updateRule(rules, rule.id, { sendEmail: v }))}
                      disabled={disabled || !rule.enabled}
                    />
                  </label>

                  {/* Enabled toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <span className="text-xs text-[#64748b] mr-1">Enabled</span>
                    <ToggleSwitch
                      size="sm"
                      checked={rule.enabled}
                      onChange={v => onChange(updateRule(rules, rule.id, { enabled: v }))}
                      disabled={disabled}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
