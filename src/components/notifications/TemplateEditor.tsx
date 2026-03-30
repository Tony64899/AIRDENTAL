// TemplateEditor.tsx — Two-panel message template editor with live preview.
// ⚠️ HIPAA: Message content contains patient name + appointment time (PHI). No clinical data allowed.

import { useRef } from 'react';
import { renderTemplate } from '../../services/notificationService';
import { TEMPLATE_VARIABLES } from '../../types/notification';
import type { MessageTemplate, NotificationSettings } from '../../types/notification';

interface TemplateEditorProps {
  template:  MessageTemplate;
  settings:  NotificationSettings;
  onChange:  (updates: Partial<MessageTemplate>) => void;
}

const MAX_SMS_CHARS = 160;

export function TemplateEditor({ template, settings, onChange }: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSms = template.type === 'SMS';

  const PREVIEW_VARS: Record<string, string> = {
    '{patient_name}': 'John Smith',
    '{date}':         'Monday, March 30, 2026',
    '{time}':         '9:00 AM',
    '{provider}':     'Dr. Sarah Chen',
    '{clinic_name}':  settings.senderName,
    '{clinic_phone}': settings.clinicPhone,
  };

  const renderedBody = renderTemplate(template.body, PREVIEW_VARS);

  const insertVariable = (variable: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const newValue = template.body.slice(0, start) + variable + template.body.slice(end);
    onChange({ body: newValue });
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + variable.length;
      ta.focus();
    });
  };

  const charCount = template.body.length;
  const segments  = Math.ceil(charCount / MAX_SMS_CHARS);
  const charOverOneSegment = charCount > MAX_SMS_CHARS;
  const charOverTwoSegments = charCount > MAX_SMS_CHARS * 2;

  const charCountColor = charOverTwoSegments
    ? 'text-red-600'
    : charOverOneSegment
      ? 'text-amber-600'
      : 'text-[#94a3b8]';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ── Left: Editor ── */}
      <div className="flex flex-col gap-4">
        {/* Email subject input */}
        {!isSms && (
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={template.subject ?? ''}
              onChange={e => onChange({ subject: e.target.value })}
              placeholder="Appointment Reminder — {clinic_name}"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
        )}

        {/* Body textarea */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#64748b]">
              {isSms ? 'Message Body' : 'Email Body (HTML)'}
            </label>
            {isSms && (
              <span className={`text-xs font-mono ${charCountColor}`}>
                {charCount}/{MAX_SMS_CHARS}
                {segments > 1 && (
                  <span className="ml-1 text-amber-600 font-semibold">
                    ({segments}-part SMS)
                  </span>
                )}
              </span>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={template.body}
            onChange={e => onChange({ body: e.target.value })}
            rows={isSms ? 5 : 12}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] font-mono resize-y"
            placeholder={isSms ? 'Type your SMS message...' : 'Enter HTML email body...'}
          />
          {charOverTwoSegments && isSms && (
            <p className="text-xs text-red-600 font-medium">
              Warning: Multi-part SMS ({segments} segments). Additional carrier charges may apply.
            </p>
          )}
        </div>

        {/* Variable chips */}
        <div>
          <p className="text-xs font-medium text-[#64748b] mb-2">Insert variable:</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARIABLES.map(v => (
              <button
                key={v.key}
                type="button"
                onClick={() => insertVariable(v.key)}
                title={`Example: ${v.example}`}
                className="bg-[#e0f2fe] text-[#0891b2] text-xs px-2 py-1 rounded cursor-pointer hover:bg-[#bae6fd] transition-colors font-mono"
              >
                {v.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Live Preview ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#0f172a]">Preview</span>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
            Sample data
          </span>
        </div>

        {isSms ? (
          <div className="bg-[#1e293b] rounded-xl p-4 font-mono text-sm text-green-300 leading-relaxed min-h-[140px] whitespace-pre-wrap break-words">
            {renderedBody || <span className="text-gray-500 italic">No content</span>}
          </div>
        ) : (
          <iframe
            srcDoc={renderedBody || '<p style="color:#94a3b8;font-family:sans-serif;padding:16px">No content</p>'}
            className="w-full h-80 rounded-xl border border-gray-200 bg-white"
            sandbox="allow-same-origin"
            title="Email preview"
          />
        )}

        {/* Preview variable key */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
          <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide mb-2">Sample values used in preview</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {TEMPLATE_VARIABLES.map(v => (
              <div key={v.key} className="flex gap-1 text-[11px]">
                <span className="text-[#0891b2] font-mono">{v.key}</span>
                <span className="text-[#94a3b8]">→ {v.key === '{clinic_name}' ? settings.senderName : v.key === '{clinic_phone}' ? settings.clinicPhone : v.example}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
