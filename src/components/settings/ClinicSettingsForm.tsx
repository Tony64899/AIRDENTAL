// ClinicSettingsForm — general clinic identity and contact settings.
// Admin-only. Subscription tier is read-only (managed via billing portal).

import { useState } from 'react';
import { Save, CheckCircle, Building2, Globe, Phone, Mail } from 'lucide-react';
import { useClinic } from '../../contexts/ClinicContext';

const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Phoenix',
  'Pacific/Honolulu',
  'America/Anchorage',
];

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  starter:      { label: 'Starter',      color: 'bg-gray-100 text-gray-700 border-gray-200' },
  professional: { label: 'Professional', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  enterprise:   { label: 'Enterprise',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export function ClinicSettingsForm() {
  const { clinicName, currentLocation } = useClinic();

  const [form, setForm] = useState({
    clinicName,
    website:    'https://www.inspiredelta.com',
    contactEmail: 'admin@inspiredelta.com',
    contactPhone: currentLocation.phone,
    timezone:   currentLocation.timezone,
  });
  const [isSaving,   setIsSaving]   = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    // TODO: PATCH /api/clinics/:clinicId with form data
    await new Promise(r => setTimeout(r, 500));
    setIsSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 3000);
  }

  const tier = 'professional';
  const badge = TIER_BADGE[tier];

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-6">
      {/* Logo placeholder */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-16 h-16 rounded-xl bg-[#0891b2] flex items-center justify-center flex-shrink-0">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0f172a]">{form.clinicName}</p>
          <p className="text-xs text-[#94a3b8] mb-2">Clinic logo — DICOM/PNG, max 2MB</p>
          <button
            type="button"
            className="text-xs font-medium text-[#0891b2] hover:text-[#0e7490] px-2.5 py-1 rounded-lg border border-[#0891b2]/30 hover:bg-[#0891b2]/5 transition-colors"
          >
            Upload Logo
          </button>
        </div>
      </div>

      {/* Clinic name */}
      <Field label="Clinic Name" required>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={form.clinicName}
            onChange={set('clinicName')}
            className={`${inputCls} pl-9`}
            placeholder="Inspire Dental"
            required
          />
        </div>
      </Field>

      {/* Website */}
      <Field label="Website">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="url"
            value={form.website}
            onChange={set('website')}
            className={`${inputCls} pl-9`}
            placeholder="https://www.yourpractice.com"
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        {/* Contact email */}
        <Field label="Admin Email" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="email"
              value={form.contactEmail}
              onChange={set('contactEmail')}
              className={`${inputCls} pl-9`}
              required
            />
          </div>
        </Field>

        {/* Contact phone */}
        <Field label="Main Phone" required>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="tel"
              value={form.contactPhone}
              onChange={set('contactPhone')}
              className={`${inputCls} pl-9`}
              required
            />
          </div>
        </Field>
      </div>

      {/* Timezone */}
      <Field label="Default Timezone">
        <select value={form.timezone} onChange={set('timezone')} className={inputCls}>
          {TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
          ))}
        </select>
      </Field>

      {/* Subscription tier — read-only */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">Subscription Plan</p>
            <p className="text-xs text-[#94a3b8]">Managed via the billing portal. Contact support to upgrade.</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#0891b2] text-white hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
        {savedFlash && (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <CheckCircle className="w-4 h-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white placeholder:text-[#94a3b8]';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#64748b] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
