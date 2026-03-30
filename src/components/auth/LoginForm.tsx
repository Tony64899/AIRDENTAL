import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function LoginForm() {
  const { state, login, dispatch } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'CLEAR_ERROR' });
    await login({ email, password, rememberDevice });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error banner */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-[#1a202c]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="provider@airdental.com"
          required
          autoComplete="email"
          autoFocus
          disabled={state.isLoading}
          className="w-full px-3.5 py-2.5 border border-[#CBD5E0] rounded-lg text-sm
                     bg-white text-[#1a202c] placeholder:text-[#A0AEC0]
                     focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:border-[#3182CE]
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-describedby={state.error ? 'login-error' : undefined}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-[#1a202c]">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
            disabled={state.isLoading}
            className="w-full px-3.5 py-2.5 pr-10 border border-[#CBD5E0] rounded-lg text-sm
                       bg-white text-[#1a202c] placeholder:text-[#A0AEC0]
                       focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:border-[#3182CE]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]
                       hover:text-[#4A5568] transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember device + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4 rounded border-[#CBD5E0] text-[#2D3748]
                       focus:ring-[#3182CE] accent-[#2D3748]"
          />
          <span className="text-sm text-[#4A5568]">Remember this device for 30 days</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-[#4A5568] hover:text-[#1a202c] transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit — dark navy slate to match Figma */}
      <button
        type="submit"
        disabled={state.isLoading || !email || !password}
        className="w-full py-3 bg-[#1e293b] text-white rounded-xl text-sm
                   font-semibold hover:bg-[#0f172a] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {state.isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Log In'
        )}
      </button>

      {/* HIPAA notice */}
      <p className="text-center text-xs text-[#93A3B8] pt-1">
        HIPAA Compliant System &middot; All access attempts are logged
      </p>
    </form>
  );
}
