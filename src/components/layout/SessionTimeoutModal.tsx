// ⚠️ HIPAA: Session timeout warning modal.
// Shown 2 minutes before auto-logout (at 13 minutes of inactivity).
// Auto-logout happens at 15 minutes via useSessionTimeout hook.
// Colors: Navy #0B3A70 | Hover Red #A60F2D — matches auth page brand spec

import { Clock } from 'lucide-react';
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="timeout-title"
      aria-describedby="timeout-desc"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">

        {/* Clock icon in Navy */}
        <div className="w-14 h-14 rounded-full bg-[#0B3A70]/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-7 h-7 text-[#0B3A70]" />
        </div>

        <h2 id="timeout-title" className="text-lg font-bold text-slate-900 mb-2">
          Session Expiring
        </h2>

        <p id="timeout-desc" className="text-sm text-slate-500 mb-4">
          For your security, you will be automatically signed out in
        </p>

        {/* Countdown — Navy, monospace */}
        <div className="text-4xl font-bold text-[#0B3A70] mb-4 tabular-nums font-mono tracking-tight">
          {countdownDisplay}
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Click below to stay signed in, or you will be logged out automatically.
        </p>

        {/* Stay Signed In button — Navy → Red hover */}
        <button
          onClick={extendSession}
          className="w-full py-3 rounded-xl text-sm font-medium text-white shadow-sm
                     bg-[#0B3A70] hover:bg-[#A60F2D] transition-colors duration-300
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3A70] focus-visible:ring-offset-2"
          autoFocus
        >
          Stay Signed In
        </button>

        {/* ⚠️ HIPAA notice */}
        <p className="text-xs text-slate-400 mt-4">
          HIPAA requires automatic sign-out after 15 minutes of inactivity.
        </p>

      </div>
    </div>
  );
}
