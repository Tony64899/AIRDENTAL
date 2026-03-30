import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthReducer, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MfaPage from './pages/MfaPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SchedulePage from './pages/SchedulePage';

// --- Types exported for other components ---
export interface Appointment {
  id: string;
  patientName: string;
  procedure: string;
  providerId: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  notes?: string;
}

export interface Provider {
  id: string;
  name: string;
  operatory: string;
  color: string;
}

// --- Auth guard for protected routes ---
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (!state.isAuthenticated && !state.isMfaPending) {
    return <Navigate to="/login" replace />;
  }

  if (state.isMfaPending && !state.isAuthenticated) {
    return <Navigate to="/mfa" replace />;
  }

  return <>{children}</>;
}

// --- App with routing ---
function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mfa" element={<MfaPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SchedulePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const auth = useAuthReducer();

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
