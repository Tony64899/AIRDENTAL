// InsuranceTab — detailed insurance plan information for primary and secondary coverage.
// ⚠️ HIPAA: Insurance data is PHI. Never cache or transmit without authorization.

import { Shield } from 'lucide-react';
import type { Patient, InsurancePlan, InsuranceType } from '../../../types/patient';
import { formatCurrency } from '../../../utils/formatUtils';

interface InsuranceTabProps {
  patient: Patient;
}

// ── Insurance type badge ───────────────────────────────────────────────────
const TYPE_BADGE: Record<InsuranceType, string> = {
  ppo:      'bg-blue-50 text-blue-700 border border-blue-200',
  hmo:      'bg-purple-50 text-purple-700 border border-purple-200',
  medicaid: 'bg-green-50 text-green-700 border border-green-200',
  medicare: 'bg-teal-50 text-teal-700 border border-teal-200',
  cash:     'bg-gray-100 text-gray-600 border border-gray-200',
  other:    'bg-gray-100 text-gray-600 border border-gray-200',
};

const TYPE_LABEL: Record<InsuranceType, string> = {
  ppo:      'PPO',
  hmo:      'HMO',
  medicaid: 'Medicaid',
  medicare: 'Medicare',
  cash:     'Cash',
  other:    'Other',
};

// ── Insurance card ─────────────────────────────────────────────────────────

function InsuranceCard({
  plan,
  title,
}: {
  plan:  InsurancePlan;
  title: string;
}) {
  // Convert cents → dollars for formatCurrency
  const annualMaxDollars      = plan.annualMax / 100;
  const annualMaxUsedDollars  = plan.annualMaxUsed / 100;
  const annualRemaining       = Math.max(0, annualMaxDollars - annualMaxUsedDollars);
  const annualUsedPct         = plan.annualMax > 0
    ? Math.min(100, Math.round((plan.annualMaxUsed / plan.annualMax) * 100))
    : 0;

  const deductibleDollars    = plan.deductible / 100;
  const deductibleMetDollars = plan.deductibleMet / 100;
  const deductibleRemaining  = Math.max(0, deductibleDollars - deductibleMetDollars);
  const deductiblePct        = plan.deductible > 0
    ? Math.min(100, Math.round((plan.deductibleMet / plan.deductible) * 100))
    : 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#0891b2] flex-shrink-0" />
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">{title}</div>
            <div className="text-base font-semibold text-[#0f172a] mt-0.5">{plan.carrier}</div>
          </div>
        </div>
        <span
          className={[
            'text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0',
            TYPE_BADGE[plan.type],
          ].join(' ')}
        >
          {TYPE_LABEL[plan.type]}
        </span>
      </div>

      {/* Plan details */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Member ID</div>
          <div className="text-[#0f172a]">{plan.memberId}</div>
        </div>
        {plan.groupNumber && (
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Group Number</div>
            <div className="text-[#0f172a]">{plan.groupNumber}</div>
          </div>
        )}
        {plan.groupName && (
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Group Name</div>
            <div className="text-[#0f172a]">{plan.groupName}</div>
          </div>
        )}
        {plan.subscriberName && (
          <div>
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Subscriber</div>
            <div className="text-[#0f172a]">{plan.subscriberName}</div>
            <div className="text-[10px] text-[#64748b] capitalize">{plan.relationship}</div>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">Benefits</div>

        {/* Annual Maximum */}
        {plan.annualMax > 0 ? (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#64748b]">Annual Maximum</span>
              <span className="font-medium text-[#0f172a]">{formatCurrency(annualMaxDollars)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div
                className="bg-[#0891b2] h-1.5 rounded-full transition-all"
                style={{ width: `${annualUsedPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#94a3b8]">
              <span>Used: {formatCurrency(annualMaxUsedDollars)}</span>
              <span>Remaining: {formatCurrency(annualRemaining)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Annual Maximum</span>
            <span className="text-green-700 font-medium">Unlimited</span>
          </div>
        )}

        {/* Deductible */}
        {plan.deductible > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#64748b]">Deductible</span>
              <span className="font-medium text-[#0f172a]">{formatCurrency(deductibleDollars)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${deductiblePct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#94a3b8]">
              <span>Met: {formatCurrency(deductibleMetDollars)}</span>
              <span>Remaining: {formatCurrency(deductibleRemaining)}</span>
            </div>
          </div>
        )}

        {/* Coverage percentages */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-[#0f172a]">{plan.preventiveCoverage}%</div>
            <div className="text-[10px] text-[#64748b] mt-0.5">Preventive</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-[#0f172a]">{plan.basicCoverage}%</div>
            <div className="text-[10px] text-[#64748b] mt-0.5">Basic</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-[#0f172a]">{plan.majorCoverage}%</div>
            <div className="text-[10px] text-[#64748b] mt-0.5">Major</div>
          </div>
        </div>

        {/* Ortho Lifetime Max */}
        {plan.orthoLifetimeMax !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Ortho Lifetime Max</span>
            <span className="font-medium text-[#0f172a]">{formatCurrency(plan.orthoLifetimeMax / 100)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function InsuranceTab({ patient }: InsuranceTabProps) {
  return (
    <div className="space-y-4">
      {patient.primaryInsurance ? (
        <InsuranceCard plan={patient.primaryInsurance} title="Primary Insurance" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="text-sm text-[#94a3b8]">No primary insurance on file</div>
        </div>
      )}

      {patient.secondaryInsurance && (
        <InsuranceCard plan={patient.secondaryInsurance} title="Secondary Insurance" />
      )}
    </div>
  );
}
