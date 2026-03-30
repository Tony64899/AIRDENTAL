// All route paths as constants — import from here instead of hardcoding strings.
// This makes route renaming safe (change once, updates everywhere).

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  MFA: '/mfa',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Main app
  HOME: '/',
  SCHEDULE: '/schedule',
  DASHBOARD: '/dashboard',

  // Patients
  PATIENTS: '/patients',
  PATIENT_CHART: '/patients/:patientId',

  // Clinical
  BILLING: '/billing',
  XRAY: '/xray',

  // Admin
  SETTINGS:        '/settings',
  STAFF:           '/staff',
  STAFF_ORG_CHART: '/staff/org-chart',
  STAFF_ACCOUNTS:  '/staff/accounts',
  NOTIFICATIONS:   '/notifications',
  LOCATIONS:       '/locations',
} as const;

// Helper to build a patient chart URL with an actual ID
export function patientChartUrl(patientId: string): string {
  return `/patients/${patientId}`;
}
