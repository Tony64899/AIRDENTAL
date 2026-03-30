// Air Dental brand logo — layered triangle mark (3 stacked red stripes).
// Single source: import from here in all auth pages and the SideNav.
// Previously copy-pasted identically into LoginPage, MfaPage, ForgotPasswordPage.

interface AirDentalLogoProps {
  size?: number;
  className?: string;
}

export function AirDentalLogo({ size = 28, className }: AirDentalLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Air Dental logo"
    >
      <path d="M8 24h16l-2-4H10l-2 4z"    fill="#C53030" />
      <path d="M10.5 19h11l-2-4h-7l-2 4z" fill="#E53E3E" />
      <path d="M13 14h6l-3-6-3 6z"         fill="#FC8181" />
    </svg>
  );
}

// Clinic logo SVG — tooth with teal swirls (Inspire Dental branding)
// Stored as a data URL for use as an <img> src
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
