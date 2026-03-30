// AuditLogViewer — filterable HIPAA PHI access audit log.
// Admin + security officer only. CSV export for compliance.
// ⚠️ HIPAA: 7-year retention required (45 CFR §164.312(b)). Never delete entries.

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Filter, Calendar, ChevronDown } from 'lucide-react';
import type { ClinicalAuditEntry, AuditCategory } from '../../types/audit';
import { queryAuditLog, auditLogToCsv } from '../../services/auditService';

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  patient_view:    'Patient View',
  patient_edit:    'Patient Edit',
  clinical_note:   'Clinical Note',
  medical_history: 'Medical History',
  odontogram:      'Odontogram',
  xray_view:       'X-ray View',
  xray_upload:     'X-ray Upload',
  billing_view:    'Billing View',
  claim_submit:    'Claim Submit',
  claim_update:    'Claim Update',
  payment:         'Payment',
  user_login:      'Login',
  user_logout:     'Logout',
  user_invite:     'User Invite',
  user_deactivate: 'User Deactivate',
  settings_change: 'Settings Change',
  integration:     'Integration',
};

const CATEGORY_COLOR: Record<string, string> = {
  // Clinical (PHI-touching)
  patient_view:    'bg-blue-50 text-blue-700 border-blue-100',
  patient_edit:    'bg-blue-100 text-blue-800 border-blue-200',
  clinical_note:   'bg-teal-50 text-teal-700 border-teal-100',
  medical_history: 'bg-teal-50 text-teal-700 border-teal-100',
  odontogram:      'bg-cyan-50 text-cyan-700 border-cyan-100',
  xray_view:       'bg-indigo-50 text-indigo-700 border-indigo-100',
  xray_upload:     'bg-indigo-50 text-indigo-700 border-indigo-100',
  billing_view:    'bg-green-50 text-green-700 border-green-100',
  claim_submit:    'bg-green-100 text-green-800 border-green-200',
  claim_update:    'bg-green-50 text-green-700 border-green-100',
  payment:         'bg-emerald-50 text-emerald-700 border-emerald-100',
  // Auth / admin
  user_login:      'bg-gray-100 text-gray-600 border-gray-200',
  user_logout:     'bg-gray-100 text-gray-600 border-gray-200',
  user_invite:     'bg-amber-50 text-amber-700 border-amber-100',
  user_deactivate: 'bg-red-50 text-red-700 border-red-100',
  settings_change: 'bg-amber-50 text-amber-700 border-amber-100',
  integration:     'bg-purple-50 text-purple-700 border-purple-100',
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const PAGE_SIZE = 15;

export function AuditLogViewer() {
  const [entries,    setEntries]   = useState<ClinicalAuditEntry[]>([]);
  const [total,      setTotal]     = useState(0);
  const [isLoading,  setIsLoading] = useState(true);
  const [page,       setPage]      = useState(0);

  // Filters
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState<AuditCategory | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await queryAuditLog({
      search:   search   || undefined,
      category: category || undefined,
      fromDate: fromDate || undefined,
      toDate:   toDate   || undefined,
      offset:   page * PAGE_SIZE,
      limit:    PAGE_SIZE,
    });
    setEntries(result.entries);
    setTotal(result.total);
    setIsLoading(false);
  }, [search, category, fromDate, toDate, page]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 0 when filters change
  useEffect(() => { setPage(0); }, [search, category, fromDate, toDate]);

  async function handleExport() {
    const all = await queryAuditLog({ search: search || undefined, category: category || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined });
    const csv  = auditLogToCsv(all.entries);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value as AuditCategory | '')}
            className="pl-8 pr-7 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white appearance-none"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8] pointer-events-none" />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#94a3b8]" />
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="py-2 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
          />
          <span className="text-xs text-[#94a3b8]">–</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="py-2 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-[#94a3b8]">{total} entries</p>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-40">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-36">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-40">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-28">Patient</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(entry => (
                <tr key={entry.id} className="bg-white hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs text-[#94a3b8] whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${CATEGORY_COLOR[entry.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {CATEGORY_LABELS[entry.category] ?? entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#0f172a]">{entry.action}</div>
                    {entry.details && (
                      <div className="text-xs text-[#94a3b8] mt-0.5">{entry.details}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#0f172a]">{entry.userName}</div>
                    <div className="text-xs text-[#94a3b8] capitalize">{entry.userRole.replace('_', ' ')}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748b]">
                    {entry.patientName ?? <span className="text-[#94a3b8]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="text-center py-10 text-[#94a3b8] text-sm">No audit entries match your filters.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94a3b8]">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
