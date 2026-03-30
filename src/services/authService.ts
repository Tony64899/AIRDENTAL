// ⚠️ HIPAA: Mock auth service — simulates backend auth API
// All tokens stored in memory only (no localStorage for PHI)

import type { User, LoginCredentials, AuditLogEntry } from '../types/auth';

// --- Mock user database ---
const MOCK_USERS: Array<User & { password: string; mfaCode: string }> = [
  {
    id: 'u-1',
    email: 'admin@airdental.com',
    password: 'Admin123!@#',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'admin',
    clinicId: 'clinic-1',
    clinicName: 'Inspire Dental',
    isActive: true,
    lastLogin: null,
    mfaEnabled: true,
    mfaCode: '123456',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'u-2',
    email: 'dr.chen@airdental.com',
    password: 'Doctor123!@#',
    firstName: 'Michael',
    lastName: 'Torres',
    role: 'dentist',
    clinicId: 'clinic-1',
    clinicName: 'Inspire Dental',
    isActive: true,
    lastLogin: '2026-03-28T09:00:00Z',
    mfaEnabled: true,
    mfaCode: '234567',
    createdAt: '2025-02-15T00:00:00Z',
  },
  {
    id: 'u-3',
    email: 'hygienist@airdental.com',
    password: 'Hygiene123!@#',
    firstName: 'Emily',
    lastName: 'White',
    role: 'hygienist',
    clinicId: 'clinic-1',
    clinicName: 'Inspire Dental',
    isActive: true,
    lastLogin: '2026-03-27T14:30:00Z',
    mfaEnabled: true,
    mfaCode: '345678',
    createdAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'u-4',
    email: 'front@airdental.com',
    password: 'Front123!@#',
    firstName: 'James',
    lastName: 'Park',
    role: 'front_desk',
    clinicId: 'clinic-1',
    clinicName: 'Inspire Dental',
    isActive: true,
    lastLogin: '2026-03-28T08:00:00Z',
    mfaEnabled: true,
    mfaCode: '456789',
    createdAt: '2025-04-01T00:00:00Z',
  },
];

// ⚠️ HIPAA: Audit log stored in memory only
const auditLog: AuditLogEntry[] = [];

// ⚠️ HIPAA: Track failed attempts in memory
const failedAttempts: Record<string, { count: number; lockoutUntil: number | null }> = {};

function addAuditEntry(entry: Omit<AuditLogEntry, 'timestamp'>) {
  auditLog.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Public API ---

export async function login(
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: User; error?: string; failedCount?: number }> {
  await delay(500);

  const email = credentials.email.toLowerCase();

  // ⚠️ HIPAA: Check lockout
  const attempts = failedAttempts[email];
  if (attempts?.lockoutUntil && Date.now() < attempts.lockoutUntil) {
    const remainingMin = Math.ceil((attempts.lockoutUntil - Date.now()) / 60000);
    addAuditEntry({
      action: 'login_failure',
      userId: null,
      email,
      details: `Account locked. ${remainingMin} minutes remaining.`,
    });
    return {
      success: false,
      error: `Account locked. Try again in ${remainingMin} minutes.`,
      failedCount: attempts.count,
    };
  }

  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email && u.password === credentials.password
  );

  if (!user) {
    // ⚠️ HIPAA: Track failed attempts
    if (!failedAttempts[email]) {
      failedAttempts[email] = { count: 0, lockoutUntil: null };
    }
    failedAttempts[email].count += 1;

    // ⚠️ HIPAA: Lockout after 5 failed attempts (30-min cooldown)
    if (failedAttempts[email].count >= 5) {
      failedAttempts[email].lockoutUntil = Date.now() + 30 * 60 * 1000;
      addAuditEntry({
        action: 'account_locked',
        userId: null,
        email,
        details: 'Account locked after 5 failed attempts.',
      });
    } else {
      addAuditEntry({
        action: 'login_failure',
        userId: null,
        email,
        details: `Failed attempt ${failedAttempts[email].count}/5`,
      });
    }

    return {
      success: false,
      error: 'Invalid email or password.',
      failedCount: failedAttempts[email].count,
    };
  }

  // Successful password → clear failed attempts
  delete failedAttempts[email];

  // Return user without sensitive fields
  const { password: _, mfaCode: __, ...safeUser } = user;

  addAuditEntry({
    action: 'login_success',
    userId: safeUser.id,
    email,
    details: 'Password verified. MFA pending.',
  });

  return { success: true, user: safeUser };
}

export async function verifyMfa(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  await delay(300);

  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.mfaCode !== code) {
    addAuditEntry({
      action: 'mfa_failure',
      userId: user?.id ?? null,
      email,
      details: 'Invalid MFA code.',
    });
    return { success: false, error: 'Invalid verification code. Please try again.' };
  }

  addAuditEntry({
    action: 'mfa_success',
    userId: user.id,
    email,
    details: 'MFA verified. Login complete.',
  });

  return { success: true };
}

export async function forgotPassword(
  email: string
): Promise<{ success: boolean; message: string }> {
  await delay(1000);

  addAuditEntry({
    action: 'password_change',
    userId: null,
    email,
    details: 'Password reset requested.',
  });

  // ⚠️ HIPAA: Deliberately vague response to prevent email enumeration
  return {
    success: true,
    message:
      'If an account exists with this email, you will receive a password reset link.',
  };
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean }> {
  await delay(800);

  // TODO (backend phase): Validate token via NestJS, PATCH /auth/reset-password
  // Mock: any non-empty token is accepted
  addAuditEntry({
    action: 'password_change',
    userId: null,
    email: 'unknown',
    details: 'Password reset completed via token.',
  });

  void token;
  void newPassword;
  return { success: true };
}

export function getAuditLog(): AuditLogEntry[] {
  return [...auditLog];
}
