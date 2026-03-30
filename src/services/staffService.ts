// staffService — user/staff account management CRUD.
// TODO: connect to backend API (NestJS /admin/users endpoints) — replace in-memory store.
// ⚠️ HIPAA: role changes and deactivations must be audit-logged (see auditService).

import type { StaffMember, UserInvite, AccountStatus } from '../types/staff';
import { MOCK_STAFF } from '../constants/mockStaff';

// ── In-memory store ────────────────────────────────────────────────────────────
let _staff: StaffMember[] = MOCK_STAFF.map(s => ({
  ...s,
  locationIds: [...s.locationIds],
}));

const delay = (ms = 200) => new Promise<void>(r => setTimeout(r, ms));

// ── Queries ────────────────────────────────────────────────────────────────────

export async function getStaff(clinicId: string): Promise<StaffMember[]> {
  await delay();
  return _staff.filter(s => s.clinicId === clinicId);
}

export async function getStaffMember(userId: string): Promise<StaffMember | null> {
  await delay();
  return _staff.find(s => s.id === userId) ?? null;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Invite a new team member — sends invite email in production. */
export async function inviteUser(
  clinicId: string,
  clinicName: string,
  invite: UserInvite
): Promise<StaffMember> {
  await delay(400);
  const newMember: StaffMember = {
    id:            `u-${Date.now()}`,
    email:         invite.email,
    firstName:     invite.firstName,
    lastName:      invite.lastName,
    role:          invite.role,
    clinicId,
    clinicName,
    isActive:      false,
    lastLogin:     null,
    mfaEnabled:    false,
    createdAt:     new Date().toISOString(),
    locationIds:   [...invite.locationIds],
    providerId:    undefined,
    jobTitle:      invite.jobTitle,
    accountStatus: 'invited',
    department:    undefined,
    reportsTo:     undefined,
  };
  _staff = [..._staff, newMember];
  // TODO: send invite email via NestJS /mail/invite
  return newMember;
}

/** Update a staff member's role or location assignments. */
export async function updateStaffMember(
  userId: string,
  patch: Partial<Pick<StaffMember, 'role' | 'locationIds' | 'jobTitle' | 'phone' | 'mfaEnabled' | 'reportsTo' | 'department'>>
): Promise<StaffMember> {
  await delay();
  _staff = _staff.map(s => s.id === userId ? { ...s, ...patch } : s);
  return _staff.find(s => s.id === userId)!;
}

/** Set the account status directly (generic status transition). */
export async function setAccountStatus(userId: string, status: AccountStatus): Promise<void> {
  await delay();
  const isActive = status === 'active';
  _staff = _staff.map(s =>
    s.id === userId ? { ...s, accountStatus: status, isActive } : s
  );
  // TODO: revoke sessions for suspended/locked/deactivated via NestJS /admin/sessions/:userId
}

/** Deactivate (soft-delete) a staff account — does not delete data. */
export async function deactivateUser(userId: string): Promise<void> {
  return setAccountStatus(userId, 'deactivated');
}

/** Reactivate a previously deactivated/suspended account. */
export async function reactivateUser(userId: string): Promise<void> {
  return setAccountStatus(userId, 'active');
}

/** Suspend an account (temporary block). */
export async function suspendUser(userId: string): Promise<void> {
  return setAccountStatus(userId, 'suspended');
}

/** Unlock a locked account (e.g. after too many failed logins). */
export async function unlockUser(userId: string): Promise<void> {
  return setAccountStatus(userId, 'active');
}

/** Resend an invite email to a pending user. */
export async function resendInvite(userId: string): Promise<void> {
  await delay(400);
  // Re-set to invited to reset the expiry clock in production
  _staff = _staff.map(s =>
    s.id === userId ? { ...s, accountStatus: 'invited' as AccountStatus } : s
  );
  // TODO: resend invite email via NestJS /mail/invite-resend
}

/** Force-enable MFA for a staff member. */
export async function requireMfa(userId: string): Promise<void> {
  await delay();
  _staff = _staff.map(s =>
    s.id === userId ? { ...s, mfaEnabled: true } : s
  );
  // TODO: trigger MFA enrollment email via NestJS /mail/mfa-enroll
}
