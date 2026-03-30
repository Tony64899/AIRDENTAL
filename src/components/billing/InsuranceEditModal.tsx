// InsuranceEditModal.tsx — edit subscriber info for an insurance plan.
// ⚠️ HIPAA: Insurance/subscriber data is PHI. All changes must be audit-logged in production.

import { useState } from 'react';
import { X } from 'lucide-react';
import type { InsurancePlan } from '../../types/patient';

interface InsuranceEditModalProps {
  plan:    InsurancePlan;
  label:   string;   // "Primary" | "Secondary"
  onSave:  (updated: InsurancePlan) => void;
  onClose: () => void;
}

export default function InsuranceEditModal({ plan, label, onSave, onClose }: InsuranceEditModalProps) {
  const [carrier, setCarrier]         = useState(plan.carrier);
  const [memberId, setMemberId]       = useState(plan.memberId);
  const [groupNumber, setGroupNumber] = useState(plan.groupNumber);
  const [groupName, setGroupName]     = useState(plan.groupName ?? '');
  const [subscriberName, setSubName]  = useState(plan.subscriberName ?? '');

  const handleSave = () => {
    onSave({ ...plan, carrier, memberId, groupNumber, groupName, subscriberName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[440px] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-[#0f172a]">Edit {label} Insurance</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Carrier / Payer Name</label>
            <input
              type="text"
              value={carrier}
              onChange={e => setCarrier(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Member ID</label>
            <input
              type="text"
              value={memberId}
              onChange={e => setMemberId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Group Number</label>
            <input
              type="text"
              value={groupNumber}
              onChange={e => setGroupNumber(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Subscriber Name</label>
            <input
              type="text"
              value={subscriberName}
              onChange={e => setSubName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
          <p className="text-xs text-[#94a3b8]">
            Note: Coverage percentages, deductible, and annual max are managed by your insurance coordinator.
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#64748b] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
