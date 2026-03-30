// StaffPage — iPhone-style app launcher grid for all staff-related modules.
// Each tile navigates to a sub-section of the staff management area.
// Admin-only tiles are visually marked and only clickable by admins.

import { useNavigate } from 'react-router-dom';
import {
  GitFork, UserCog, UserPlus, ShieldCheck,
  FileText, Building2, CalendarDays, Users,
} from 'lucide-react';
import { StaffTile } from '../components/staff/StaffTile';
import { usePermissions } from '../hooks/usePermissions';
import { useClinic }      from '../contexts/ClinicContext';
import { MOCK_STAFF }     from '../constants/mockStaff';
import { ROUTES }         from '../constants/routes';

// ── Tile definitions ───────────────────────────────────────────────────────────

interface TileDef {
  id:          string;
  title:       string;
  subtitle?:   string;
  icon:        React.ComponentType<{ className?: string }>;
  color:       string;
  textColor?:  string;
  isBuilt:     boolean;
  adminOnly?:  boolean;
  route?:      string;
  badgeKey?:   'invited' | 'total' | 'inactive';
}

const TILES: TileDef[] = [
  {
    id:       'org-chart',
    title:    'Org Chart',
    subtitle: 'Team hierarchy',
    icon:     GitFork,
    color:    'bg-[#0891b2]',
    isBuilt:  true,
    route:    ROUTES.STAFF_ORG_CHART,
  },
  {
    id:        'accounts',
    title:     'Accounts',
    subtitle:  'User management',
    icon:      UserCog,
    color:     'bg-[#7c3aed]',
    isBuilt:   true,
    adminOnly: true,
    route:     ROUTES.STAFF_ACCOUNTS,
    badgeKey:  'invited',
  },
  {
    id:        'invite',
    title:     'Invite Staff',
    subtitle:  'Add team member',
    icon:      UserPlus,
    color:     'bg-[#059669]',
    isBuilt:   true,
    adminOnly: true,
    route:     ROUTES.STAFF_ACCOUNTS,
  },
  {
    id:       'roles',
    title:    'Roles & Access',
    subtitle: 'Permissions matrix',
    icon:     ShieldCheck,
    color:    'bg-[#d97706]',
    isBuilt:  true,
    route:    ROUTES.SETTINGS,
  },
  {
    id:      'schedules',
    title:   'Schedules',
    subtitle: 'Provider hours',
    icon:    CalendarDays,
    color:   'bg-[#0891b2]/80',
    isBuilt: false,
  },
  {
    id:      'locations',
    title:   'Locations',
    subtitle: 'Office assignments',
    icon:    Building2,
    color:   'bg-[#64748b]',
    isBuilt: true,
    route:   ROUTES.LOCATIONS,
  },
  {
    id:      'audit',
    title:   'Audit Log',
    subtitle: 'Access history',
    icon:    FileText,
    color:   'bg-[#dc2626]',
    isBuilt: true,
    adminOnly: true,
    route:   ROUTES.SETTINGS,
  },
  {
    id:      'all-staff',
    title:   'All Staff',
    subtitle: 'Full roster',
    icon:    Users,
    color:   'bg-[#0f172a]',
    isBuilt: true,
    route:   ROUTES.STAFF_ACCOUNTS,
    badgeKey: 'total',
  },
];

// ── Stat cards ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-[#0f172a]">{value}</span>
      {sub && <span className="text-[11px] text-[#64748b]">{sub}</span>}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { clinicId, clinicName } = useClinic();
  const { can }   = usePermissions();
  const isAdmin   = can('manage_users');
  const navigate  = useNavigate();

  // Compute badge counts from mock staff for current clinic
  const clinicStaff  = MOCK_STAFF.filter(s => s.clinicId === clinicId);
  const activeCount  = clinicStaff.filter(s => s.accountStatus === 'active').length;
  const invitedCount = clinicStaff.filter(s => s.accountStatus === 'invited').length;
  const inactiveCount = clinicStaff.filter(s => s.accountStatus === 'deactivated' || s.accountStatus === 'suspended').length;

  function getBadge(key?: TileDef['badgeKey']): number | undefined {
    if (key === 'invited')  return invitedCount > 0 ? invitedCount : undefined;
    if (key === 'total')    return clinicStaff.length;
    if (key === 'inactive') return inactiveCount > 0 ? inactiveCount : undefined;
    return undefined;
  }

  function handleTileClick(tile: TileDef) {
    if (!tile.isBuilt) return;
    if (tile.adminOnly && !isAdmin) return;
    if (tile.route) navigate(tile.route);
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Staff Management</h1>
          <p className="text-sm text-[#64748b] mt-1">{clinicName} · Team roster and administration</p>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Staff"   value={clinicStaff.length}  />
          <StatCard label="Active"        value={activeCount}          sub="can log in" />
          <StatCard
            label="Pending Invite"
            value={invitedCount}
            sub={invitedCount > 0 ? 'awaiting acceptance' : 'none pending'}
          />
        </div>

        {/* ── App grid ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-7">
            Staff Modules
          </h2>

          <div className="grid grid-cols-4 gap-x-6 gap-y-9">
            {TILES.map(tile => {
              const disabled = tile.adminOnly && !isAdmin;
              return (
                <StaffTile
                  key={tile.id}
                  icon={tile.icon as React.ComponentType<{ className?: string }> & { displayName?: string }}
                  title={tile.title}
                  subtitle={tile.subtitle}
                  color={disabled ? 'bg-gray-300' : tile.color}
                  textColor={tile.textColor ?? 'text-white'}
                  isBuilt={tile.isBuilt && !disabled}
                  badge={getBadge(tile.badgeKey)}
                  onClick={() => handleTileClick(tile)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Recent team members ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0f172a]">Recent Team Members</h2>
            <button
              onClick={() => navigate(ROUTES.STAFF_ACCOUNTS)}
              className="text-xs text-[#0891b2] hover:underline font-medium"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {clinicStaff.slice(0, 5).map(s => (
              <RecentRow key={s.id} member={s} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

import type { StaffMember } from '../types/staff';
import type { UserRole } from '../types/auth';

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
  active: 'bg-green-500', invited: 'bg-blue-400',
  pending_setup: 'bg-yellow-400', suspended: 'bg-orange-400',
  locked: 'bg-red-400', deactivated: 'bg-gray-300',
};

function RecentRow({ member }: { member: StaffMember }) {
  const initials = `${member.firstName[0] ?? ''}${member.lastName[0] ?? ''}`.toUpperCase();
  return (
    <div className="flex items-center gap-4 px-6 py-3">
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-[#0891b2] flex items-center justify-center">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
        <span className={[
          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
          STATUS_DOT[member.accountStatus] ?? 'bg-gray-300',
        ].join(' ')} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#0f172a] truncate">
          {member.firstName} {member.lastName}
        </div>
        <div className="text-xs text-[#94a3b8] truncate">
          {member.jobTitle ?? ROLE_LABEL[member.role]}
        </div>
      </div>
      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${ROLE_BADGE[member.role]}`}>
        {ROLE_LABEL[member.role]}
      </span>
    </div>
  );
}
