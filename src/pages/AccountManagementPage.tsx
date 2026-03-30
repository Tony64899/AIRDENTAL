// AccountManagementPage — full account lifecycle management for all staff.
// Shows all staff with 6-status lifecycle (invited → active → deactivated).
// Admin-only: invite new staff, change status, require MFA, resend invites.
// ⚠️ HIPAA: All status changes must generate audit log entries in production.

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, UserPlus, Search, MoreVertical,
  Mail, ShieldCheck, UserX, UserCheck,
  Lock, AlertTriangle, RefreshCw, X,
  ChevronDown, Check, MapPin,
} from 'lucide-react';
import type { StaffMember, AccountStatus, UserInvite } from '../types/staff';
import type { UserRole } from '../types/auth';
import {
  getStaff, inviteUser, deactivateUser, reactivateUser,
  suspendUser, unlockUser, resendInvite, requireMfa,
} from '../services/staffService';
import { useClinic }      from '../contexts/ClinicContext';
import { usePermissions } from '../hooks/usePermissions';
import { MOCK_LOCATIONS_MAP } from '../constants/mockLocations';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<UserRole, string> = {
  admin:      'bg-purple-50 text-purple-700 border-purple-200',
  dentist:    'bg-blue-50 text-blue-700 border-blue-200',
  hygienist:  'bg-teal-50 text-teal-700 border-teal-200',
  front_desk: 'bg-amber-50 text-amber-700 border-amber-200',
};
const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin', dentist: 'Dentist', hygienist: 'Hygienist', front_desk: 'Front Desk',
};

