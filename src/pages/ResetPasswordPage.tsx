// Reset password page — reached via emailed reset link (/reset-password?token=xxx).
// Phase 1 stub: shows the form shell but submission is not wired to a backend yet.
// TODO (backend phase): Validate token via NestJS, call PATCH /auth/reset-password.

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../constants/routes';
import { validatePassword } from '../utils/validationUtils';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted]   = useState(false);
  const [error, setError]               = useState('');

  // If no token in URL, show an error
  if (!token) {
    return (
      <AuthPageShell
        title="Invalid Link"
        subtitle="This password reset link is missing or has expired."
        topSlot={
          <Link to={ROUTES.FORGOT_PASSWORD} className="inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1a202c] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Request a new link
          </Link>
        }
      >
        <Alert variant="error">
          This reset link is invalid or has expired. Please request a new one.
        </Alert>
      </AuthPageShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { valid, errors } = validatePassword(password);
    if (!valid) {
      setError(errors.join(', '));
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // TODO (backend phase): Call authService.resetPassword(token, password)
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthPageShell
        title="Password Updated"
        subtitle="Your password has been reset successfully."
      >
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto" />
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center justify-center w-full py-2.5 bg-[#0891b2] text-white font-semibold rounded-xl hover:bg-[#0e7490] transition-colors"
          >
            Sign in with new password
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Create New Password"
      subtitle="Your new password must be at least 12 characters and include uppercase, lowercase, a number, and a special character."
      topSlot={
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1a202c] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        {/* New password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-[#0f172a]">New Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 text-sm border border-[rgba(0,0,0,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-sm font-medium text-[#0f172a]">Confirm Password</label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirm(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            placeholder="Confirm new password"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Reset Password
        </Button>
      </form>
    </AuthPageShell>
  );
}
