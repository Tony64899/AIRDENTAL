// App.tsx — root component: auth context, clinic context, and routing.
// Types have been moved to src/types/. Routes are defined in src/constants/routes.ts.
// Protected routes are wrapped in AppShell (SideNav + TopBar + SessionTimeoutModal).

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthReducer, useAuth } from './hooks/useAuth';
import { ClinicProvider } from './contexts/ClinicContext';
import { AppShell } from './components/layout/AppShell';

import LoginPage         from './pages/LoginPage';
import MfaPage           from './pages/MfaPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import SchedulePage      from './pages/SchedulePage';
import { DashboardPage } from './pages/DashboardPage';
import PatientsPage      from './pages/PatientsPage';
import NotFoundPage      from './pages/NotFoundPage';
import BillingPage       from './pages/BillingPage';
import XrayPage          from './pages/XrayPage';
import NotificationsPage from './pages/NotificationsPage';
import LocationsPage     from './pages/LocationsPage';
import SettingsPage           from './pages/SettingsPage';
import StaffPage              from './pages/StaffPage';
import OrgChartPage           from './pages/OrgChartPage';
import AccountManagementPage  from './pages/AccountManagementPage';

import { ROUTES } from './constants/routes';

// --- Protected route guard ---
// Redirects to login if not authenticated.
// Redirects to MFA page if mid-MFA flow.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (!state.isAuthenticated && !state.isMfaPending) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (state.isMfaPending && !state.isAuthenticated) {
    return <Navigate to={ROUTES.MFA} replace />;
  }

  // Wrap all protected pages in the AppShell (SideNav + TopBar + SessionTimeout)
  return <AppShell>{children}</AppShell>;
}

// --- Route tree ---
function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes — no AppShell */}
      <Route path={ROUTES.LOGIN}            element={<LoginPage />} />
      <Route path={ROUTES.MFA}              element={<MfaPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD}  element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD}   element={<ResetPasswordPage />} />

      {/* Protected routes — wrapped in AppShell */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <Navigate to={ROUTES.SCHEDULE} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SCHEDULE}
        element={
          <ProtectedRoute>
            <SchedulePage />
          </ProtectedRoute>
        }
      />

      {/* Stub routes for future phases — rendered as NotFoundPage until built */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PATIENTS}
        element={
          <ProtectedRoute>
            <PatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PATIENT_CHART}
        element={
          <ProtectedRoute>
            <PatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.BILLING}
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.XRAY}
        element={
          <ProtectedRoute>
            <XrayPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LOCATIONS}
        element={
          <ProtectedRoute>
            <LocationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STAFF}
        element={
          <ProtectedRoute>
            <StaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STAFF_ORG_CHART}
        element={
          <ProtectedRoute>
            <OrgChartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STAFF_ACCOUNTS}
        element={
          <ProtectedRoute>
            <AccountManagementPage />
          </ProtectedRoute>
        }
      />

      {/* 404 catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// --- Root component ---
export default function App() {
  const auth = useAuthReducer();

  return (
    // AuthContext provides login/logout/MFA state to the entire tree
    <AuthContext.Provider value={auth}>
      {/* ClinicContext provides current location to AppShell and all services */}
      <ClinicProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ClinicProvider>
    </AuthContext.Provider>
  );
}
