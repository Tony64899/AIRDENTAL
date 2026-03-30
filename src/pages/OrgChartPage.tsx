// OrgChartPage — interactive organization chart showing team hierarchy.
// Filters: All Staff / By Location / By Department.
// Clicking a node opens a detail slide-over panel.

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, GitFork, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StaffMember } from '../types/staff';
import { OrgChartTree } from '../components/staff/OrgChartTree';
import { useClinic }     from '../contexts/ClinicContext';
import { getStaff }      from '../services/staffService';
import { MOCK_LOCATIONS_MAP } from '../constants/mockLocations';
import type { UserRole } from '../types/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

type LocationFilter = 'all' | string;   // 'all' or a locationId
type DeptFilter     = 'all' | 'clinical' | 'admin' | 'front_desk' | 'management';

const DEPT_LABELS: Record<DeptFilter, string> = {
  all:        'All Departments',
  clinical:   'Clinical',
  admin:      'Admin',
  front_desk: 'Front Desk',
  management: 'Management',
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin:      'bg-purple-50 text-purple-700 border-purple-200',
  dentist:    'bg-blue-50 text-blue-700 border-blue-200',
  hygienist:  'bg-teal-50 text-teal-700 border-teal-200',
  front_desk: 'bg-amber-50 text-amber-700 border-amber-200',
};
const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin', dentist: 'Dentist', hygienist: 'Hygienist', front_desk: 'Front Desk',
};
const STATUS_DOT: Record<string, string> = {
  active:        'bg-green-500',
  invited:       'bg-blue-400',
  pending_setup: 'bg-yellow-400',
  suspended:     'bg-orange-400',
  locked:        'bg-red-400',
  deactivated:   'bg-gray-300',
};
const STATUS_LABEL: Record<string, string> = {
  active:        'Active',
  invited:       'Invited',
  pending_setup: 'Pending Setup',
  suspended:     'Suspended',
  locked:        'Locked',
  deactivated:   'Deactivated',
};

