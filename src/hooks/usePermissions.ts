// RBAC hook — check what the current user is allowed to do.
// Import this in any component that shows or hides content based on role.
// ⚠️ HIPAA: Use this to gate clinical notes, billing, and audit log access.

import { useAuth } from './useAuth';
import { hasPermission, type Permission } from '../constants/permissions';

/**
 * Returns a `can()` function scoped to the currently logged-in user's role.
 *
 * Usage:
 *   const { can } = usePermissions();
 *   if (can('view_clinical_notes')) { ... }
 */
export function usePermissions() {
  const { state } = useAuth();
  const role = state.user?.role;

  /**
   * Check if the current user has a specific permission.
   * Returns false if no user is logged in.
   */
  function can(permission: Permission): boolean {
    if (!role) return false;
    return hasPermission(role, permission);
  }

  /**
   * Check if the current user has ALL of the listed permissions.
   */
  function canAll(...permissions: Permission[]): boolean {
    return permissions.every(p => can(p));
  }

  /**
   * Check if the current user has ANY of the listed permissions.
   */
  function canAny(...permissions: Permission[]): boolean {
    return permissions.some(p => can(p));
  }

  return { can, canAll, canAny, role };
}
