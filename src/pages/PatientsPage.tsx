// PatientsPage — two-panel patient list + chart viewer (Phase 4).
// ⚠️ HIPAA: All data is PHI. Only render for authenticated providers.

import { useState, useEffect }  from 'react';
import { useParams }             from 'react-router-dom';
import { Users, UserPlus }       from 'lucide-react';
import { usePatientList }        from '../hooks/usePatientList';
import { PatientSearchBar }      from '../components/patients/PatientSearchBar';
import { PatientListRow }        from '../components/patients/PatientListRow';
import { PatientChart }          from '../components/patients/PatientChart';

export default function PatientsPage() {
  const { patientId: urlPatientId } = useParams<{ patientId: string }>();

  const {
    patients,
    loadState,
    error,
    searchQuery,
    setSearchQuery,
  } = usePatientList();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    urlPatientId ?? null,
  );

  // Sync URL param → selected patient when route changes
  useEffect(() => {
    if (urlPatientId) setSelectedPatientId(urlPatientId);
  }, [urlPatientId]);

  const isListLoading = loadState === 'loading' || loadState === 'idle';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel — patient list ─────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between gap-2">
            <h1 className="text-lg font-bold text-[#0f172a]">Patients</h1>
            <button
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0891b2] hover:bg-[#0e7490] px-3 py-1.5 rounded-lg transition-colors"
              aria-label="Add new patient"
            >
              <UserPlus className="w-3.5 h-3.5" />
              New Patient
            </button>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-3 pb-2">
            <PatientSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
            {/* Patient count */}
            <div className="text-[10px] text-[#94a3b8] mt-1.5 px-1">
              {isListLoading ? 'Loading…' : `${patients.length} patient${patients.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Patient list */}
          <div className="flex-1 overflow-y-auto">
            {isListLoading ? (
              // Skeleton rows
              <div className="space-y-0">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
                  >
                    <div className="animate-pulse bg-gray-200 rounded-full w-9 h-9 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="animate-pulse bg-gray-200 rounded h-3 w-28" />
                      <div className="animate-pulse bg-gray-200 rounded h-2.5 w-14" />
                    </div>
                  </div>
                ))}
              </div>
            ) : patients.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#94a3b8]">
                {searchQuery.length >= 2 ? 'No patients found.' : 'No patients on record.'}
              </div>
            ) : (
              patients.map(patient => (
                <PatientListRow
                  key={patient.id}
                  patient={patient}
                  isSelected={patient.id === selectedPatientId}
                  onClick={() => setSelectedPatientId(patient.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right panel — chart viewer ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {selectedPatientId ? (
            <PatientChart patientId={selectedPatientId} />
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-[#94a3b8]" />
              </div>
              <h2 className="text-base font-semibold text-[#0f172a] mb-1">Select a patient</h2>
              <p className="text-sm text-[#94a3b8] max-w-xs">
                Choose a patient from the list to view their chart
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
