// LoginForm — spec: 01_auth.md §7 Login Page
// Navy #0B3A70 button → hover #A60F2D | custom checkbox | AlertCircle error banner
// Spinner "Authenticating..." loading | locked-account error state

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

export function LoginForm() {
  const { state, login, dispatch } = useAuth();
  const navigate = useNavigate();

  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [showPassword,   setShowPassword]   = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'CLEAR_ERROR' });
    const ok = await login({ email, password, rememberDevice });
    if (ok) navigate(ROUTES.MFA, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* ── Error / locked banner ──────────────────────────────────────── */}
      {state.error && (
        <div
          role="alert"
          id="login-error"
          className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800 font-medium leading-relaxed">
            {state.error}
          </p>
        </div>
      )}

      {/* ── Email ──────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state.isLoading}
          placeholder="provider@airdental.com"
          aria-describedby={state.error ? 'login-error' : undefined}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
                     text-slate-900 placeholder:text-slate-400 text-sm
                     focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* ── Password ───────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={state.isLoading}
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
            {showPassword
              ? <EyeOff className="w-5 h-5" />
              : <Eye    className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Remember device + Forgot password ─────────────────────────── */}
      <div className="flex items-center justify-between">

        {/* Custom checkbox — spec pattern (sr-only peer + styled div + SVG checkmark) */}
        <label className="group flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={e => setRememberDevice(e.target.checked)}
            className="sr-only peer"
          />
          {/* Custom box */}
          <div className="w-5 h-5 rounded border border-slate-300 bg-white flex items-center justify-center
                          peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-colors flex-shrink-0">
            {rememberDevice && (
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            Remember this device for 30 days
          </span>
        </label>

        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* ── Submit button ──────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={state.isLoading || !email || !password}
        className="w-full py-3 rounded-xl text-sm font-medium text-white shadow-sm
                   bg-[#0B3A70] hover:bg-[#A60F2D] transition-colors duration-300
                   disabled:opacity-70 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {state.isLoading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Authenticating...
          </>
        ) : (
          'Sign In'
        )}
      </button>

    </form>
  );
}
