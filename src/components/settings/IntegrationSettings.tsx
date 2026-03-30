// IntegrationSettings — third-party API keys and webhooks.
// All secrets are shown masked. "Reveal" requires re-auth in production.
// ⚠️ Credentials never appear in client-side logs or URL params.
// TODO: All "Connect" / "Rotate" actions call backend NestJS endpoints — never client-side.

import { useState } from 'react';
import { Eye, EyeOff, RotateCw, CheckCircle, XCircle, ExternalLink, Plug } from 'lucide-react';

interface IntegrationConfig {
  id:          string;
  name:        string;
  description: string;
  logoText:    string;
  logoColor:   string;
  connected:   boolean;
  fields:      IntegrationField[];
  docsUrl:     string;
}

interface IntegrationField {
  key:      string;
  label:    string;
  value:    string;   // masked on init
  revealed: boolean;
  editable: boolean;
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'twilio',
    name: 'Twilio SMS',
    description: 'Sends appointment reminders and recalls via SMS.',
    logoText: 'Tw',
    logoColor: 'bg-red-500',
    connected: true,
    docsUrl: 'https://console.twilio.com',
    fields: [
      { key: 'account_sid',   label: 'Account SID',   value: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx4a3e', revealed: false, editable: false },
      { key: 'auth_token',    label: 'Auth Token',     value: '••••••••••••••••••••••••••••••••', revealed: false, editable: false },
      { key: 'sender_phone',  label: 'Sender Number',  value: '+1 (415) 555-0200',               revealed: true,  editable: true  },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid Email',
    description: 'Sends appointment confirmations and recalls via email.',
    logoText: 'SG',
    logoColor: 'bg-blue-500',
    connected: true,
    docsUrl: 'https://app.sendgrid.com',
    fields: [
      { key: 'api_key',       label: 'API Key',        value: 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', revealed: false, editable: false },
      { key: 'from_email',    label: 'Sender Email',   value: 'noreply@inspiredelta.com',                         revealed: true,  editable: true  },
      { key: 'from_name',     label: 'Sender Name',    value: 'Inspire Dental',                                   revealed: true,  editable: true  },
    ],
  },
  {
    id: 'airdental_api',
    name: 'Air Dental API',
    description: 'Webhook endpoint for external integrations and practice management software.',
    logoText: 'AD',
    logoColor: 'bg-[#0891b2]',
    connected: true,
    docsUrl: 'https://docs.airdental.io',
    fields: [
      { key: 'api_key',       label: 'Clinic API Key', value: 'adk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', revealed: false, editable: false },
      { key: 'webhook_url',   label: 'Webhook URL',    value: 'https://inspiredelta.com/webhooks/airdental', revealed: true,  editable: true  },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Online patient payment collection (card on file, digital checkout).',
    logoText: 'St',
    logoColor: 'bg-indigo-600',
    connected: false,
    docsUrl: 'https://dashboard.stripe.com',
    fields: [
      { key: 'publishable_key', label: 'Publishable Key', value: '', revealed: false, editable: true  },
      { key: 'secret_key',      label: 'Secret Key',      value: '', revealed: false, editable: false },
    ],
  },
];

function maskValue(val: string): string {
  if (!val) return '';
  if (val.length <= 6) return '●'.repeat(val.length);
  return '●'.repeat(val.length - 6) + val.slice(-6);
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(INTEGRATIONS);
  const [rotatingId,   setRotatingId]   = useState<string | null>(null);
  const [toast,        setToast]        = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function toggleReveal(integId: string, fieldKey: string) {
    setIntegrations(prev => prev.map(integ => {
      if (integ.id !== integId) return integ;
      return {
        ...integ,
        fields: integ.fields.map(f =>
          f.key === fieldKey ? { ...f, revealed: !f.revealed } : f
        ),
      };
    }));
  }

  function updateField(integId: string, fieldKey: string, newVal: string) {
    setIntegrations(prev => prev.map(integ => {
      if (integ.id !== integId) return integ;
      return {
        ...integ,
        fields: integ.fields.map(f =>
          f.key === fieldKey ? { ...f, value: newVal } : f
        ),
      };
    }));
  }

  async function handleRotate(integId: string) {
    // TODO: POST /api/integrations/:integId/rotate — backend generates new key
    setRotatingId(integId);
    await new Promise(r => setTimeout(r, 1200));
    setRotatingId(null);
    showToast('API key rotated. Update any external systems using the old key.');
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-[#64748b]">
        Credentials are stored encrypted server-side and never transmitted to the browser in plaintext.
        Rotation generates a new key and immediately invalidates the old one.
      </p>

      {integrations.map(integ => (
        <div key={integ.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          {/* Integration header */}
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
            <div className={`w-10 h-10 rounded-xl ${integ.logoColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {integ.logoText}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0f172a]">{integ.name}</span>
                {integ.connected
                  ? <CheckCircle className="w-4 h-4 text-green-500" />
                  : <XCircle    className="w-4 h-4 text-gray-300" />}
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${integ.connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {integ.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">{integ.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={integ.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#0891b2] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Dashboard
              </a>
              {integ.connected ? (
                <button
                  onClick={() => handleRotate(integ.id)}
                  disabled={rotatingId === integ.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-[#64748b] disabled:opacity-50 transition-colors"
                >
                  <RotateCw className={`w-3 h-3 ${rotatingId === integ.id ? 'animate-spin' : ''}`} />
                  Rotate Key
                </button>
              ) : (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0891b2] text-white hover:bg-[#0e7490] transition-colors">
                  <Plug className="w-3 h-3" />
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="px-5 py-4 space-y-3">
            {integ.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-[#64748b] mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly={!field.editable || !field.revealed}
                    value={field.revealed ? field.value : maskValue(field.value)}
                    onChange={e => field.editable && field.revealed && updateField(integ.id, field.key, e.target.value)}
                    placeholder={integ.connected ? '' : 'Not configured'}
                    className={[
                      'w-full text-sm border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#0891b2]',
                      (!field.editable || !field.revealed) ? 'bg-gray-50 text-[#64748b] cursor-default' : 'bg-white text-[#0f172a]',
                      !integ.connected ? 'border-dashed' : '',
                      'border-gray-200',
                    ].join(' ')}
                  />
                  {/* Reveal/hide button */}
                  {integ.connected && field.value && (
                    <button
                      type="button"
                      onClick={() => toggleReveal(integ.id, field.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                      tabIndex={-1}
                      title={field.revealed ? 'Hide value' : 'Reveal value'}
                    >
                      {field.revealed
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye    className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
