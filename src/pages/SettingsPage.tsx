// SettingsPage — admin control panel.
// Left sidebar nav: Clinic | Users | Roles | Audit Log | Integrations
// Admin-gated: non-admins see a permission denied screen.
// ⚠️ HIPAA: Audit log and user management sections are PHI-adjacent.

import { useState } from 'react';
import {
  Building2, Users, ShieldCheck, ClipboardList, Plug, Lock,
} from 'lucide-react';
import { usePermissions }       from '../hooks/usePermissions';
import { ClinicSettingsForm }   from '../components/settings/ClinicSettingsForm';
import { UserManagement }       from '../components/settings/UserManagement';
import { RolePermissions }      from '../components/settings/RolePermissions';
import { AuditLogViewer }       from '../components/settings/AuditLogViewer';
import { IntegrationSettings }  from '../components/settings/IntegrationSettings';

type SectionId = 'clinic' | 'users' | 'roles' | 'audit' | 'integrations';

const SECTIONS: {
  id:          SectionId;
  label:       string;
  icon:        typeof Building2;
  description: string;
  permission:  'manage_clinic_settings' | 'manage_users' | 'view_audit_log';
}[] = [
  {
    id:          'clinic',
    label:       'Clinic Settings',
    icon:        Building2,
    description: 'Practice name, logo, contact info, subscription',
    permission:  'manage_clinic_settings',
  },
  {
    id:          'users',
    label:       'User Management',
    icon:        Users,
    description: 'Invite, deactivate, and manage staff accounts',
    permission:  'manage_users',
  },
  {
    id:          'roles',
    label:       'Roles & Permissions',
    icon:        ShieldCheck,
    description: 'RBAC matrix — what each role can access',
    permission:  'manage_clinic_settings',
  },
  {
    id:          'audit',
    label:       'Audit Log',
    icon:        ClipboardList,
    description: 'HIPAA PHI access log — 7-year retention',
    permission:  'view_audit_log',
  },
  {
    id:          'integrations',
    label:       'Integrations',
    icon:        Plug,
    description: 'Twilio, SendGrid, Stripe, API keys',
    permission:  'manage_clinic_settings',
  },
];

export default function SettingsPage() {
  const { can } = usePermissions();
  const [activeSection, setActiveSection] = useState<SectionId>('clinic');

  // Gate the whole page to admins only
  if (!can('manage_clinic_settings')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-[#0f172a] mb-2">Access Restricted</h2>
          <p className="text-sm text-[#64748b]">
            Settings are only available to Admin accounts.
            Contact your practice administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  const activeConfig = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="flex h-full">
      {/* ── Left sidebar ─────────────────────────────────────────────── */}
      <div className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <h1 className="text-sm font-bold text-[#0f172a]">Settings</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">Admin panel</p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const accessible = can(section.permission);
            const isActive   = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => accessible && setActiveSection(section.id)}
                disabled={!accessible}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                  isActive    ? 'bg-[#f0f9ff] text-[#0891b2]'     : '',
                  !isActive && accessible  ? 'hover:bg-gray-50 text-[#0f172a]' : '',
                  !accessible ? 'opacity-40 cursor-not-allowed text-[#94a3b8]' : '',
                ].join(' ')}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#0891b2]' : ''}`} />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Right content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0f172a]">{activeConfig.label}</h2>
            <p className="text-sm text-[#94a3b8] mt-1">{activeConfig.description}</p>
          </div>

          {/* Section content */}
          {activeSection === 'clinic'       && <ClinicSettingsForm />}
          {activeSection === 'users'        && <UserManagement />}
          {activeSection === 'roles'        && <RolePermissions />}
          {activeSection === 'audit'        && <AuditLogViewer />}
          {activeSection === 'integrations' && <IntegrationSettings />}
        </div>
      </div>
    </div>
  );
}
