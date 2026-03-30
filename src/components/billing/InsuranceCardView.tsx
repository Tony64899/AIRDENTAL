// InsuranceCardView.tsx — displays primary and secondary insurance plan cards.
// ⚠️ HIPAA: Insurance data is PHI. Display only to authorized users.

import { useState } from 'react';
import { Shield, Edit2 } from 'lucide-react';
import type { InsurancePlan } from '../../types/patient';
import { MOCK_PATIENTS_MAP } from '../../constants/mockPatients';
import { formatCurrency } from '../../utils/formatUtils';
import InsuranceEditModal from './InsuranceEditModal';

interface InsuranceCardViewProps {
  patientId: string;
}

const TYPE_LABEL: Record<string, string> = {
  ppo:      'PPO',
  hmo:      'HMO',
  medicaid: 'Medicaid',
  medicare: 'Medicare',
  cash:     'Cash Pay',
  other:    'Other',
};

const TYPE_COLOR: Record<string, string> = {
  ppo:      'bg-blue-100 text-blue-700',
  hmo:      'bg-purple-100 text-purple-700',
  medicaid: 'bg-green-100 text-green-700',
  medicare: 'bg-sky-100 text-sky-700',
  cash:     'bg-gray-100 text-gray-600',
  other:    'bg-gray-100 text-gray-600',
};

interface PlanState {
  primary:   InsurancePlan | undefined;
  secondary: InsurancePlan | undefined;
}

export default function InsuranceCardView({ patientId }: InsuranceCardViewProps) {
  const patient = MOCK_PATIENTS_MAP[patientId];
  const [plans, setPlans] = useState<PlanState>({
    primary:   patient?.primaryInsurance,
    secondary: patient?.secondaryInsurance,
  });
  const [editing, setEditing] = useState<'primary' | 'secondary' | null>(null);

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-[#94a3b8]">
        Patient not found.
      </div>
    );
  }

  const planToEdit = editing === 'primary' ? plans.primary : plans.secondary;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(['primary', 'secondary'] as const).map(slot => {
          const plan = plans[slot];
          if (!plan) {
            return (
              <div key={slot} className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center gap-2 text-[#94a3b8]">
                <Shield className="w-8 h-8 opacity-30" />
                <p className="text-sm capitalize">No {slot} insurance on file</p>
              </div>
            );
          }

          const annualUsedPct = plan.annualMax > 0
            ? Math.min(100, Math.round((plan.annualMaxUsed / plan.annualMax) * 100))
            : 0;
          const deductiblePct = plan.deductible > 0
            ? Math.min(100, Math.round((plan.deductibleMet / plan.deductible) * 100))
            : 100;

          return (
            <div key={slot} className="bg-white rounded-2xl border border-gray-200 p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0891b2]" />
                  <div>
                    <p className="text-xs font-medium text-[#94a3b8] uppercase tracking-widest capitalize">{slot} Insurance</p>
                    <p className="text-sm font-semibold text-[#0f172a] leading-tight">{plan.carrier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[plan.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_LABEL[plan.type] ?? plan.type.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setEditing(slot)}
                    className="p-1 rounded hover:bg-gray-100 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
                    title="Edit insurance info"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* IDs */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Member ID</p>
                  <p className="font-mono text-[#0f172a]">{plan.memberId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Group #</p>
                  <p className="font-mono text-[#0f172a]">{plan.groupNumber}</p>
                </div>
                {plan.subscriberName && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Subscriber</p>
                    <p className="text-[#0f172a]">{plan.subscriberName}</p>
                  </div>
                )}
                {plan.groupName && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Group Name</p>
                    <p className="text-[#0f172a] text-xs">{plan.groupName}</p>
                  </div>
                )}
              </div>

              {/* Annual Max */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#64748b]">Annual Max</span>
                  <span className="text-[#0f172a]">
                    {plan.annualMax > 0
                      ? `${formatCurrency(plan.annualMaxUsed / 100)} used of ${formatCurrency(plan.annualMax / 100)}`
                      : 'Unlimited'}
                  </span>
                </div>
                {plan.annualMax > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${annualUsedPct >= 90 ? 'bg-red-400' : annualUsedPct >= 70 ? 'bg-amber-400' : 'bg-[#0891b2]'}`}
                      style={{ width: `${annualUsedPct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Deductible */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#64748b]">Deductible</span>
                  <span className="text-[#0f172a]">
                    {plan.deductible > 0
                      ? `${formatCurrency(plan.deductibleMet / 100)} met of ${formatCurrency(plan.deductible / 100)}`
                      : 'None'}
                  </span>
                </div>
                {plan.deductible > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-400 transition-all"
                      style={{ width: `${deductiblePct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Coverage grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#f8fafc] rounded-xl p-3">
                {[
                  { label: 'Preventive', pct: plan.preventiveCoverage },
                  { label: 'Basic',      pct: plan.basicCoverage },
                  { label: 'Major',      pct: plan.majorCoverage },
                ].map(({ label, pct }) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-lg font-bold text-[#0891b2]">{pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && planToEdit && (
        <InsuranceEditModal
          plan={planToEdit}
          label={editing === 'primary' ? 'Primary' : 'Secondary'}
          onSave={updated => {
            setPlans(prev => ({ ...prev, [editing]: updated }));
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
