# Page Prompt 01 — Authentication & User Management
# 저장 경로: .claude/prompts/01_auth.md
# 사용법: MASTER_PROMPT.md 복붙 후 이 내용을 아래에 이어 붙여넣으세요.

---

```
Now let's build Page 01: Authentication & User Management for Air Dental.

## Goal
Build a HIPAA-compliant authentication system with login, MFA, password recovery,
session management, and role-based user management. Frontend-first with mock data —
no backend needed yet.

## ─────────────────────────────────────────────
## 1. Pages & Components to Build
## ─────────────────────────────────────────────

### Pages (full-screen routes)
| # | Page               | Route              | Description                                   |
|---|--------------------|--------------------|-----------------------------------------------|
| 1 | Login Page         | /login             | Email + password form, "Forgot password?" link |
| 2 | MFA Verification   | /mfa               | 6-digit code input after successful login      |
| 3 | Forgot Password    | /forgot-password   | Email input → sends reset link                 |
| 4 | Reset Password     | /reset-password    | New password form (accessed via email link)     |
| 5 | User Management    | /settings/users    | Admin-only: CRUD staff accounts, assign roles  |

### Shared Components
| Component                  | Description                                              |
|----------------------------|----------------------------------------------------------|
| AuthGuard.tsx              | Wraps protected routes — redirects to /login if not authed |
| SessionTimeoutModal.tsx    | Warning modal at 13 min, auto-logout at 15 min           |
| PasswordStrengthMeter.tsx  | Visual bar showing password strength as user types        |
| RoleBadge.tsx              | Colored badge showing user role (Admin/Dentist/etc.)     |

### Hooks & Services
| File                       | Description                                              |
|----------------------------|----------------------------------------------------------|
| useAuth.ts                 | Auth context + hook: login, logout, MFA verify, role check |
| useSessionTimeout.ts       | Tracks idle time, shows warning, triggers auto-logout     |
| authService.ts             | Mock API layer — simulate login, MFA, password reset      |

## ─────────────────────────────────────────────
## 2. File Paths (match project structure)
## ─────────────────────────────────────────────

src/
├── pages/
│   ├── LoginPage.tsx
│   ├── MfaPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   └── UserManagementPage.tsx
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── MfaForm.tsx
│       ├── ForgotPasswordForm.tsx
│       ├── ResetPasswordForm.tsx
│       ├── AuthGuard.tsx
│       ├── SessionTimeoutModal.tsx
│       ├── PasswordStrengthMeter.tsx
│       └── RoleBadge.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useSessionTimeout.ts
├── services/
│   └── authService.ts
└── types/
    └── auth.ts

## ─────────────────────────────────────────────
## 3. TypeScript Types (src/types/auth.ts)
## ─────────────────────────────────────────────

Define these types before building any component:

type UserRole = 'admin' | 'dentist' | 'hygienist' | 'front_desk';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clinicId: string;
  isActive: boolean;
  lastLogin: string | null;        // ISO 8601
  mfaEnabled: boolean;
  createdAt: string;               // ISO 8601
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isMfaPending: boolean;           // true after password OK, before MFA OK
  isLoading: boolean;
  sessionExpiresAt: number | null; // Unix timestamp (ms)
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberDevice: boolean;
}

interface MfaPayload {
  code: string;                    // 6-digit string
  trustDevice: boolean;            // skip MFA for 30 days on this device
}

interface AuditLogEntry {
  timestamp: string;               // ISO 8601
  action: 'login_success' | 'login_failure' | 'logout' | 'mfa_success'
        | 'mfa_failure' | 'password_change' | 'session_timeout'
        | 'account_locked';
  userId: string | null;
  email: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
}

## ─────────────────────────────────────────────
## 4. Mock Data Strategy
## ─────────────────────────────────────────────

Since backend is not built yet, authService.ts must simulate real behavior:

### Mock Users
| Email                  | Password       | Role       | MFA Code |
|------------------------|----------------|------------|----------|
| admin@airdental.com    | Admin123!@#    | admin      | 123456   |
| dr.chen@airdental.com  | Doctor123!@#   | dentist    | 234567   |
| hygienist@airdental.com| Hygiene123!@#  | hygienist  | 345678   |
| front@airdental.com    | Front123!@#    | front_desk | 456789   |

### Mock Behavior
- login(): 500ms delay → returns user + sets isMfaPending = true
- verifyMfa(): 300ms delay → validates code → sets isAuthenticated = true
- forgotPassword(): 1s delay → always returns success message
- resetPassword(): 500ms delay → validates password rules → returns success
- Track failed attempts in localStorage — lock after 5 failures for 30 min
- Store mock session token in memory (NOT localStorage) ⚠️ HIPAA
- "Remember device" flag stored in localStorage (device ID only, no PHI)

## ─────────────────────────────────────────────
## 5. Routing Setup
## ─────────────────────────────────────────────

Install: react-router-dom

Route structure in App.tsx:
- /login            → LoginPage          (public)
- /mfa              → MfaPage            (only if isMfaPending)
- /forgot-password  → ForgotPasswordPage (public)
- /reset-password   → ResetPasswordPage  (public)
- /                 → Scheduler          (protected — AuthGuard)
- /settings/users   → UserManagementPage (protected — AuthGuard + role=admin)
- Default redirect: unauthenticated → /login

AuthGuard logic:
  if (!isAuthenticated && !isMfaPending) → redirect to /login
  if (isMfaPending) → redirect to /mfa
  if (requiredRole && user.role !== requiredRole) → show "Access Denied"

## ─────────────────────────────────────────────
## 6. HIPAA Security Requirements (NON-NEGOTIABLE)
## ─────────────────────────────────────────────

### Authentication
- ⚠️ HIPAA: MFA required for ALL users, no exceptions
- ⚠️ HIPAA: Password requirements: min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- ⚠️ HIPAA: Account lockout after 5 consecutive failed login attempts (30-min cooldown)
- ⚠️ HIPAA: Log every auth event to AuditLogEntry[] (store in memory for now, backend later)
- ⚠️ HIPAA: "Remember device for 30 days" must NOT store any PHI — only a random device UUID

### Session Management
- ⚠️ HIPAA: Auto-logout after 15 minutes of inactivity
- ⚠️ HIPAA: Show warning modal at 13 minutes ("Your session will expire in 2 minutes")
  - Modal has "Continue Session" button (resets timer) and "Log Out" button
- ⚠️ HIPAA: On logout/timeout, clear ALL in-memory state (user data, tokens, patient data)
- ⚠️ HIPAA: No PHI in URL parameters, console logs, or localStorage
- ⚠️ HIPAA: Auth tokens stored in memory only (JS variable), NOT in localStorage/sessionStorage/cookies

### Audit Trail
- ⚠️ HIPAA: Every login attempt (success + failure) logged with: timestamp, email, IP, user agent
- ⚠️ HIPAA: Log session timeouts as separate event
- ⚠️ HIPAA: Log account lockouts as separate event
- Admin can view audit log in User Management page

## ─────────────────────────────────────────────
## 7. UI/UX Design Specifications
## ─────────────────────────────────────────────

### Login Page (/login)
- Layout: Centered card on subtle gradient background (not blue — use neutral gray/warm tone)
- Top: Air Dental logo + wordmark (use text "Air Dental" with a tooth icon from lucide-react)
- Form fields:
  - Email input (with lucide Mail icon)
  - Password input (with lucide Lock icon + show/hide toggle using Eye/EyeOff)
  - "Remember this device for 30 days" checkbox
  - "Sign In" button (full-width, primary color)
  - "Forgot password?" link below button
- Error states:
  - Invalid credentials: red banner at top of form "Invalid email or password"
  - Account locked: red banner "Account locked. Try again in X minutes."
  - Field-level validation: red border + helper text under the field
- Loading state: Button shows spinner + "Signing in..." text, all fields disabled
- Responsive: Card is max-w-md on desktop, full-width with px-4 on mobile

### MFA Page (/mfa)
- Layout: Same centered card style as login
- Header: "Two-Factor Authentication" + subtext "Enter the 6-digit code from your authenticator app"
- 6 separate digit input boxes (auto-focus next on input, backspace goes to previous)
- "Trust this device for 30 days" checkbox
- "Verify" button (full-width)
- "Resend code" link with 60-second cooldown timer
- "Use a different method" link (placeholder for future SMS/email options)
- Error: "Invalid code. X attempts remaining." in red

### Forgot Password Page (/forgot-password)
- Layout: Same centered card style
- Email input + "Send Reset Link" button
- Success state: Green checkmark icon + "If an account exists with this email, you will receive a reset link."
  (deliberately vague to prevent email enumeration ⚠️ HIPAA)
- "Back to Sign In" link

### Reset Password Page (/reset-password)
- Layout: Same centered card style
- New Password input (with PasswordStrengthMeter below)
- Confirm Password input
- Password rules checklist (checkmarks turn green as each rule is met):
  - At least 12 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character
- "Reset Password" button
- Success → redirect to /login with success toast

### Session Timeout Modal
- Overlay: semi-transparent dark backdrop
- Modal: "Session Expiring" title
- Body: "Your session will expire in [countdown] due to inactivity."
- Two buttons: "Continue Session" (primary) | "Log Out" (secondary)
- Countdown timer updates every second (from 120s down to 0)
- At 0: auto-redirect to /login with "Session expired" message

### User Management Page (/settings/users) — Admin only
- Table listing all users: Name, Email, Role, Last Login, Status (Active/Inactive)
- "Add User" button → opens modal with:
  - First Name, Last Name, Email, Role (dropdown), Temporary Password
  - On save: add to mock users array
- Each row has: Edit (pencil icon) | Deactivate (toggle) | Reset Password (key icon)
- Role filter dropdown above table
- Search by name/email
- Audit Log tab: table of recent AuditLogEntry[] with filters by action type and date

## ─────────────────────────────────────────────
## 8. Accessibility Requirements
## ─────────────────────────────────────────────

- All form inputs must have associated <label> elements
- Error messages linked to inputs via aria-describedby
- Focus management: auto-focus first input on page load, focus trap inside modals
- All interactive elements keyboard-accessible (Tab, Enter, Escape to close modals)
- Color contrast ratio minimum 4.5:1 for text (WCAG AA)
- Screen reader announcements for: login errors, MFA code status, session warnings

## ─────────────────────────────────────────────
## 9. Build Order (step by step)
## ─────────────────────────────────────────────

Step 1: Install react-router-dom, set up routing skeleton in App.tsx
Step 2: Create src/types/auth.ts with all type definitions
Step 3: Create src/services/authService.ts with mock data + simulated API calls
Step 4: Create src/hooks/useAuth.ts (AuthContext + AuthProvider + useAuth hook)
Step 5: Create src/components/auth/AuthGuard.tsx
Step 6: Build LoginPage.tsx + LoginForm.tsx (with all states: idle, loading, error, locked)
Step 7: Build MfaPage.tsx + MfaForm.tsx (with 6-digit input boxes)
Step 8: Build ForgotPasswordPage.tsx + ForgotPasswordForm.tsx
Step 9: Build ResetPasswordPage.tsx + ResetPasswordForm.tsx + PasswordStrengthMeter.tsx
Step 10: Create src/hooks/useSessionTimeout.ts + SessionTimeoutModal.tsx
Step 11: Build UserManagementPage.tsx (table + add/edit modals + audit log tab)
Step 12: Wire everything together — test full flow: login → MFA → scheduler → timeout
Step 13: HIPAA compliance check (run the checklist from MASTER_PROMPT.md)

## Start here
Begin with Step 1: Install react-router-dom and set up the routing skeleton.
Then move to Step 2-4 (types, mock service, auth hook) before building any UI.
Show me each file with full TypeScript typing and explain what each piece does.
```
