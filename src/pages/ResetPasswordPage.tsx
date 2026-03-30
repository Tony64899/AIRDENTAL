// ResetPasswordPage — spec: 01_auth.md §7 Reset Password Page
// Reached via emailed link: /reset-password?token=xxx
// New password + PasswordStrengthMeter | Confirm password | live requirements checklist
// ⚠️ HIPAA: token is never logged; success message is non-enumerable

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Circle, Check } from 'lucide-react';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import * as authService from '../services/authService';
import { ROUTES } from '../constants/routes';

// ── Password requirement rules ───────────────────────────────────────────────
interface Requirement {
  label: string;
  test: (pw: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { label: 'At least 12 characters',   test: pw => pw.length >= 12 },
  { label: 'One uppercase letter',      test: pw => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter',      test: pw => /[a-z]/.test(pw) },
  { label: 'One number',                test: pw => /[0-9]/.test(pw) },
  { label: 'One special character',     test: pw => /[^A-Za-z0-9]/.test(pw) },
];

export default function ResetPasswordPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  const [password,        setPassword]        = useState('');
  const [confirm,         setConfirm]         = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [isSuccess,       setIsSuccess]       = useState(false);
  const [error,           setError]           = useState('');

  const allRequirementsMet = REQUIREMENTS.every(r => r.test(password));

  // ── Invalid / missing token ──────────────────────────────────────────────
  if (!token) {
    return (
      <AuthPageShell
        title="Invalid Link"
        subtitle="This password reset link is missing or has expired."
        topSlot={
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Request a new link
          </Link>
        }
      >
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800 font-medium leading-relaxed">
            This reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
      </AuthPageShell>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <AuthPageShell
        title="Password Updated"
        subtitle="Your new password is set. Sign in to continue."
      >
        <div className="space-y-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
            className="w-full py-3 rounded-xl text-sm font-medium text-white shadow-sm
                       bg-[#0B3A70] hover:bg-[#A60F2D] transition-colors duration-300
                       flex items-center justify-center"
          >
            Sign in with new password
          </button>
        </div>
      </AuthPageShell>
    );
  }

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Your password does not meet all the requirements below.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch {
      setError('Something went wrong. Please try again or request a new link.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Form state ───────────────────────────────────────────────────────────
  return (
    <AuthPageShell
      title="Create New Password"
      subtitle="Choose a strong password for your account."
      topSlot={
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── New Password ────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label htmlFor="reset-password" className="block text-sm font-medium text-slate-700">
            New Password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white
                         text-slate-900 placeholder:text-slate-400 text-sm
                         focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Strength meter — shown once user starts typing */}
          {password && <PasswordStrengthMeter password={password} />}
        </div>

        {/* ── Confirm Password ────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label htmlFor="reset-confirm" className="block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="reset-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white
                         text-slate-900 placeholder:text-slate-400 text-sm
                         focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm(v => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Requirements checklist ──────────────────────────────────────── */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Password requirements
          </p>
          {REQUIREMENTS.map(req => {
            const met = req.test(password);
            return (
              <div key={req.label} className="flex items-center gap-2">
                {met ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={`text-sm transition-colors ${met ? 'text-green-700' : 'text-slate-500'}`}>
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Submit button ───────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isLoading || !allRequirementsMet || !confirm}
          className="w-full py-3 rounded-xl text-sm font-medium text-white shadow-sm
                     bg-[#0B3A70] hover:bg-[#A60F2D] transition-colors duration-300
                     disabled:opacity-70 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Updating...
            </>
          ) : (
            'Reset Password'
          )}
        </button>

      </form>
    </AuthPageShell>
  );
}
