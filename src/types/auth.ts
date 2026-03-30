// ⚠️ HIPAA: All user types and auth state definitions

export type UserRole = 'admin' | 'dentist' | 'hygienist' | 'front_desk';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clinicId: string;
  clinicName: string;
  clinicImage?: string;
  isActive: boolean;
  lastLogin: string | null;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isMfaPending: boolean;
  isLoading: boolean;
  error: string | null;
  failedAttempts: number;
  lockoutUntil: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberDevice: boolean;
}

export interface MfaPayload {
  code: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action:
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'mfa_success'
    | 'mfa_failure'
    | 'password_change'
    | 'session_timeout'
    | 'account_locked';
  userId: string | null;
  email: string;
  details?: string;
}
