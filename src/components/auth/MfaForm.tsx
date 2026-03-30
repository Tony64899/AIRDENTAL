import { useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CODE_LENGTH = 6;

export function MfaForm() {
  const { state, verifyMfa, dispatch } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digits
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    dispatch({ type: 'CLEAR_ERROR' });

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    // Focus last filled or first empty
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) return;
    await verifyMfa(code);
  };

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendCooldown]);

  const isComplete = digits.every((d) => d !== '');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error banner */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {/* 6-digit input boxes */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            autoFocus={i === 0}
            disabled={state.isLoading}
            className="w-14 h-16 text-center text-xl font-semibold border border-[#CBD5E0]
                       rounded-xl bg-white text-[#1a202c]
                       focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:border-[#3182CE]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {/* Submit — dark navy slate to match Figma */}
      <button
        type="submit"
        disabled={state.isLoading || !isComplete}
        className="w-full py-3 bg-[#1e293b] text-white rounded-xl text-sm
                   font-semibold hover:bg-[#0f172a] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {state.isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify & Login'
        )}
      </button>

      {/* Resend code */}
      <p className="text-center text-sm text-[#718096]">
        Didn't receive the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="font-semibold text-[#1a202c] hover:underline disabled:opacity-50
                     disabled:cursor-not-allowed disabled:no-underline"
        >
          {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
        </button>
      </p>

      {/* HIPAA notice */}
      <p className="text-center text-xs text-[#93A3B8] pt-1">
        HIPAA Compliant System &middot; All access attempts are logged
      </p>
    </form>
  );
}
