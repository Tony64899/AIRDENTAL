// AirDentalLogo — Official Air Dental brand mark (PNG).
// Uses the exact official logo asset — do not substitute with an SVG recreation.
// Single source of truth: import from here in SideNav and AuthPageShell.

import logoSrc from '../images/air-dental-logo.png';

interface AirDentalLogoProps {
  size?:      number;
  className?: string;
}

export function AirDentalLogo({ size = 28, className }: AirDentalLogoProps) {
  return (
    <img
      src={logoSrc}
      width={size}
      height={size}
      alt="Air Dental"
      className={className}
      style={{ objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  );
}

// ── Clinic logo ────────────────────────────────────────────────────────────────
// Tooth-with-teal-swirls mark for Inspire Dental (the demo clinic).
// Stored as a data URL for use as <img src={CLINIC_LOGO_SVG} />.
export const CLINIC_LOGO_SVG = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="24" fill="#F8FAFB"/>
  <ellipse cx="60" cy="58" rx="30" ry="32" fill="none" stroke="#5BB8BF" stroke-width="3" opacity="0.3"/>
  <path d="M42 40 C42 40 35 55 40 72 C43 80 47 82 50 78 C53 74 54 65 55 60" fill="none" stroke="#5BB8BF" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <path d="M78 40 C78 40 85 55 80 72 C77 80 73 82 70 78 C67 74 66 65 65 60" fill="none" stroke="#5BB8BF" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <path d="M50 38 C50 30 55 26 60 26 C65 26 70 30 70 38 C70 44 68 50 66 58 C65 62 63 68 62 72 C61 76 59 76 58 72 C57 68 55 62 54 58 C52 50 50 44 50 38Z" fill="none" stroke="#3BA5AC" stroke-width="2.5"/>
  <text x="60" y="95" text-anchor="middle" font-size="7" font-family="system-ui,sans-serif" fill="#3BA5AC" letter-spacing="1.5" font-weight="500">INSPIRE</text>
  <text x="60" y="104" text-anchor="middle" font-size="6" font-family="system-ui,sans-serif" fill="#3BA5AC" letter-spacing="2">DENTAL</text>
</svg>
`);
