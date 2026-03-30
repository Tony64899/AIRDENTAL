// AuthPageShell — shared layout wrapper for all auth pages.
// Spec: 01_auth.md — subtle gradient bg, floating card (no shadow/border),
// official logo PNG in white rounded-square, Navy #0B3A70 branding,
// HIPAA footer on every page.

import type { ReactNode } from 'react';
import airDentalLogo from '../../assets/images/air-dental-logo.png';

interface AuthPageShellProps {
  title:    string;
  subtitle: string;
  children: ReactNode;
  /** Optional slot above the logo — e.g. "← Back to login" link */
  topSlot?: ReactNode;
}

export function AuthPageShell({ title, subtitle, children, topSlot }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Optional back-link / top slot */}
        {topSlot && (
          <div className="mb-6">{topSlot}</div>
        )}

        {/* ── Logo block ─────────────────────────────────────────────────
            spec: w-20 h-20 bg-white rounded-[1.25rem] shadow-sm
                  border-[0.5px] border-slate-200, inner rounded-xl img
        ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 bg-white rounded-[1.25rem] shadow-sm border border-slate-200 flex items-center justify-center p-0.5 overflow-hidden">
            <div className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center">
              <img
                src={airDentalLogo}
                alt="Air Dental"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          </div>
          <span className="text-xl font-bold text-[#0B3A70] tracking-tight">
            Air Dental
          </span>
        </div>

        {/* ── Page heading ─────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ── Page-specific form content ───────────────────────────────── */}
        {children}

        {/* ── HIPAA footer (required on every auth page) ───────────────── */}
        <p className="text-xs text-slate-400 mt-8 text-center">
          HIPAA Compliant System&nbsp;•&nbsp;All access attempts are logged
        </p>

      </div>
    </div>
  );
}

// Keep re-export for any code that still imports CLINIC_LOGO_SVG from this file
export { CLINIC_LOGO_SVG } from '../../assets/icons/AirDentalLogo';
