// OrgChartNode — individual card rendered inside OrgChartTree.
// Shows avatar, name, title, role badge, account status indicator, and location.

import type { StaffMember } from '../../types/staff';
import type { UserRole } from '../../types/auth';
import { MOCK_LOCATIONS_MAP } from '../../constants/mockLocations';

const ROLE_BADGE: Record<UserRole, string> = {
  admin:      'bg-purple-50 text-purple-700 border-purple-200',
  dentist:    'bg-blue-50 text-blue-700 border-blue-200',
  hygienist:  'bg-teal-50 text-teal-700 border-teal-200',
  front_desk: 'bg-amber-50 text-amber-700 border-amber-200',
};
const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin', dentist: 'Dentist', hygienist: 'Hygienist', front_desk: 'Front Desk',
};

/** Dot color for each account status. */
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
  pending_setup: 'Pending setup',
  suspended:     'Suspended',
  locked:        'Locked',
  deactivated:   'Deactivated',
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

interface OrgChartNodeProps {
  member:     StaffMember;
  isRoot?:    boolean;
  onClick?:   (member: StaffMember) => void;
}

export function OrgChartNode({ member, isRoot = false, onClick }: OrgChartNodeProps) {
  const initials   = getInitials(member.firstName, member.lastName);
  const statusDot  = STATUS_DOT[member.accountStatus]  ?? 'bg-gray-300';
  const statusText = STATUS_LABEL[member.accountStatus] ?? member.accountStatus;

  // Show first assigned location name
  const primaryLoc = member.locationIds[0]
    ? MOCK_LOCATIONS_MAP[member.locationIds[0]]?.name
    : undefined;

  return (
    <button
      onClick={() => onClick?.(member)}
      className={[
        'w-[160px] bg-white border rounded-2xl p-3 text-left transition-all duration-150',
        'hover:shadow-md hover:border-[#0891b2]/40 hover:-translate-y-0.5',
        'focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40',
        isRoot ? 'border-[#0891b2] shadow-md' : 'border-gray-200 shadow-sm',
        !member.isActive ? 'opacity-60' : '',
      ].join(' ')}
    >
      {/* Avatar + status dot */}
      <div className="relative w-10 h-10 mx-auto mb-2">
        <div className={[
          'w-10 h-10 rounded-full flex items-center justify-center',
          isRoot ? 'bg-[#0891b2]' : 'bg-[#64748b]',
        ].join(' ')}>
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
        <span className={[
          'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
          statusDot,
        ].join(' ')} title={statusText} />
      </div>

      {/* Name */}
      <div className="text-center">
        <div className="text-[11px] font-semibold text-[#0f172a] leading-tight truncate">
          {member.firstName} {member.lastName}
        </div>
        <div className="text-[10px] text-[#64748b] truncate mt-0.5">
          {member.jobTitle ?? ROLE_LABEL[member.role]}
        </div>
      </div>

      {/* Role badge */}
      <div className="flex justify-center mt-2">
        <span className={[
          'text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border',
          ROLE_BADGE[member.role],
        ].join(' ')}>
          {ROLE_LABEL[member.role]}
        </span>
      </div>

      {/* Location */}
      {primaryLoc && (
        <div className="text-[9px] text-[#94a3b8] text-center mt-1.5 truncate">
          {primaryLoc}
          {member.locationIds.length > 1 && ` +${member.locationIds.length - 1}`}
        </div>
      )}
    </button>
  );
}
