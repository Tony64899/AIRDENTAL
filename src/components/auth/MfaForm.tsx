// MfaForm — spec: 01_auth.md §7 MFA Page
// 6 individual digit boxes | auto-focus + paste | "Trust device" custom checkbox
// Same Navy/Red button | resend 60s countdown | red banner on failure

import { useState, useRef, useCallback, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CODE_LENGTH = 6;

export function MfaForm() {
  const { state, verifyMfa, dispatch } = useAuth();

  const [digits,         setDigits]         = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [trustDevice,    setTrustDevice]    = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60); // start at 60 on mount
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer (starts automatically — spec: "disabled with 60s countdown after page load")
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return;
    dispatch({ type: 'CLEAR_ERROR' });
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) return;
    await verifyMfa(code);
  };

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    // TODO: trigger resend via authService when backend is connected
  }, [resendCooldown]);

  const isComplete = digits.every(d => d !== '');

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {state.error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800 font-medium leading-relaxed">
            {state.error}
          </p>
        </div>
      )}

      {/* ── 6-digit input boxes ─────────────────────────────────────────
          spec: w-12 h-14 text-center text-2xl font-semibold rounded-xl
                border border-slate-200 focus:ring-2 focus:ring-slate-900
      ─────────────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleDigitChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={state.isLoading}
            aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
            className="w-12 h-14 text-center text-2xl font-semibold rounded-xl
                       border border-slate-200 bg-white text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       caret-transparent"
          />
        ))}
      </div>

      {/* ── Trust this device — custom checkbox ─────────────────────────
          spec: same custom checkbox pattern as LoginForm
      ─────────────────────────────────────────────────────────────────── */}
      <label className="group flex items-center gap-2.5 cursor-pointer select-none justify-center">
        <input
          type="checkbox"
          checked={trustDevice}
          onChange={e => setTrustDevice(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-5 h-5 rounded border border-slate-300 bg-white flex items-center justify-center
                        peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-colors flex-shrink-0">
          {trustDevice && (
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
          Trust this device for 30 days
        </span>
      </label>

      {/* ── Verify button ──────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={state.isLoading || !isComplete}
        className="w-full py-3 rounded-xl text-sm font-medium text-white shadow-sm
                   bg-[#0B3A70] hover:bg-[#A60F2D] transition-colors duration-300
                   disabled:opacity-70 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {state.isLoading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify'
        )}
      </button>

      {/* ── Resend code with countdown ─────────────────────────────────── */}
      <p className="text-center text-sm text-slate-500">
        Didn't receive a code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className={
            resendCooldown > 0
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-[#0B3A70] underline hover:text-[#A60F2D] transition-colors'
          }
        >
          {resendCooldown > 0
            ? `Resend code (${resendCooldown}s)`
            : 'Resend code'}
        </button>
      </p>

    </form>
  );
}
