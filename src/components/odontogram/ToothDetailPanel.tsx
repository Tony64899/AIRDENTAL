// ToothDetailPanel — fixed right-side sliding panel for tooth notes, CDT codes, and history.
// ⚠️ HIPAA: Clinical notes and history are PHI. Only accessible to authenticated providers.

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { ToothState, TreatmentStatus } from '../../types/patient';
import { TOOTH_NAMES, TREATMENT_COLORS, TREATMENT_LABELS } from './odontogram.types';
import { CDT_CODES, CDT_BY_CODE } from '../../constants/cdtCodes';

interface ToothDetailPanelProps {
  toothState:    ToothState;
  patientId:     string;
  initialTab?:   'notes' | 'history';
  onUpdateNotes: (notes: string) => void;
  onLinkCDT:     (code: string) => void;
  onUnlinkCDT:   (code: string) => void;
  onClose:       () => void;
}

function getOverallStatus(toothState: ToothState): TreatmentStatus {
  if (toothState.toothLevelStatus) return toothState.toothLevelStatus;
  const nonHealthy = toothState.surfaces.find(s => s.status !== 'healthy');
  return nonHealthy ? nonHealthy.status : 'healthy';
}

export function ToothDetailPanel({
  toothState,
  initialTab = 'notes',
  onUpdateNotes,
  onLinkCDT,
  onUnlinkCDT,
  onClose,
}: ToothDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'history'>(initialTab);
  const [notesValue, setNotesValue] = useState(toothState.notes ?? '');
  const [cdtSearch, setCdtSearch]   = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { toothNumber } = toothState;
  const overallStatus = getOverallStatus(toothState);
  const toothName     = TOOTH_NAMES[toothNumber] ?? `Tooth #${toothNumber}`;

  // CDT search filtering
  const filteredCDT = cdtSearch.trim()
    ? CDT_CODES.filter(
        c =>
          c.code.toLowerCase().includes(cdtSearch.toLowerCase()) ||
          c.description.toLowerCase().includes(cdtSearch.toLowerCase()),
      ).slice(0, 6)
    : [];

  function handleNotesBlur() {
    onUpdateNotes(notesValue);
  }

  function handleAddCDT(code: string) {
    onLinkCDT(code);
    setCdtSearch('');
    setShowDropdown(false);
  }

  const surfaceRows = toothState.surfaces.map(s => ({
    name:      s.name.charAt(0).toUpperCase() + s.name.slice(1),
    status:    TREATMENT_LABELS[s.status],
    chartedBy: s.chartedBy,
    date:      new Date(s.chartedAt).toLocaleDateString(),
    color:     TREATMENT_COLORS[s.status],
  }));

  const historyReversed = [...toothState.history].reverse();

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#0f172a] leading-tight">
              Tooth #{toothNumber}
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5 truncate">{toothName}</div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm border border-gray-300 flex-shrink-0"
                style={{ background: TREATMENT_COLORS[overallStatus] }}
              />
              <span className="text-[11px] text-[#64748b]">{TREATMENT_LABELS[overallStatus]}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#64748b] flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 mt-3 border-b border-gray-200 -mb-4">
          {(['notes', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px capitalize',
                activeTab === tab
                  ? 'border-[#0891b2] text-[#0891b2]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]',
              ].join(' ')}
            >
              {tab === 'notes' ? 'Notes' : 'History'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeTab === 'notes' && (
          <>
            {/* Free-text notes */}
            <div>
              <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-1.5">
                Clinical Notes
              </label>
              <textarea
                rows={4}
                value={notesValue}
                onChange={e => setNotesValue(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Clinical notes for this tooth..."
                className="w-full text-sm text-[#0f172a] border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-transparent placeholder:text-[#94a3b8]"
              />
            </div>

            {/* Linked CDT Codes */}
            <div>
              <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-1.5">
                Linked CDT Codes
              </label>

              {/* Existing codes */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(toothState.cdtCodes ?? []).map(code => (
                  <span
                    key={code}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] px-2 py-1 rounded-full border border-blue-200"
                  >
                    <span className="font-medium">{code}</span>
                    {CDT_BY_CODE[code] && (
                      <span className="text-blue-500"> — {CDT_BY_CODE[code].description}</span>
                    )}
                    <button
                      onClick={() => onUnlinkCDT(code)}
                      className="ml-1 text-blue-400 hover:text-blue-700 font-bold leading-none"
                      aria-label={`Remove ${code}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {(toothState.cdtCodes ?? []).length === 0 && (
                  <span className="text-[11px] text-[#94a3b8]">No CDT codes linked.</span>
                )}
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={cdtSearch}
                  onChange={e => { setCdtSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder="Search CDT codes..."
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-transparent placeholder:text-[#94a3b8]"
                />
                {showDropdown && filteredCDT.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                    {filteredCDT.map(c => (
                      <button
                        key={c.code}
                        onMouseDown={() => handleAddCDT(c.code)}
                        className="flex items-start gap-2 px-3 py-2 w-full text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-[11px] font-bold text-[#0891b2] whitespace-nowrap">{c.code}</span>
                        <span className="text-[11px] text-[#64748b] leading-tight">{c.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Per-surface status table */}
            <div>
              <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-1.5">
                Surface Status
              </label>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#94a3b8] border-b border-gray-100">
                    <th className="text-left py-1 font-medium">Surface</th>
                    <th className="text-left py-1 font-medium">Status</th>
                    <th className="text-left py-1 font-medium">Charted By</th>
                    <th className="text-left py-1 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {surfaceRows.map(row => (
                    <tr key={row.name} className="border-b border-gray-50">
                      <td className="py-1 text-[#0f172a] font-medium">{row.name}</td>
                      <td className="py-1">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-sm border border-gray-200"
                            style={{ background: row.color }}
                          />
                          {row.status}
                        </span>
                      </td>
                      <td className="py-1 text-[#64748b]">{row.chartedBy}</td>
                      <td className="py-1 text-[#64748b]">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div>
            <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-2">
              Change History
            </label>
            {historyReversed.length === 0 ? (
              <p className="text-[11px] text-[#94a3b8] text-center py-6">
                No changes recorded for this tooth.
              </p>
            ) : (
              <div className="space-y-2">
                {historyReversed.map((entry, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="text-[11px] font-medium text-[#0f172a]">{entry.action}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#64748b]">
                      <span>{entry.chartedBy}</span>
                      <span>&middot;</span>
                      <span>{new Date(entry.chartedAt).toLocaleDateString()}</span>
                      <span>&middot;</span>
                      <span>{new Date(entry.chartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="w-2 h-2 rounded-sm border border-gray-200"
                        style={{ background: TREATMENT_COLORS[entry.previousStatus] }}
                      />
                      <span className="text-[10px] text-[#94a3b8]">{TREATMENT_LABELS[entry.previousStatus]}</span>
                      <span className="text-[10px] text-[#94a3b8]">&rarr;</span>
                      <span
                        className="w-2 h-2 rounded-sm border border-gray-200"
                        style={{ background: TREATMENT_COLORS[entry.newStatus] }}
                      />
                      <span className="text-[10px] text-[#94a3b8]">{TREATMENT_LABELS[entry.newStatus]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
