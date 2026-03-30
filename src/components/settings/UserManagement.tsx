// UserManagement — list, invite, deactivate, and update staff accounts.
// ⚠️ Admin only. Role changes are immediately effective client-side (server enforces on next request).

import { useState, useEffect } from 'react';
import {
  UserPlus, MoreVertical, CheckCircle, XCircle, ShieldCheck, Mail,
  Search, ChevronDown,
} from 'lucide-react';
import type { StaffMember, UserInvite } from '../../types/staff';
import type { UserRole } from '../../types/auth';
import { useClinic } from '../../contexts/ClinicContext';
import { getStaff, inviteUser, deactivateUser, reactivateUser, requireMfa } from '../../services/staffService';
import { MOCK_LOCATIONS } from '../../constants/mockLocations';

const ROLE_BADGE: Record<UserRole, string> = {
  admin:      'bg-purple-50 text-purple-700 border-purple-200',
  dentist:    'bg-blue-50 text-blue-700 border-blue-200',
  hygienist:  'bg-teal-50 text-teal-700 border-teal-200',
  front_desk: 'bg-amber-50 text-amber-700 border-amber-200',
};
const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin', dentist: 'Dentist', hygienist: 'Hygienist', front_desk: 'Front Desk',
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}
function formatLastLogin(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function UserManagement() {
  const { clinicId, clinicName } = useClinic();
  const [staff,       setStaff]       = useState<StaffMember[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [showInvite,  setShowInvite]  = useState(false);
  const [searchQuery, setSearch]      = useState('');
  const [openMenuId,  setOpenMenuId]  = useState<string | null>(null);

  useEffect(() => {
    getStaff(clinicId).then(s => { setStaff(s); setIsLoading(false); });
  }, [clinicId]);

  const filtered = staff.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email} ${s.role}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDeactivate(userId: string) {
    await deactivateUser(userId);
    setStaff(prev => prev.map(s => s.id === userId ? { ...s, isActive: false } : s));
    setOpenMenuId(null);
  }
  async function handleReactivate(userId: string) {
    await reactivateUser(userId);
    setStaff(prev => prev.map(s => s.id === userId ? { ...s, isActive: true } : s));
    setOpenMenuId(null);
  }
  async function handleRequireMfa(userId: string) {
    await requireMfa(userId);
    setStaff(prev => prev.map(s => s.id === userId ? { ...s, mfaEnabled: true } : s));
    setOpenMenuId(null);
  }
  async function handleInvite(invite: UserInvite) {
    const newMember = await inviteUser(clinicId, clinicName, invite);
    setStaff(prev => [...prev, newMember]);
    setShowInvite(false);
  }

  if (isLoading) return <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white"
          />
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#0891b2] text-white hover:bg-[#0e7490] transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Staff table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Staff Member</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Last Login</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">MFA</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Status</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className={`bg-white ${!s.isActive ? 'opacity-50' : ''}`}>
                {/* Avatar + name + email */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0891b2] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">{getInitials(s.firstName, s.lastName)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#0f172a]">{s.firstName} {s.lastName}</div>
                      <div className="text-xs text-[#94a3b8]">{s.email}</div>
                    </div>
                  </div>
                </td>
                {/* Role badge */}
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${ROLE_BADGE[s.role]}`}>
                    {ROLE_LABEL[s.role]}
                  </span>
                </td>
                {/* Last login */}
                <td className="px-4 py-3 text-[#64748b]">{formatLastLogin(s.lastLogin)}</td>
                {/* MFA */}
                <td className="px-4 py-3">
                  {s.mfaEnabled
                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                    : <XCircle    className="w-4 h-4 text-gray-300" />}
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${s.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {/* Action menu */}
                <td className="px-2 py-3 relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-[#94a3b8] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === s.id && (
                    <div className="absolute right-2 top-10 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm">
                      {!s.mfaEnabled && (
                        <MenuItem icon={<ShieldCheck className="w-3.5 h-3.5" />} onClick={() => handleRequireMfa(s.id)}>
                          Require MFA
                        </MenuItem>
                      )}
                      <MenuItem icon={<Mail className="w-3.5 h-3.5" />} onClick={() => setOpenMenuId(null)}>
                        Resend Invite
                      </MenuItem>
                      {s.isActive ? (
                        <MenuItem icon={<XCircle className="w-3.5 h-3.5 text-red-500" />} onClick={() => handleDeactivate(s.id)} danger>
                          Deactivate
                        </MenuItem>
                      ) : (
                        <MenuItem icon={<CheckCircle className="w-3.5 h-3.5 text-green-600" />} onClick={() => handleReactivate(s.id)}>
                          Reactivate
                        </MenuItem>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-[#94a3b8] text-sm">No staff members match your search.</div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal onSave={handleInvite} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}

// ── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ onSave, onClose }: { onSave: (invite: UserInvite) => void; onClose: () => void }) {
  const [form, setForm] = useState<UserInvite>({
    email: '', firstName: '', lastName: '', role: 'front_desk', locationIds: ['loc-1'],
  });
  const [isSaving, setIsSaving] = useState(false);
  const valid = form.email && form.firstName && form.lastName;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setIsSaving(true);
    await onSave(form);
    setIsSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-base font-bold text-[#0f172a]">Invite Team Member</h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">An email invitation will be sent with login setup instructions.</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InvField label="First Name" required>
              <input autoFocus value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={iCls} />
            </InvField>
            <InvField label="Last Name" required>
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={iCls} />
            </InvField>
          </div>
          <InvField label="Email" required>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={iCls} />
          </InvField>
          <InvField label="Role" required>
            <div className="relative">
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className={`${iCls} appearance-none pr-8`}>
                <option value="front_desk">Front Desk</option>
                <option value="hygienist">Hygienist</option>
                <option value="dentist">Dentist</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8] pointer-events-none" />
            </div>
          </InvField>
          <InvField label="Location(s)">
            <div className="space-y-1">
              {MOCK_LOCATIONS.map(loc => (
                <label key={loc.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.locationIds.includes(loc.id)}
                    onChange={e => setForm(f => ({
                      ...f,
                      locationIds: e.target.checked
                        ? [...f.locationIds, loc.id]
                        : f.locationIds.filter(id => id !== loc.id),
                    }))}
                    className="rounded border-gray-300 text-[#0891b2]"
                  />
                  {loc.name}
                </label>
              ))}
            </div>
          </InvField>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="text-sm text-[#64748b] px-3 py-2">Cancel</button>
            <button type="submit" disabled={!valid || isSaving} className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#0891b2] text-white hover:bg-[#0e7490] disabled:opacity-50 transition-colors">
              {isSaving ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const iCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white';

function InvField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#64748b] mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function MenuItem({ icon, onClick, danger, children }: { icon: React.ReactNode; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${danger ? 'text-red-600 hover:bg-red-50' : 'text-[#0f172a] hover:bg-gray-50'}`}
    >
      {icon}
      <span className="text-sm">{children}</span>
    </button>
  );
}
