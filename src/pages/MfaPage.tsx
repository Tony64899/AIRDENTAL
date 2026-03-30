import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MfaForm } from '../components/auth/MfaForm';

// Clinic logo — tooth icon with teal swirls matching Figma design
const CLINIC_LOGO = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="24" fill="#F8FAFB"/>
  <ellipse cx="60" cy="58" rx="30" ry="32" fill="none" stroke="#5BB8BF" stroke-width="3" opacity="0.3"/>
  <path d="M42 40 C42 40 35 55 40 72 C43 80 47 82 50 78 C53 74 54 65 55 60" fill="none" stroke="#5BB8BF" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <path d="M78 40 C78 40 85 55 80 72 C77 80 73 82 70 78 C67 74 66 65 65 60" fill="none" stroke="#5BB8BF" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <path d="M50 38 C50 30 55 26 60 26 C65 26 70 30 70 38 C70 44 68 50 66 58 C65 62 63 68 62 72 C61 76 59 76 58 72 C57 68 55 62 54 58 C52 50 50 44 50 38Z" fill="none" stroke="#3BA5AC" stroke-width="2.5"/>
  <text x="60" y="95" text-anchor="middle" font-size="7" font-family="system-ui,sans-serif" fill="#3BA5AC" letter-spacing="1.5" font-weight="500">INSPIRE</text>
  <text x="60" y="104" text-anchor="middle" font-size="6" font-family="system-ui,sans-serif" fill="#3BA5AC" letter-spacing="2">DENTAL</text>
</svg>
`);

// Air Dental layered triangle logo (matching Figma — 3 stacked red stripes)
function AirDentalLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 24h16l-2-4H10l-2 4z" fill="#C53030" />
      <path d="M10.5 19h11l-2-4h-7l-2 4z" fill="#E53E3E" />
      <path d="M13 14h6l-3-6-3 6z" fill="#FC8181" />
    </svg>
  );
}

export default function MfaPage() {
  const { state } = useAuth();
  const navigate = useNavigate();

  // Guard: must have completed password step first
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/', { replace: true });
    } else if (!state.isMfaPending) {
      navigate('/login', { replace: true });
    }
  }, [state.isAuthenticated, state.isMfaPending, navigate]);

  if (!state.isMfaPending) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-5">
        <div className="flex items-center gap-2.5">
          <AirDentalLogo size={30} />
          <span className="text-lg font-bold text-[#1a202c]">Air Dental</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px] space-y-7">
          {/* Back to login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1a202c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {/* Clinic branding */}
          <div className="text-center space-y-2.5">
            <img
              src={CLINIC_LOGO}
              alt="Inspire Dental"
              className="w-[72px] h-[72px] mx-auto rounded-2xl"
            />
            <p className="text-[#2B6CB0] font-semibold text-sm">Inspire Dental</p>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5">
            <h1 className="text-[28px] font-bold text-[#1a202c] tracking-tight">
              Two-Factor Authentication
            </h1>
            <p className="text-sm text-[#718096]">
              We've sent a verification code to your device. Please enter the 6-digit code below.
            </p>
          </div>

          {/* MFA form */}
          <MfaForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4">
        <p className="text-xs text-[#A0AEC0]">
          &copy; 2026 Air Dental Inc.
        </p>
      </footer>
    </div>
  );
}
