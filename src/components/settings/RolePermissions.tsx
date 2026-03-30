// RolePermissions — read-only RBAC matrix showing what each role can access.
// ⚠️ HIPAA: Front desk clinical note exclusion is annotated prominently.
// Phase 10: view-only. Custom role editor is a future enterprise feature.

import { Check, X, Lock } from 'lucide-react';
import type { UserRole } from '../../types/auth';
import type { Permission } from '../../constants/permissions';
import { hasPermission } from '../../constants/permissions';

interface PermissionGroup {
  label: string;
  permissions: { key: Permission; label: string; hipaa?: boolean }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Scheduling',
    permissions: [
      { key: 'view_schedule',       label: 'View schedule' },
      { key: 'create_appointment',  label: 'Create appointments' },
      { key: 'edit_appointment',    label: 'Edit appointments' },
      { key: 'delete_appointment',  label: 'Delete appointments' },
    ],
  },
  {
    label: 'Patient Records',
    permissions: [
      { key: 'view_patient_demographics', label: 'View demographics' },
      { key: 'edit_patient_demographics', label: 'Edit demographics' },
      { key: 'view_clinical_notes',       label: 'View clinical notes', hipaa: true },
      { key: 'edit_clinical_notes',       label: 'Edit clinical notes', hipaa: true },
      { key: 'view_medical_history',      label: 'View medical history', hipaa: true },
      { key: 'edit_medical_history',      label: 'Edit medical history', hipaa: true },
    ],
  },
  {
    label: 'Billing & Insurance',
    permissions: [
      { key: 'view_billing',    label: 'View billing' },
      { key: 'create_claim',    label: 'Create claims' },
      { key: 'edit_claim',      label: 'Edit claims' },
      { key: 'record_payment',  label: 'Record payments' },
    ],
  },
  {
    label: 'X-rays',
    permissions: [
      { key: 'view_xray',   label: 'View X-rays' },
      { key: 'upload_xray', label: 'Upload X-rays' },
    ],
  },
  {
    label: 'Administration',
    permissions: [
      { key: 'view_analytics',        label: 'View analytics dashboard' },
      { key: 'manage_users',          label: 'Manage users', hipaa: true },
      { key: 'manage_clinic_settings', label: 'Manage clinic settings' },
      { key: 'view_audit_log',        label: 'View audit log', hipaa: true },
    ],
  },
];

const ROLES: { id: UserRole; label: string; color: string }[] = [
  { id: 'admin',      label: 'Admin',       color: 'text-purple-700' },
  { id: 'dentist',    label: 'Dentist',     color: 'text-blue-700' },
  { id: 'hygienist',  label: 'Hygienist',   color: 'text-teal-700' },
  { id: 'front_desk', label: 'Front Desk',  color: 'text-amber-700' },
];

export function RolePermissions() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#64748b] flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        Permissions are enforced server-side. Custom roles are available on the Enterprise plan.
      </p>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          {/* Column headers */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-[280px]">
                Permission
              </th>
              {ROLES.map(r => (
                <th key={r.id} className="text-center px-4 py-3">
                  <span className={`text-xs font-bold ${r.color}`}>{r.label}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {PERMISSION_GROUPS.map(group => (
              <>
                {/* Group header row */}
                <tr key={group.label} className="bg-gray-50/80 border-t border-b border-gray-200">
                  <td colSpan={5} className="px-4 py-2">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                      {group.label}
                    </span>
                  </td>
                </tr>

                {/* Permission rows */}
                {group.permissions.map(perm => (
                  <tr key={perm.key} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-[#0f172a]">{perm.label}</span>
                        {perm.hipaa && (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                            PHI
                          </span>
                        )}
                      </div>
                    </td>
                    {ROLES.map(role => {
                      const allowed = hasPermission(role.id, perm.key);
                      return (
                        <td key={role.id} className="px-4 py-3 text-center">
                          {allowed
                            ? <Check className="w-4 h-4 text-green-500 mx-auto" aria-label="Allowed" />
                            : <X     className="w-4 h-4 text-gray-200 mx-auto"  aria-label="Not allowed" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* HIPAA annotation */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
        <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
        <span>
          <strong>HIPAA Note:</strong> Front Desk staff are intentionally excluded from clinical notes and
          medical history per the Minimum Necessary standard (45 CFR §164.502(b)).
          Admin accounts should be limited to practice owners and managers.
        </span>
      </div>
    </div>
  );
}
