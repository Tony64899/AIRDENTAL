// LocationSettingsPanel — tabbed right-panel for editing a single location's settings.
// Tabs: General | Business Hours | Operatories | Providers | Insurance
// ⚠️ HIPAA: NPI and Tax ID shown masked and never logged to console.

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import type { Location, InsuranceContract } from '../../types/clinic';
import type { Provider } from '../../types/provider';
import { BusinessHoursEditor }   from './BusinessHoursEditor';
import { OperatoryList }         from './OperatoryList';
import { ProviderAssignment }    from './ProviderAssignment';
import { InsuranceContractList } from './InsuranceContractList';
import {
  updateLocation,
  addOperatory, updateOperatory, deleteOperatory,
  addInsuranceContract, removeInsuranceContract,
  assignProviderToLocation, removeProviderFromLocation,
} from '../../services/locationService';

type TabId = 'general' | 'hours' | 'operatories' | 'providers' | 'insurance';

const TABS: { id: TabId; label: string }[] = [
  { id: 'general',     label: 'General'       },
  { id: 'hours',       label: 'Business Hours' },
  { id: 'operatories', label: 'Operatories'   },
  { id: 'providers',   label: 'Providers'     },
  { id: 'insurance',   label: 'Insurance'     },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

interface LocationSettingsPanelProps {
  location:     Location;
  allProviders: Provider[];
  onLocationUpdated: (loc: Location) => void;
}

export function LocationSettingsPanel({
  location, allProviders, onLocationUpdated,
}: LocationSettingsPanelProps) {
  const [activeTab,  setActiveTab]  = useState<TabId>('general');
  const [isSaving,   setIsSaving]   = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Local working copy of location (editable fields)
  const [draft, setDraft] = useState<Location>(location);
  const [showNpi,   setShowNpi]   = useState(false);
  const [showTaxId, setShowTaxId] = useState(false);

  // Reset draft when selected location changes
  useEffect(() => {
    setDraft(location);
    setActiveTab('general');
    setShowNpi(false);
    setShowTaxId(false);
  }, [location.id]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(location);

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await updateLocation(location.id, draft);
      onLocationUpdated(updated);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  function setField<K extends keyof Location>(key: K, value: Location[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  // ── Operatory handlers ────────────────────────────────────────────────────
  async function handleAddOp(name: string) {
    const op = await addOperatory(location.id, name);
    const updated = { ...draft, operatories: [...draft.operatories, op] };
    setDraft(updated);
    onLocationUpdated(updated);
  }

  async function handleUpdateOp(id: string, patch: { name?: string; isActive?: boolean }) {
    await updateOperatory(location.id, id, patch);
    const updated = {
      ...draft,
      operatories: draft.operatories.map(op => op.id === id ? { ...op, ...patch } : op),
    };
    setDraft(updated);
    onLocationUpdated(updated);
  }

  async function handleDeleteOp(id: string) {
    await deleteOperatory(location.id, id);
    const updated = {
      ...draft,
      operatories: draft.operatories.filter(op => op.id !== id),
    };
    setDraft(updated);
    onLocationUpdated(updated);
  }

  // ── Insurance handlers ────────────────────────────────────────────────────
  async function handleAddContract(contract: Omit<InsuranceContract, 'id'>) {
    const newContract = await addInsuranceContract(location.id, contract);
    const updated = { ...draft, insuranceContracts: [...draft.insuranceContracts, newContract] };
    setDraft(updated);
    onLocationUpdated(updated);
  }

  async function handleRemoveContract(contractId: string) {
    await removeInsuranceContract(location.id, contractId);
    const updated = {
      ...draft,
      insuranceContracts: draft.insuranceContracts.filter(c => c.id !== contractId),
    };
    setDraft(updated);
    onLocationUpdated(updated);
  }

  // ── Provider handlers ─────────────────────────────────────────────────────
  async function handleAssignProvider(providerId: string) {
    await assignProviderToLocation(providerId, location.id);
    const updated = { ...draft, providerIds: [...draft.providerIds, providerId] };
    setDraft(updated);
    onLocationUpdated(updated);
  }

  async function handleRemoveProvider(providerId: string) {
    await removeProviderFromLocation(providerId, location.id);
    const updated = { ...draft, providerIds: draft.providerIds.filter(id => id !== providerId) };
    setDraft(updated);
    onLocationUpdated(updated);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">{location.name}</h2>
            <p className="text-sm text-[#64748b]">{location.address}, {location.city}, {location.state} {location.zip}</p>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {savedFlash && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={[
                'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors',
                isDirty && !isSaving
                  ? 'bg-[#0891b2] text-white hover:bg-[#0e7490]'
                  : 'bg-gray-100 text-[#94a3b8] cursor-not-allowed',
              ].join(' ')}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex -mb-px">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-[#0891b2] text-[#0891b2]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ── General ───────────────────────────────────────────────────────── */}
        {activeTab === 'general' && (
          <div className="space-y-5 max-w-xl">
            <FormRow label="Location Name" required>
              <TextInput
                value={draft.name}
                onChange={v => setField('name', v)}
                placeholder="e.g. Main Office"
              />
            </FormRow>

            <FormRow label="Street Address" required>
              <TextInput
                value={draft.address}
                onChange={v => setField('address', v)}
                placeholder="123 Dental Way"
              />
            </FormRow>

            <div className="grid grid-cols-[1fr_80px_100px] gap-3">
              <FormRow label="City" required>
                <TextInput value={draft.city} onChange={v => setField('city', v)} placeholder="San Francisco" />
              </FormRow>
              <FormRow label="State" required>
                <select
                  value={draft.state}
                  onChange={e => setField('state', e.target.value)}
                  className={selectCls}
                >
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormRow>
              <FormRow label="ZIP" required>
                <TextInput value={draft.zip} onChange={v => setField('zip', v)} placeholder="94102" maxLength={10} />
              </FormRow>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Phone" required>
                <TextInput value={draft.phone} onChange={v => setField('phone', v)} placeholder="4155550100" type="tel" />
              </FormRow>
              <FormRow label="Fax">
                <TextInput value={draft.fax ?? ''} onChange={v => setField('fax', v || undefined)} placeholder="4155550101" type="tel" />
              </FormRow>
            </div>

            <FormRow label="Email">
              <TextInput value={draft.email ?? ''} onChange={v => setField('email', v || undefined)} placeholder="office@clinic.com" type="email" />
            </FormRow>

            <div className="border-t border-gray-200 pt-5 mt-5">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-4">
                ⚠️ HIPAA — Billing Identifiers
              </p>

              {/* NPI */}
              <FormRow label="NPI Number (Type 2 — Organizational)">
                <div className="relative">
                  <TextInput
                    value={showNpi ? (draft.npi ?? '') : maskValue(draft.npi ?? '')}
                    onChange={v => setField('npi', v || undefined)}
                    placeholder="10-digit NPI"
                    maxLength={10}
                    readOnly={!showNpi}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNpi(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                    tabIndex={-1}
                  >
                    {showNpi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormRow>

              {/* Tax ID */}
              <FormRow label="Tax ID (EIN)">
                <div className="relative">
                  <TextInput
                    value={showTaxId ? (draft.taxId ?? '') : maskValue(draft.taxId ?? '')}
                    onChange={v => setField('taxId', v || undefined)}
                    placeholder="XX-XXXXXXX"
                    readOnly={!showTaxId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTaxId(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                    tabIndex={-1}
                  >
                    {showTaxId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormRow>
            </div>

            {/* Active / Primary toggles */}
            <div className="border-t border-gray-200 pt-5 space-y-3">
              <ToggleRow
                label="Location Active"
                description="Inactive locations are hidden from the scheduler and billing."
                checked={draft.isActive}
                onChange={v => setField('isActive', v)}
              />
              <ToggleRow
                label="Primary Location"
                description="The primary location is selected by default on login."
                checked={draft.isPrimary}
                onChange={v => setField('isPrimary', v)}
              />
            </div>
          </div>
        )}

        {/* ── Business Hours ─────────────────────────────────────────────── */}
        {activeTab === 'hours' && (
          <div className="max-w-xl">
            <p className="text-xs text-[#64748b] mb-4">
              Set operating hours for each day of the week. Toggle to mark as closed.
            </p>
            <BusinessHoursEditor
              hours={draft.businessHours}
              onChange={hours => setField('businessHours', hours)}
            />
          </div>
        )}

        {/* ── Operatories ───────────────────────────────────────────────── */}
        {activeTab === 'operatories' && (
          <div className="max-w-lg">
            <p className="text-xs text-[#64748b] mb-4">
              Manage exam chairs / treatment rooms at this location. Active operatories appear in the scheduler.
            </p>
            <OperatoryList
              operatories={draft.operatories}
              onAdd={handleAddOp}
              onUpdate={handleUpdateOp}
              onDelete={handleDeleteOp}
            />
          </div>
        )}

        {/* ── Providers ─────────────────────────────────────────────────── */}
        {activeTab === 'providers' && (
          <div className="max-w-lg">
            <ProviderAssignment
              locationId={location.id}
              allProviders={allProviders}
              assignedIds={draft.providerIds}
              onAssign={handleAssignProvider}
              onRemove={handleRemoveProvider}
            />
          </div>
        )}

        {/* ── Insurance ─────────────────────────────────────────────────── */}
        {activeTab === 'insurance' && (
          <div className="max-w-xl">
            <p className="text-xs text-[#64748b] mb-4">
              Insurance plans accepted at this location. Billing claims use the location's NPI when submitted.
            </p>
            <InsuranceContractList
              contracts={draft.insuranceContracts}
              onAdd={handleAddContract}
              onRemove={handleRemoveContract}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#64748b] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = 'text', maxLength, readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white placeholder:text-[#94a3b8] read-only:bg-gray-50 read-only:cursor-default"
    />
  );
}

const selectCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white';

function ToggleRow({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-[#0f172a]">{label}</div>
        <div className="text-xs text-[#94a3b8]">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex w-10 h-5 rounded-full transition-colors flex-shrink-0',
          checked ? 'bg-[#0891b2]' : 'bg-gray-200',
        ].join(' ')}
      >
        <span className={[
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')} />
      </button>
    </div>
  );
}

function maskValue(val: string): string {
  if (!val) return '';
  if (val.length <= 4) return '●'.repeat(val.length);
  return '●'.repeat(val.length - 4) + val.slice(-4);
}
