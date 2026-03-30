// MFA verification page — shown after successful password step.
// Guards against direct navigation: redirects if not in MFA pending state.

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MfaForm } from '../components/auth/MfaForm';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { ROUTES } from '../constants/routes';

export default function MfaPage() {
  const { state } = useAuth();
  const navigate = useNavigate();

  // Guard: must have completed password step first
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate(ROUTES.SCHEDULE, { replace: true });
    } else if (!state.isMfaPending) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [state.isAuthenticated, state.isMfaPending, navigate]);

  if (!state.isMfaPending) return null;

  return (
    <AuthPageShell
      title="Two-Factor Authentication"
      subtitle="We've sent a verification code to your device. Please enter the 6-digit code below."
      topSlot={
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1a202c] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      }
    >
      <MfaForm />
    </AuthPageShell>
  );
}
