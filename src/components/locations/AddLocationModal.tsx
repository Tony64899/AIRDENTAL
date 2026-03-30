// AddLocationModal — quick form to create a new clinic location.
// NPI / Tax ID are optional and can be added later in full settings.
// ⚠️ HIPAA: NPI and Tax ID must not be logged or included in URL params.

import { useState } from 'react';
import { X, Building2 } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

interface AddLocationModalProps {
  clinicId: string;
  onSave:   (data: {
    clinicId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    timezone: string;
    isActive: boolean;
    isPrimary: boolean;
  }) => void;
  onClose: () => void;
}

export function AddLocationModal({ clinicId, onSave, onClose }: AddLocationModalProps) {
  const [form, setForm] = useState({
    name:     '',
    address:  '',
    city:     '',
    state:    'CA',
    zip:      '',
    phone:    '',
  });

  const isValid = form.name.trim() && form.address.trim() && form.city.trim() && form.zip.trim() && form.phone.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      clinicId,
      name:      form.name.trim(),
      address:   form.address.trim(),
      city:      form.city.trim(),
      state:     form.state,
      zip:       form.zip.trim(),
      phone:     form.phone.replace(/\D/g, ''),
      timezone:  'America/Los_Angeles',
      isActive:  true,
      isPrimary: false,
    });
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-[#0891b2]" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-[#0f172a]">Add New Location</h2>
            <p className="text-xs text-[#94a3b8]">NPI and Tax ID can be added in settings after creation.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#94a3b8] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Location name */}
          <Field label="Location Name" required>
            <input
              autoFocus
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Westside Office"
              className={inputCls}
            />
          </Field>

          {/* Address */}
          <Field label="Street Address" required>
            <input
              value={form.address}
              onChange={set('address')}
              placeholder="123 Main St"
              className={inputCls}
            />
          </Field>

          {/* City / State / ZIP */}
          <div className="grid grid-cols-[1fr_80px_100px] gap-3">
            <Field label="City" required>
              <input value={form.city} onChange={set('city')} placeholder="San Francisco" className={inputCls} />
            </Field>
            <Field label="State" required>
              <select value={form.state} onChange={set('state')} className={inputCls}>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ZIP" required>
              <input value={form.zip} onChange={set('zip')} placeholder="94102" maxLength={10} className={inputCls} />
            </Field>
          </div>

          {/* Phone */}
          <Field label="Phone" required>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="(415) 555-0100"
              className={inputCls}
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#0891b2] text-white hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
            >
              Create Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white placeholder:text-[#94a3b8]';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#64748b] mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
