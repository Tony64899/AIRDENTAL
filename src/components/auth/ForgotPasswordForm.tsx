// ForgotPasswordForm — spec: 01_auth.md §7 Forgot Password Page
// Email → "Send Reset Link" button | success state with centered CheckCircle2
// ⚠️ HIPAA: response message is deliberately vague (no email enumeration)

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as authService from '../../services/authService';
import { ROUTES } from '../../constants/routes';

export function ForgotPasswordForm() {
  const [email,      setEmail]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [isSuccess,  setIsSuccess]  = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
        <p className="text-sm text-slate-600 leading-relaxed">
          {/* ⚠️ HIPAA: deliberately vague — no email enumeration */}
          If an account exists with this email, a reset link has been sent.
          Check your inbox and spam folder.
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  // ── Form state ──────────────────────────────────────────────────────────────
  return (
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

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="provider@airdental.com"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
                     text-slate-900 placeholder:text-slate-400 text-sm
                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full py-3 rounded-xl text-sm font-medium text-white shadow-sm
                   bg-[#0B3A70] hover:bg-[#A60F2D] transition-colors duration-300
                   disabled:opacity-70 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      {/* Back to Sign In */}
      <div className="text-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>

    </form>
  );
}
