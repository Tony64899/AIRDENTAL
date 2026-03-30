// AuthPageShell — shared wrapper for all auth pages (Login, MFA, ForgotPassword, ResetPassword).
// Eliminates the 3x duplicated logo SVG code that was in each page.
// Provides the consistent brand header, centered content card, and footer.

import type { ReactNode } from 'react';
import { AirDentalLogo, CLINIC_LOGO_SVG } from '../../assets/icons/AirDentalLogo';

interface AuthPageShellProps {
  // Page-specific heading and subtext
  title: string;
  subtitle: string;

  // Optional content shown above the title (e.g., "Back to login" link)
  topSlot?: ReactNode;

  // The form component goes here
  children: ReactNode;
}

export function AuthPageShell({ title, subtitle, topSlot, children }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Brand header */}
      <header className="px-8 py-5">
        <div className="flex items-center gap-2.5">
          <AirDentalLogo size={30} />
          <span className="text-lg font-bold text-[#1a202c]">Air Dental</span>
        </div>
      </header>

      {/* Centered main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px] space-y-7">
          {/* Optional top slot (back link, etc.) */}
          {topSlot}

          {/* Clinic branding */}
          <div className="text-center space-y-2.5">
            <img
              src={CLINIC_LOGO_SVG}
              alt="Inspire Dental"
              className="w-[72px] h-[72px] mx-auto rounded-2xl"
            />
            <p className="text-[#2B6CB0] font-semibold text-sm">Inspire Dental</p>
          </div>

          {/* Page heading */}
          <div className="text-center space-y-1.5">
            <h1 className="text-[28px] font-bold text-[#1a202c] tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-[#718096]">{subtitle}</p>
          </div>

          {/* Page-specific form content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4">
        <p className="text-xs text-[#A0AEC0]">
          &copy; {new Date().getFullYear()} Air Dental Inc.
        </p>
      </footer>
    </div>
  );
}
