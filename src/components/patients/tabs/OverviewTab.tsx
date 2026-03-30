// OverviewTab — demographics, contact, insurance summary, and billing status.
// ⚠️ HIPAA: PHI displayed only for authenticated providers. Never cache or log.

import { Phone, Mail, Users, AlertCircle } from 'lucide-react';
import type { Patient, PatientStatus }     from '../../../types/patient';
import { formatCurrency }                  from '../../../utils/formatUtils';

interface OverviewTabProps {
  patient: Patient;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDOB(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function calcAge(dob: string): number {
  const [y, m, d] = dob.split('-').map(Number);
  const today     = new Date();
  let age         = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
  return age;
}

const STATUS_BADGE: Record<PatientStatus, string> = {
  active:   'bg-green-50 text-green-700 border border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
  new:      'bg-blue-50 text-blue-700 border border-blue-200',
};

const CARD = 'bg-white rounded-2xl border border-gray-200 p-5';
const LABEL = 'text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5';
const VALUE = 'text-sm text-[#0f172a]';

// ── Sub-components ─────────────────────────────────────────────────────────

function DemographicsCard({ patient }: { patient: Patient }) {
  const age = calcAge(patient.dateOfBirth);
  return (
    <div className={CARD}>
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4">Demographics</h3>
      <div className="space-y-3">
        {/* Name */}
        <div>
          <div className="text-base font-semibold text-[#0f172a]">
            {patient.firstName} {patient.lastName}
          </div>
          <div className="text-xs text-[#94a3b8]">Chart #{patient.chartNumber}</div>
        </div>

        {/* DOB + Age */}
        <div>
          <div className={LABEL}>Date of Birth</div>
          <div className="flex items-baseline gap-2">
            <span className={VALUE}>{formatDOB(patient.dateOfBirth)}</span>
            <span className="text-[10px] text-[#64748b] bg-gray-100 px-1.5 py-0.5 rounded font-medium">
              {age} yrs
            </span>
          </div>
        </div>

        {/* Gender */}
        <div>
          <div className={LABEL}>Gender</div>
          <div className={VALUE}>
            {patient.gender === 'male' ? '(Biological) Male' : '(Biological) Female'}
          </div>
        </div>

        {/* Status */}
        <div>
          <div className={LABEL}>Status</div>
          <span
            className={[
              'text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase',
              STATUS_BADGE[patient.status],
            ].join(' ')}
          >
            {patient.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ patient }: { patient: Patient }) {
  return (
    <div className={CARD}>
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4">Contact</h3>
      <div className="space-y-3">
        {/* Phone */}
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
          <span className={VALUE}>{patient.phone}</span>
        </div>

        {/* Email */}
        {patient.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
            <span className="text-sm text-[#0f172a] truncate">{patient.email}</span>
          </div>
        )}

        {/* Address */}
        {patient.address && (
          <div>
            <div className={LABEL}>Address</div>
            <div className={VALUE}>{patient.address.street}</div>
            <div className={VALUE}>
              {patient.address.city}, {patient.address.state} {patient.address.zip}
            </div>
          </div>
        )}

        {/* Emergency contact */}
        {patient.emergencyContact && (
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Users className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
              <div className={LABEL} style={{ marginBottom: 0 }}>Emergency Contact</div>
            </div>
            <div className={VALUE}>{patient.emergencyContact.name}</div>
            <div className="text-xs text-[#64748b]">{patient.emergencyContact.relationship}</div>
            <div className="text-xs text-[#64748b]">{patient.emergencyContact.phone}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function InsuranceSummaryCard({ patient }: { patient: Patient }) {
  const ins = patient.primaryInsurance;

  if (!ins) {
    return (
      <div className={CARD}>
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Insurance</h3>
        <div className="text-sm text-[#94a3b8]">No insurance on file</div>
      </div>
    );
  }

  const maxDollars       = ins.annualMax / 100;
  const usedDollars      = ins.annualMaxUsed / 100;
  const remainingDollars = Math.max(0, maxDollars - usedDollars);
  const usedPct          = ins.annualMax > 0
    ? Math.min(100, Math.round((ins.annualMaxUsed / ins.annualMax) * 100))
    : 0;

  return (
    <div className={CARD}>
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4">Insurance Summary</h3>
      <div className="space-y-3">
        <div>
          <div className="font-semibold text-[#0f172a]">{ins.carrier}</div>
          <div className="text-xs text-[#64748b]">Member ID: {ins.memberId}</div>
          {ins.groupNumber && (
            <div className="text-xs text-[#64748b]">Group: {ins.groupNumber}</div>
          )}
        </div>

        {/* Annual max progress */}
        {ins.annualMax > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#64748b]">Annual Maximum</span>
              <span className="text-[#0f172a] font-medium">{formatCurrency(maxDollars)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div
                className="bg-[#0891b2] h-1.5 rounded-full transition-all"
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#94a3b8]">
              <span>Used: {formatCurrency(usedDollars)}</span>
              <span>Remaining: {formatCurrency(remainingDollars)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BillingStatusCard({ patient }: { patient: Patient }) {
  const balance = patient.balance / 100;
  let colorClass: string;
  if (balance <= 0) {
    colorClass = 'text-green-700';
  } else if (patient.billingAlert) {
    colorClass = 'text-red-700';
  } else {
    colorClass = 'text-amber-700';
  }

  return (
    <div className={CARD}>
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Billing Status</h3>
      <div className="space-y-2">
        <div className={`text-xl font-bold ${colorClass}`}>
          {formatCurrency(balance)}
        </div>
        {balance <= 0 ? (
          <div className="text-xs text-green-600">Account balance is clear</div>
        ) : (
          <div className="text-xs text-[#64748b]">Outstanding balance</div>
        )}
        {patient.billingAlert && (
          <div className="flex items-start gap-2 mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-red-700">{patient.billingAlert}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function OverviewTab({ patient }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Top 2-column row */}
      <div className="grid grid-cols-2 gap-4">
        <DemographicsCard patient={patient} />
        <ContactCard      patient={patient} />
      </div>

      {/* Full-width insurance summary */}
      <InsuranceSummaryCard patient={patient} />

      {/* Full-width billing status */}
      <BillingStatusCard patient={patient} />
    </div>
  );
}
