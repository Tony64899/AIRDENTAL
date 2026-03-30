// PatientListRow — single row in the patient list panel.
// ⚠️ HIPAA: Displays minimal PHI (name, chart #). Full data only in PatientChart.

import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { Patient, PatientStatus } from '../../types/patient';

interface PatientListRowProps {
  patient:    Patient;
  isSelected: boolean;
  onClick:    () => void;
}

const STATUS_BADGE: Record<PatientStatus, string> = {
  active:   'bg-green-50 text-green-700 border border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
  new:      'bg-blue-50 text-blue-700 border border-blue-200',
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function PatientListRow({ patient, isSelected, onClick }: PatientListRowProps) {
  const initials = getInitials(patient.firstName, patient.lastName);
  const hasBillingAlert = Boolean(patient.billingAlert);
  const hasBalance      = patient.balance > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100',
        isSelected
          ? 'bg-[#e0f2fe] border-l-2 border-l-[#0891b2]'
          : 'hover:bg-gray-50',
      ].join(' ')}
    >
      {/* Avatar */}
      <div
        className={[
          'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
          isSelected ? 'bg-[#0891b2] text-white' : 'bg-gray-200 text-[#64748b]',
        ].join(' ')}
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Name + chart number */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#0f172a] truncate">
          {patient.firstName} {patient.lastName}
        </div>
        <div className="text-[10px] text-[#94a3b8]">#{patient.chartNumber}</div>
      </div>

      {/* Right badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {/* Status badge */}
        <span
          className={[
            'text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase',
            STATUS_BADGE[patient.status],
          ].join(' ')}
        >
          {patient.status}
        </span>

        {/* Billing indicator */}
        {hasBillingAlert ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-500" aria-label="Billing alert" />
        ) : hasBalance ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-label="Balance remaining" />
        ) : null}
      </div>
    </button>
  );
}