const STATUS_CONFIG: Record<AccountStatus, { label: string; dot: string; badge: string }> = {
  active:        { label: 'Active',        dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200' },
  invited:       { label: 'Invited',       dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  pending_setup: { label: 'Pending Setup', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  suspended:     { label: 'Suspended',     dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  locked:        { label: 'Locked',        dot: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border-red-200' },
  deactivated:   { label: 'Deactivated',   dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const FILTER_TABS: { key: AccountStatus | 'all'; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'active',       label: 'Active' },
  { key: 'invited',      label: 'Invited' },
  { key: 'pending_setup', label: 'Pending' },
  { key: 'suspended',    label: 'Suspended' },
  { key: 'locked',       label: 'Locked' },
  { key: 'deactivated',  label: 'Deactivated' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

// ── Invite Modal ───────────────────────────────────────────────────────────────

const ROLES: UserRole[] = ['admin', 'dentist', 'hygienist', 'front_desk'];

function InviteModal({
  clinicId,
  clinicName,
  onClose,
  onInvited,
}: {
  clinicId:   string;
  clinicName: string;
  onClose:    () => void;
  onInvited:  (member: StaffMember) => void;
}) {
  const [form, setForm] = useState<UserInvite>({
    email: '', firstName: '', lastName: '',
    role: 'front_desk', locationIds: [], jobTitle: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error,    setError]    = useState('');

  const locations = Object.values(MOCK_LOCATIONS_MAP);

  function toggleLocation(id: string) {
    setForm(prev => ({
      ...prev,
      locationIds: prev.locationIds.includes(id)
        ? prev.locationIds.filter(l => l !== id)
        : [...prev.locationIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.firstName || !form.lastName) {
      setError('First name, last name, and email are required.');
      return;
    }
    if (form.locationIds.length === 0) {
      setError('Assign at least one location.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const member = await inviteUser(clinicId, clinicName, form);
      onInvited(member);
      onClose();
    } catch {
      setError('Failed to send invite. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#0f172a]">Invite Team Member</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#64748b] p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">First Name *</label>
              <input
                value={form.firstName}
                onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Last Name *</label>
              <input
                value={form.lastName}
                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40"
                placeholder="Smith"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40"
              placeholder="jane.smith@airdental.com"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Role *</label>
            <div className="relative">
              <select
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 appearance-none bg-white"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8] pointer-events-none" />
            </div>
          </div>

          {/* Job title */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Job Title</label>
            <input
              value={form.jobTitle ?? ''}
              onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40"
              placeholder="e.g. Dental Hygienist"
            />
          </div>

          {/* Locations */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">
              Location Assignments *
            </label>
            <div className="space-y-2">
              {locations.map(loc => (
                <label key={loc.id} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={[
                      'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                      form.locationIds.includes(loc.id)
                        ? 'bg-[#0891b2] border-[#0891b2]'
                        : 'border-gray-300 group-hover:border-[#0891b2]/50',
                    ].join(' ')}
                    onClick={() => toggleLocation(loc.id)}
                  >
                    {form.locationIds.includes(loc.id) && (
                      <Check className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-[#0f172a]">{loc.name}</span>
                  <span className="text-xs text-[#94a3b8]">{loc.city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#64748b] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-[#0891b2] rounded-xl hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Action menu ────────────────────────────────────────────────────────────────

interface ActionItem {
  label:   string;
  icon:    React.ReactNode;
  danger?: boolean;
  action:  () => void;
}

function ActionsMenu({
  member,
  onAction,
}: {
  member:   StaffMember;
  onAction: (fn: () => Promise<void>) => void;
}) {
  const [open, setOpen] = useState(false);

  const status = member.accountStatus;

  const items: ActionItem[] = [];

  if (status === 'invited' || status === 'pending_setup') {
    items.push({
      label: 'Resend Invite',
      icon:  <Mail className="w-3.5 h-3.5" />,
      action: () => onAction(() => resendInvite(member.id)),
    });
  }
  if (status === 'active' || status === 'suspended' || status === 'locked') {
    items.push({
      label: 'Require MFA',
      icon:  <ShieldCheck className="w-3.5 h-3.5" />,
      action: () => onAction(() => requireMfa(member.id)),
    });
  }
  if (status === 'active') {
    items.push({
      label:  'Suspend',
      icon:   <AlertTriangle className="w-3.5 h-3.5" />,
      danger: true,
      action: () => onAction(() => suspendUser(member.id)),
    });
    items.push({
      label:  'Deactivate',
      icon:   <UserX className="w-3.5 h-3.5" />,
      danger: true,
      action: () => onAction(() => deactivateUser(member.id)),
    });
  }
  if (status === 'suspended') {
    items.push({
      label: 'Reactivate',
      icon:  <UserCheck className="w-3.5 h-3.5" />,
      action: () => onAction(() => reactivateUser(member.id)),
    });
    items.push({
      label:  'Deactivate',
      icon:   <UserX className="w-3.5 h-3.5" />,
      danger: true,
      action: () => onAction(() => deactivateUser(member.id)),
    });
  }
  if (status === 'locked') {
    items.push({
      label: 'Unlock Account',
      icon:  <Lock className="w-3.5 h-3.5" />,
      action: () => onAction(() => unlockUser(member.id)),
    });
    items.push({
      label:  'Deactivate',
      icon:   <UserX className="w-3.5 h-3.5" />,
      danger: true,
      action: () => onAction(() => deactivateUser(member.id)),
    });
  }
  if (status === 'deactivated') {
    items.push({
      label: 'Reactivate',
      icon:  <RefreshCw className="w-3.5 h-3.5" />,
      action: () => onAction(() => reactivateUser(member.id)),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#94a3b8] hover:text-[#64748b]"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[160px] py-1 overflow-hidden">
            {items.map(item => (
              <button
                key={item.label}
                onClick={() => { setOpen(false); item.action(); }}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors',
                  item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-[#0f172a] hover:bg-gray-50',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AccountManagementPage() {
  const { clinicId, clinicName } = useClinic();
  const { can }    = usePermissions();
  const isAdmin    = can('manage_users');
  const navigate   = useNavigate();

  const [staff,       setStaff]       = useState<StaffMember[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [showInvite,  setShowInvite]  = useState(false);
  const [busyId,      setBusyId]      = useState<string | null>(null);

  useEffect(() => {
    getStaff(clinicId).then(s => {
      setStaff(s);
      setIsLoading(false);
    });
  }, [clinicId]);

  // Status tab counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: staff.length };
    for (const s of staff) {
      c[s.accountStatus] = (c[s.accountStatus] ?? 0) + 1;
    }
    return c;
  }, [staff]);

  // Filtered list
  const filtered = useMemo(() => {
    return staff.filter(s => {
      const matchStatus = statusFilter === 'all' || s.accountStatus === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || [s.firstName, s.lastName, s.email, s.jobTitle ?? '', s.role]
        .join(' ').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [staff, statusFilter, search]);

  async function handleAction(memberId: string, fn: () => Promise<void>) {
    setBusyId(memberId);
    try {
      await fn();
      // Refresh from service
      const updated = await import('../services/staffService').then(m => m.getStaff(clinicId));
      setStaff(updated);
    } finally {
      setBusyId(null);
    }
  }

  function handleInvited(member: StaffMember) {
    setStaff(prev => [...prev, member]);
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-3 w-full max-w-2xl px-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-14 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f8fafc]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-sm font-bold text-[#0f172a]">Account Management</h1>
            <p className="text-xs text-[#94a3b8]">{clinicName}</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-xl hover:bg-[#0e7490] transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Staff
            </button>
          )}
        </div>
      </div>

      {/* ── Status tabs ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6">
        <div className="flex gap-0 overflow-x-auto">
          {FILTER_TABS.map(tab => {
            const count = counts[tab.key] ?? 0;
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={[
                  'flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap',
                  active
                    ? 'border-[#0891b2] text-[#0891b2]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]',
                ].join(' ')}
              >
                {tab.label}
                <span className={[
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  active ? 'bg-[#0891b2]/10 text-[#0891b2]' : 'bg-gray-100 text-[#94a3b8]',
                ].join(' ')}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search + table ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Search bar */}
        <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, role…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
              <tr>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider px-6 py-3">
                  Staff Member
                </th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider px-4 py-3">
                  Role
                </th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider px-4 py-3">
                  Locations
                </th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider px-4 py-3">
                  MFA
                </th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider px-4 py-3">
                  Last Login
                </th>
                {isAdmin && <th className="px-4 py-3 w-12" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(member => {
                const cfg     = STATUS_CONFIG[member.accountStatus];
                const initials = getInitials(member.firstName, member.lastName);
                const isBusy  = busyId === member.id;

                return (
                  <tr
                    key={member.id}
                    className={[
                      'bg-white hover:bg-[#f8fafc] transition-colors',
                      isBusy ? 'opacity-50 pointer-events-none' : '',
                    ].join(' ')}
                  >
                    {/* Name + avatar */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-[#0891b2] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{initials}</span>
                          </div>
                          <span className={[
                            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                            cfg.dot,
                          ].join(' ')} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[#0f172a] truncate">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-[#94a3b8] truncate">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${ROLE_BADGE[member.role]}`}>
                        {ROLE_LABEL[member.role]}
                      </span>
                      {member.jobTitle && (
                        <div className="text-xs text-[#94a3b8] mt-0.5">{member.jobTitle}</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Locations */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {member.locationIds.slice(0, 2).map(id => (
                          <div key={id} className="flex items-center gap-1 text-xs text-[#64748b]">
                            <MapPin className="w-3 h-3 text-[#0891b2] flex-shrink-0" />
                            {MOCK_LOCATIONS_MAP[id]?.name ?? id}
                          </div>
                        ))}
                        {member.locationIds.length > 2 && (
                          <div className="text-xs text-[#94a3b8]">
                            +{member.locationIds.length - 2} more
                          </div>
                        )}
                      </div>
                    </td>

                    {/* MFA */}
                    <td className="px-4 py-3">
                      {member.mfaEnabled
                        ? <span className="text-xs font-medium text-green-600">Enabled ✓</span>
                        : <span className="text-xs text-amber-600">Not enrolled</span>}
                    </td>

                    {/* Last login */}
                    <td className="px-4 py-3 text-xs text-[#64748b]">
                      {formatDate(member.lastLogin)}
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <ActionsMenu
                          member={member}
                          onAction={fn => handleAction(member.id, fn)}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[#94a3b8] text-sm">
              No staff match your filter.
            </div>
          )}
        </div>
      </div>

      {/* ── Invite modal ─────────────────────────────────────────────────── */}
      {showInvite && (
        <InviteModal
          clinicId={clinicId}
          clinicName={clinicName}
          onClose={() => setShowInvite(false)}
          onInvited={handleInvited}
        />
      )}
    </div>
  );
}