function formatDate(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function DetailPanel({
  member,
  allStaff,
  onClose,
}: {
  member:   StaffMember;
  allStaff: StaffMember[];
  onClose:  () => void;
}) {
  const manager = member.reportsTo ? allStaff.find(s => s.id === member.reportsTo) : undefined;
  const reports = allStaff.filter(s => s.reportsTo === member.id);

  const assignedLocations = member.locationIds
    .map(id => MOCK_LOCATIONS_MAP[id])
    .filter(Boolean);

  return (
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-[#0f172a]">Staff Profile</span>
        <button
          onClick={onClose}
          className="text-[#94a3b8] hover:text-[#64748b] p-1 rounded transition-colors"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-[#0891b2] flex items-center justify-center relative">
            <span className="text-xl font-bold text-white">
              {getInitials(member.firstName, member.lastName)}
            </span>
            <span className={[
              'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white',
              STATUS_DOT[member.accountStatus] ?? 'bg-gray-300',
            ].join(' ')} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-[#64748b]">{member.jobTitle ?? ROLE_LABEL[member.role]}</p>
            <span className={[
              'inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded border',
              ROLE_BADGE[member.role],
            ].join(' ')}>
              {ROLE_LABEL[member.role]}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-[#64748b] font-medium">Account Status</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[member.accountStatus] ?? 'bg-gray-300'}`} />
            {STATUS_LABEL[member.accountStatus] ?? member.accountStatus}
          </span>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Contact</p>
          <div className="text-sm text-[#0f172a] break-all">{member.email}</div>
          {member.phone && (
            <div className="text-sm text-[#64748b]">
              {member.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
            </div>
          )}
        </div>

        {/* MFA + Last Login */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Security</p>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">MFA</span>
            {member.mfaEnabled
              ? <span className="text-green-600 font-medium">Enabled ✓</span>
              : <span className="text-amber-600 font-medium">Not enrolled</span>}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Last Login</span>
            <span className="text-[#0f172a]">{formatDate(member.lastLogin)}</span>
          </div>
        </div>

        {/* Reporting chain */}
        {manager && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Reports To</p>
            <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-[#64748b] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">
                  {getInitials(manager.firstName, manager.lastName)}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0f172a]">
                  {manager.firstName} {manager.lastName}
                </div>
                <div className="text-[10px] text-[#94a3b8]">{manager.jobTitle ?? ROLE_LABEL[manager.role]}</div>
              </div>
            </div>
          </div>
        )}

        {reports.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
              Direct Reports ({reports.length})
            </p>
            <div className="space-y-1.5">
              {reports.map(r => (
                <div key={r.id} className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-[#0891b2] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-white">
                      {getInitials(r.firstName, r.lastName)}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#0f172a]">
                      {r.firstName} {r.lastName}
                    </div>
                    <div className="text-[10px] text-[#94a3b8]">{r.jobTitle ?? ROLE_LABEL[r.role]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {assignedLocations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Locations</p>
            {assignedLocations.map(loc => (
              <div key={loc.id} className="text-xs text-[#64748b] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0891b2] flex-shrink-0" />
                {loc.name}
                {loc.isPrimary && <span className="text-[#0891b2] font-semibold">(Primary)</span>}
              </div>
            ))}
          </div>
        )}

        {/* Hire date */}
        {member.hireDate && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Hire Date</p>
            <p className="text-sm text-[#0f172a]">
              {new Date(member.hireDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OrgChartPage() {
  const { clinicId } = useClinic();
  const navigate     = useNavigate();

  const [allStaff,   setAllStaff]   = useState<StaffMember[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [selected,   setSelected]   = useState<StaffMember | null>(null);
  const [locFilter,  setLocFilter]  = useState<LocationFilter>('all');
  const [deptFilter, setDeptFilter] = useState<DeptFilter>('all');

  useEffect(() => {
    getStaff(clinicId).then(s => {
      setAllStaff(s);
      setIsLoading(false);
    });
  }, [clinicId]);

  // Derive available location options
  const locations = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    for (const s of allStaff) {
      for (const lid of s.locationIds) {
        if (!seen.has(lid)) {
          seen.add(lid);
          list.push({ id: lid, name: MOCK_LOCATIONS_MAP[lid]?.name ?? lid });
        }
      }
    }
    return list;
  }, [allStaff]);

  // Apply filters
  const filtered = useMemo(() => {
    return allStaff.filter(s => {
      const matchLoc  = locFilter  === 'all' || s.locationIds.includes(locFilter);
      const matchDept = deptFilter === 'all' || s.department === deptFilter;
      return matchLoc && matchDept;
    });
  }, [allStaff, locFilter, deptFilter]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <GitFork className="w-8 h-8 text-[#94a3b8] animate-pulse" />
          <p className="text-sm text-[#94a3b8]">Loading org chart…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f8fafc]">

      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#0891b2]" />
            <h1 className="text-sm font-bold text-[#0f172a]">Organization Chart</h1>
            <span className="text-[10px] font-semibold text-[#94a3b8] bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} member{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filters */}
          <div className="ml-auto flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#94a3b8]" />

            {/* Location filter */}
            <select
              value={locFilter}
              onChange={e => setLocFilter(e.target.value as LocationFilter)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 text-[#0f172a]"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            {/* Department filter */}
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value as DeptFilter)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 text-[#0f172a]"
            >
              {(Object.keys(DEPT_LABELS) as DeptFilter[]).map(k => (
                <option key={k} value={k}>{DEPT_LABELS[k]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main area: tree + optional detail panel ───────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Tree canvas */}
        <div className="flex-1 overflow-auto p-10">
          <OrgChartTree
            members={filtered}
            onClick={m => setSelected(prev => prev?.id === m.id ? null : m)}
          />
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            member={selected}
            allStaff={allStaff}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-2.5">
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Legend</span>
          {[
            { color: 'bg-green-500', label: 'Active' },
            { color: 'bg-blue-400',  label: 'Invited' },
            { color: 'bg-yellow-400', label: 'Pending Setup' },
            { color: 'bg-orange-400', label: 'Suspended' },
            { color: 'bg-red-400',   label: 'Locked' },
            { color: 'bg-gray-300',  label: 'Deactivated' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-[#64748b]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
