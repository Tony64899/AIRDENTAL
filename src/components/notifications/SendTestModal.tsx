// SendTestModal.tsx — Modal for sending a test notification.
// ⚠️ HIPAA: Test sends use sample (non-PHI) data only. No real patient info is used.

import { useState } from 'react';
import { X, Send, CheckCircle, Loader2 } from 'lucide-react';
import { renderTemplate, sendTestNotification } from '../../services/notificationService';
import type { MessageTemplate, NotificationSettings, NotificationType } from '../../types/notification';

interface SendTestModalProps {
  templates: MessageTemplate[];
  settings:  NotificationSettings;
  onClose:   () => void;
}

const PREVIEW_VARS: Record<string, string> = {
  '{patient_name}': 'John Smith',
  '{date}':         'Monday, March 30, 2026',
  '{time}':         '9:00 AM',
  '{provider}':     'Dr. Sarah Chen',
  '{clinic_name}':  'Air Dental',
  '{clinic_phone}': '(617) 555-0100',
};

export function SendTestModal({ templates, settings, onClose }: SendTestModalProps) {
  const [type,      setType]      = useState<NotificationType>('SMS');
  const [recipient, setRecipient] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<{ success: boolean; previewContent: string } | null>(null);

  const template = templates.find(t => t.type === type);
  const previewBody = template ? renderTemplate(template.body, {
    ...PREVIEW_VARS,
    '{clinic_name}':  settings.senderName,
    '{clinic_phone}': settings.clinicPhone,
  }) : '';

  const handleSend = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await sendTestNotification(
        type,
        type === 'SMS' ? recipient : undefined,
        type === 'EMAIL' ? recipient : undefined,
        'John Smith',
      );
      setResult(res);
    } catch {
      setResult({ success: false, previewContent: 'Failed to send test notification.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">Send Test Notification</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">Uses sample data — no real patient info</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#0f172a] transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Notification Type</label>
            <div className="flex gap-2">
              {(['SMS', 'EMAIL'] as NotificationType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setResult(null); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                    type === t
                      ? 'bg-[#0891b2] text-white border-[#0891b2]'
                      : 'bg-white text-[#64748b] border-gray-200 hover:border-[#0891b2] hover:text-[#0891b2]'
                  }`}
                >
                  {t === 'SMS' ? 'SMS' : 'Email'}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Message Preview</label>
            {type === 'SMS' ? (
              <div className="bg-[#1e293b] rounded-xl p-3 font-mono text-xs text-green-300 leading-relaxed whitespace-pre-wrap break-words min-h-[80px]">
                {previewBody || <span className="text-gray-500 italic">No SMS template configured</span>}
              </div>
            ) : (
              <iframe
                srcDoc={previewBody || '<p style="color:#94a3b8;font-family:sans-serif;padding:16px">No email template configured</p>'}
                className="w-full h-48 rounded-xl border border-gray-200 bg-white"
                sandbox="allow-same-origin"
                title="Email preview"
              />
            )}
          </div>

          {/* Recipient input */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">
              {type === 'SMS' ? 'Recipient Phone' : 'Recipient Email'}
            </label>
            <input
              type={type === 'SMS' ? 'tel' : 'email'}
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder={type === 'SMS' ? '+1 (617) 555-0000' : 'you@example.com'}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>

          {/* Result box */}
          {result && (
            <div className={`rounded-xl p-4 border ${
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              {result.success ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-800 mb-1">
                      Test notification queued.
                    </p>
                    <p className="text-[10px] text-green-700 font-mono">
                      TODO: connect to Twilio/SendGrid in production
                    </p>
                    <div className="mt-2">
                      <p className="text-[10px] font-medium text-green-700 mb-1">Rendered content:</p>
                      {type === 'SMS' ? (
                        <div className="bg-[#1e293b] rounded-lg p-3 font-mono text-[10px] text-green-300 whitespace-pre-wrap break-words">
                          {result.previewContent}
                        </div>
                      ) : (
                        <iframe
                          srcDoc={result.previewContent}
                          className="w-full h-32 rounded-lg border border-green-200 bg-white"
                          sandbox="allow-same-origin"
                          title="Test email result"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-700">{result.previewContent}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a] hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !recipient}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#0891b2] text-white rounded-xl hover:bg-[#0e7490] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Test
          </button>
        </div>
      </div>
    </div>
  );
}
