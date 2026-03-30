// InsuranceContractList — insurance plans accepted at a specific location.
// Shows carrier, plan type, effective date, status.  Add / remove contracts.

import { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { InsuranceContract } from '../../types/clinic';

interface InsuranceContractListProps {
  contracts: InsuranceContract[];
  onAdd:     (contract: Omit<InsuranceContract, 'id'>) => void;
  onRemove:  (contractId: string) => void;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

const PLAN_TYPES = ['PPO', 'HMO', 'Medicaid', 'Medicare', 'DHMO', 'Indemnity', 'Other'];

export function InsuranceContractList({ contracts, onAdd, onRemove }: InsuranceContractListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm]         = useState<Omit<InsuranceContract, 'id'>>({
    carrier: '', planType: 'PPO', effectiveDate: '', isActive: true,
  });

  function handleAdd() {
    if (!form.carrier.trim() || !form.effectiveDate) return;
    onAdd({ ...form, carrier: form.carrier.trim() });
    setForm({ carrier: '', planType: 'PPO', effectiveDate: '', isActive: true });
    setIsAdding(false);
  }

  return (
    <div className="space-y-2">
      {contracts.length === 0 && !isAdding && (
        <p className="text-sm text-[#94a3b8] text-center py-6 border border-dashed border-gray-200 rounded-xl">
          No insurance contracts added yet.
        </p>
      )}

      {/* Contract rows */}
      {contracts.map(c => (
        <div
          key={c.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
        >
          {/* Status icon */}
          {c.isActive
            ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            : <XCircle    className="w-4 h-4 text-gray-300   flex-shrink-0" />}

          {/* Carrier + plan */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#0f172a] truncate">{c.carrier}</div>
            <div className="text-xs text-[#94a3b8]">
              {c.planType}
              {c.contractId && ` · ${c.contractId}`}
              {` · Effective ${formatDate(c.effectiveDate)}`}
              {c.expiresDate && ` – ${formatDate(c.expiresDate)}`}
            </div>
          </div>

          {/* Plan type badge */}
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
            {c.planType}
          </span>

          {/* Remove */}
          <button
            onClick={() => onRemove(c.id)}
            className="p-1 rounded text-[#94a3b8] hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
            title="Remove contract"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Add form */}
      {isAdding ? (
        <div className="p-4 border border-dashed border-[#0891b2] rounded-xl bg-[#f0f9ff] space-y-3">
          <p className="text-xs font-semibold text-[#0891b2]">New Insurance Contract</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748b] font-medium mb-1 block">Carrier *</label>
              <input
                autoFocus
                value={form.carrier}
                onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))}
                placeholder="e.g. Delta Dental"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] font-medium mb-1 block">Plan Type *</label>
              <select
                value={form.planType}
                onChange={e => setForm(f => ({ ...f, planType: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
              >
                {PLAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#64748b] font-medium mb-1 block">Contract ID</label>
              <input
                value={form.contractId ?? ''}
                onChange={e => setForm(f => ({ ...f, contractId: e.target.value || undefined }))}
                placeholder="Optional"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] font-medium mb-1 block">Effective Date *</label>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!form.carrier.trim() || !form.effectiveDate}
              className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-[#0891b2] text-white hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
            >
              Add Contract
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="text-sm text-[#64748b] hover:text-[#0f172a]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-[#64748b] hover:border-[#0891b2] hover:text-[#0891b2] hover:bg-[#f0f9ff] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Insurance Contract
        </button>
      )}
    </div>
  );
}
