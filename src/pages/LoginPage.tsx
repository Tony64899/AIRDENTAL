// Login page — entry point for the Air Dental application.
// Uses AuthPageShell for consistent brand layout.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { ROUTES } from '../constants/routes';

export default function LoginPage() {
  const { state } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated or mid-MFA flow
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate(ROUTES.SCHEDULE, { replace: true });
    } else if (state.isMfaPending) {
      navigate(ROUTES.MFA, { replace: true });
    }
  }, [state.isAuthenticated, state.isMfaPending, navigate]);

  return (
    <AuthPageShell
      title="Welcome Back"
      subtitle="Enter your email and password to access your account."
    >
      <LoginForm />
    </AuthPageShell>
  );
}
