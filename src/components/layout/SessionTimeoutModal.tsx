// ⚠️ HIPAA: Session timeout warning modal.
// Shown 2 minutes before auto-logout (at 13 minutes of inactivity).
// Auto-logout happens at 15 minutes via useSessionTimeout hook.

import { ShieldAlert } from 'lucide-react';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';

export function SessionTimeoutModal() {
  const { showWarning, secondsRemaining, extendSession } = useSessionTimeout();

  if (!showWarning) return null;

  // Format seconds as MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const countdownDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="timeout-title"
      aria-describedby="timeout-desc"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        {/* Warning icon */}
        <div className="w-14 h-14 rounded-full bg-[#fef9c3] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7 text-[#d97706]" />
        </div>

        <h2 id="timeout-title" className="text-lg font-bold text-[#0f172a] mb-2">
          Session Expiring
        </h2>

        <p id="timeout-desc" className="text-sm text-[#64748b] mb-4">
          For your security, you will be automatically signed out in
        </p>

        {/* Countdown display */}
        <div className="text-4xl font-bold text-[#d97706] mb-4 tabular-nums">
          {countdownDisplay}
        </div>

        <p className="text-sm text-[#64748b] mb-6">
          Click below to stay signed in, or you will be logged out automatically.
        </p>

        {/* CTA */}
        <button
          onClick={extendSession}
          className="w-full py-2.5 bg-[#0891b2] text-white font-semibold rounded-xl hover:bg-[#0e7490] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0891b2] focus-visible:ring-offset-2"
          autoFocus
        >
          Stay Signed In
        </button>

        {/* ⚠️ HIPAA notice */}
        <p className="text-xs text-[#94a3b8] mt-4">
          ⚠️ HIPAA requires automatic sign-out after 15 minutes of inactivity.
        </p>
      </div>
    </div>
  );
}
