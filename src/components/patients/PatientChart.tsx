// PatientChart — right panel chart viewer for the selected patient.
// ⚠️ HIPAA: Displays full PHI. Only render for authenticated providers.

import { useState }    from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Phone, ExternalLink } from 'lucide-react';
import type { PatientStatus } from '../../types/patient';
import { usePatient }   from '../../hooks/usePatient';
import { OverviewTab }       from './tabs/OverviewTab';
import { MedHistoryTab }     from './tabs/MedHistoryTab';
import { InsuranceTab }      from './tabs/InsuranceTab';
import { BillingTab }        from './tabs/BillingTab';
import { AppointmentsTab }   from './tabs/AppointmentsTab';
import { Odontogram }        from '../odontogram/Odontogram';
import { XrayGallery }       from '../xray/XrayGallery';
import { useXray }           from '../../hooks/useXray';

interface PatientChartProps {
  patientId: string;
}

type TabId = 'overview' | 'med-history' | 'odontogram' | 'insurance' | 'billing' | 'appointments' | 'xrays';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',      label: 'Overview' },
  { id: 'med-history',   label: 'Medical History' },
  { id: 'odontogram',    label: 'Odontogram' },
  { id: 'insurance',     label: 'Insurance' },
  { id: 'billing',       label: 'Billing' },
  { id: 'appointments',  label: 'Appointments' },
  { id: 'xrays',         label: 'X-rays' },
];

const STATUS_BADGE: Record<PatientStatus, string> = {
  active:   'bg-green-50 text-green-700 border border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
  new:      'bg-blue-50 text-blue-700 border border-blue-200',
};

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

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function PatientChart({ patientId }: PatientChartProps) {
  const { patient, loadState, error } = usePatient(patientId);
  const [activeTab, setActiveTab]     = useState<TabId>('overview');

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse bg-gray-200 rounded-xl h-24" />
        <div className="animate-pulse bg-gray-200 rounded-xl h-8" />
        <div className="animate-pulse bg-gray-200 rounded-xl h-48" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (loadState === 'error' || !patient) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error ?? 'Patient not found.'}
        </div>
      </div>
    );
  }

  const age = calcAge(patient.dateOfBirth);

  return (
    <div className="flex flex-col h-full">
      {/* ── Patient header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Large avatar */}
            <div className="w-14 h-14 rounded-full bg-[#0891b2] flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">
                {getInitials(patient.firstName, patient.lastName)}
              </span>
            </div>

            {/* Name, chart, status */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#0f172a]">
                  {patient.firstName} {patient.lastName}
                </h2>
                <span
                  className={[
                    'text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase',
                    STATUS_BADGE[patient.status],
                  ].join(' ')}
                >
                  {patient.status}
                </span>
              </div>
              <div className="text-sm text-[#94a3b8] mt-0.5">Chart #{patient.chartNumber}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#64748b]">
                <span>
                  DOB: {formatDOB(patient.dateOfBirth)}
                  <span className="ml-1 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">
                    {age} yrs
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {patient.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
            aria-label="Edit patient"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Patient
          </button>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-200 mt-5 -mb-5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
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

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview'     && <OverviewTab patient={patient} />}
        {activeTab === 'med-history'  && <MedHistoryTab patient={patient} />}
        {activeTab === 'odontogram'   && <Odontogram patientId={patient.id} />}
        {activeTab === 'insurance'    && <InsuranceTab patient={patient} />}
        {activeTab === 'billing'      && <BillingTab patient={patient} />}
        {activeTab === 'appointments' && (
          <AppointmentsTab patientId={patient.id} clinicId={patient.clinicId} />
        )}
        {activeTab === 'xrays' && <XrayChartTab patientId={patient.id} />}
      </div>
    </div>
  );
}

// ── Inline X-ray chart tab ──────────────────────────────────────────────────
// Shows a gallery preview + a button to open the full X-ray viewer.
function XrayChartTab({ patientId }: { patientId: string }) {
  const navigate = useNavigate();
  const { xrays, loadState, selectedXray, selectXray } = useXray(patientId);

  function openViewer(xrayId?: string) {
    const url = `/xray?patient=${patientId}`;
    navigate(url);
  }

  return (
    <div className="space-y-4">
      {/* Open Viewer button */}
      <button
        onClick={() => openViewer()}
        className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-semibold rounded-xl hover:bg-[#0e7490] transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Open X-ray Viewer
      </button>

      {/* Gallery preview */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-[#0d0d0d]" style={{ minHeight: 240 }}>
        <XrayGallery
          xrays={xrays}
          selectedId={selectedXray?.id ?? null}
          onSelect={id => {
            selectXray(id);
            navigate(`/xray?patient=${patientId}`);
          }}
          isLoading={loadState === 'loading' || loadState === 'idle'}
        />
      </div>

      {xrays.length > 0 && (
        <button
          onClick={() => openViewer()}
          className="text-sm text-[#0891b2] hover:text-[#0e7490] font-medium transition-colors"
        >
          View All X-rays ({xrays.length}) →
        </button>
      )}
    </div>
  );
}
