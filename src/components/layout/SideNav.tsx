// SideNav — main application navigation sidebar.
// Dark background with Air Dental branding at top and user info at bottom.
// Unbuilt features are shown as dimmed stubs so the app looks complete.

import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar, LayoutDashboard, Users, CreditCard,
  Image, Settings, Bell, UserCog, Building2,
} from 'lucide-react';

import { AirDentalLogo } from '../../assets/icons/AirDentalLogo';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

interface NavItem {
  label: string;
  icon: typeof Calendar;
  path: string;
  isBuilt: boolean;  // false = show as coming-soon stub
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Schedule',   icon: Calendar,         path: ROUTES.SCHEDULE,      isBuilt: true  },
  { label: 'Dashboard',  icon: LayoutDashboard,  path: ROUTES.DASHBOARD,     isBuilt: true  },
  { label: 'Patients',   icon: Users,            path: ROUTES.PATIENTS,      isBuilt: true  },
  { label: 'Billing',    icon: CreditCard,       path: ROUTES.BILLING,       isBuilt: true  },
  { label: 'X-rays',     icon: Image,            path: ROUTES.XRAY,          isBuilt: true  },
  { label: 'Notify',     icon: Bell,             path: ROUTES.NOTIFICATIONS, isBuilt: true  },
  { label: 'Locations',  icon: Building2,        path: ROUTES.LOCATIONS,     isBuilt: true  },
  { label: 'Staff',      icon: UserCog,          path: ROUTES.STAFF,         isBuilt: true  },
  { label: 'Settings',   icon: Settings,         path: ROUTES.SETTINGS,      isBuilt: true  },
];

export function SideNav() {
  const { state, logout } = useAuth();
  const location = useLocation();

  const user = state.user;

  return (
    <nav
      className="w-[220px] flex-shrink-0 flex flex-col bg-[#0f172a] text-[#94a3b8] h-full"
      aria-label="Main navigation"
    >
      {/* Brand lockup */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <AirDentalLogo size={26} />
        <span className="text-[15px] font-bold text-white tracking-tight">Air Dental</span>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, path, isBuilt }) => {
          const isActive = location.pathname === path ||
            (path === ROUTES.SCHEDULE      && location.pathname === ROUTES.HOME) ||
            (path === ROUTES.PATIENTS      && location.pathname.startsWith(ROUTES.PATIENTS)) ||
            (path === ROUTES.XRAY          && location.pathname.startsWith(ROUTES.XRAY)) ||
            (path === ROUTES.NOTIFICATIONS && location.pathname.startsWith(ROUTES.NOTIFICATIONS)) ||
            (path === ROUTES.LOCATIONS     && location.pathname.startsWith(ROUTES.LOCATIONS))  ||
            (path === ROUTES.STAFF         && location.pathname.startsWith(ROUTES.STAFF))        ||
            (path === ROUTES.SETTINGS      && location.pathname.startsWith(ROUTES.SETTINGS));

          if (!isBuilt) {
            // Coming-soon stub — dimmed, not clickable
            return (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-35 cursor-default select-none"
                title={`${label} — Coming soon`}
                aria-disabled="true"
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={label}
              to={path}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'hover:bg-white/5 hover:text-white',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User section at bottom */}
      {user && (
        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            {/* Avatar initials */}
            <div className="w-8 h-8 rounded-full bg-[#0891b2] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-[#64748b] truncate capitalize">
                {user.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
