// MedHistoryTab — allergies, medications, and medical conditions.
// ⚠️ HIPAA: PHI — displayed only for authenticated clinical staff. Never cache.

import { ShieldAlert, Pill, Activity, CheckCircle2 } from 'lucide-react';
import type { Patient, AllergySeverity } from '../../../types/patient';

interface MedHistoryTabProps {
  patient: Patient;
}

const CARD = 'bg-white rounded-2xl border border-gray-200 p-5 space-y-3';

// ── Allergy severity badge ─────────────────────────────────────────────────
const SEVERITY_BADGE: Record<AllergySeverity, string> = {
  mild:     'bg-yellow-50 text-yellow-700 border border-yellow-200',
  moderate: 'bg-orange-50 text-orange-700 border border-orange-200',
  severe:   'bg-red-100  text-red-800    border border-red-300',
};

// ── Sub-sections ───────────────────────────────────────────────────────────

function AllergiesSection({ patient }: { patient: Patient }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-700 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-red-700">Allergies</h3>
      </div>

      {patient.allergies.length === 0 ? (
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">No known allergies</span>
        </div>
      ) : (
        <div className="space-y-2">
          {patient.allergies.map(allergy => (
            <div key={allergy.substance} className="flex items-center flex-wrap gap-2">
              {/* Substance pill */}
              <span className="text-xs font-medium bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">
                {allergy.substance}
                {allergy.reaction ? ` (${allergy.reaction})` : ''}
              </span>
              {/* Severity badge */}
              <span
                className={[
                  'text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase',
                  SEVERITY_BADGE[allergy.severity],
                ].join(' ')}
              >
                {allergy.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MedicationsSection({ patient }: { patient: Patient }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2">
        <Pill className="w-4 h-4 text-blue-700 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-blue-700">Current Medications</h3>
      </div>

      {patient.medications.length === 0 ? (
        <div className="text-sm text-[#94a3b8]">No medications recorded</div>
      ) : (
        <div className="space-y-2">
          {patient.medications.map(med => (
            <div key={med.name} className="text-sm">
              <span className="font-medium text-[#0f172a]">{med.name}</span>
              {med.dose && (
                <span className="text-[#64748b]"> — {med.dose}</span>
              )}
              {med.notes && (
                <div className="text-xs text-[#94a3b8] mt-0.5">{med.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConditionsSection({ patient }: { patient: Patient }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-amber-700">Medical Conditions</h3>
      </div>

      {patient.medicalConditions.length === 0 ? (
        <div className="text-sm text-[#94a3b8]">No conditions reported</div>
      ) : (
        <div className="space-y-2">
          {patient.medicalConditions.map(condition => (
            <div key={condition.name} className="text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#0f172a]">{condition.name}</span>
                {condition.since && (
                  <span className="text-[10px] text-[#94a3b8]">since {condition.since}</span>
                )}
              </div>
              {condition.notes && (
                <div className="text-xs text-[#94a3b8] mt-0.5">{condition.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function MedHistoryTab({ patient }: MedHistoryTabProps) {
  return (
    <div className="space-y-4">
      <AllergiesSection  patient={patient} />
      <MedicationsSection patient={patient} />
      <ConditionsSection  patient={patient} />
    </div>
  );
}
