// AirDentalLogo — Official Air Dental brand mark, recreated as SVG.
// Four concentric triangle rings with orange → red → deep-red → navy gradient.
// The characteristic open bottom-left corner is produced naturally by the
// nested triangles: inner rings don't reach as far left as outer ones.
// Single source of truth — import from here everywhere the logo is needed.

import { useId } from 'react';

interface AirDentalLogoProps {
  size?:      number;
  className?: string;
}

export function AirDentalLogo({ size = 28, className }: AirDentalLogoProps) {
  // useId ensures each rendered instance gets a unique gradient ID,
  // preventing conflicts when the logo appears in SideNav and AuthPageShell simultaneously.
  const uid    = useId();
  const gradId = `adlg-${uid.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 520 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Air Dental"
      role="img"
    >
      <defs>
        {/*
          Vertical gradient (top → bottom), coordinates in userSpace so it
          maps correctly regardless of which sub-paths are filled.
          Orange at apex → red through body → dark navy at base.
        */}
        <linearGradient
          id={gradId}
          x1="260" y1="25"
          x2="260" y2="495"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#F97316" />  {/* orange-500  */}
          <stop offset="30%"  stopColor="#EF4444" />  {/* red-400     */}
          <stop offset="68%"  stopColor="#991B1B" />  {/* red-900     */}
          <stop offset="100%" stopColor="#1E1B4B" />  {/* indigo-950  */}
        </linearGradient>
      </defs>

      {/*
        Eight nested isoceles triangles drawn with fill-rule="evenodd".
        Even-odd alternation: T0→T1 filled, T1→T2 gap, T2→T3 filled … etc.
        This yields exactly 4 visible colored rings separated by 3 white gaps.

        Triangle vertices (apex, bottom-right, bottom-left) computed by
        offsetting each level by a fixed perpendicular distance from the
        triangle edges (incircle-scaled insets):
          stripe ≈ 15 px perpendicular, gap ≈ 7 px perpendicular

        Ring 1 (outer):  T0 → T1
        Gap  1:           T1 → T2
        Ring 2:           T2 → T3
        Gap  2:           T3 → T4
        Ring 3:           T4 → T5
        Gap  3:           T5 → T6
        Ring 4 (inner):  T6 → T7
      */}
      <path
        fill={`url(#${gradId})`}
        fillRule="evenodd"
        d={
          'M260,25  L505,495 L15,495  Z ' +   // T0 — outer boundary
          'M260,58  L480,480 L40,480  Z ' +   // T1 — inner edge of ring 1
          'M260,73  L469,473 L51,473  Z ' +   // T2 — outer edge of ring 2
          'M260,105 L444,458 L76,458  Z ' +   // T3 — inner edge of ring 2
          'M260,120 L433,451 L87,451  Z ' +   // T4 — outer edge of ring 3
          'M260,152 L408,436 L112,436 Z ' +   // T5 — inner edge of ring 3
          'M260,167 L397,429 L123,429 Z ' +   // T6 — outer edge of ring 4
          'M260,200 L372,414 L148,414 Z'      // T7 — inner boundary
        }
      />
    </svg>
  );
}

// ── Clinic logo ────────────────────────────────────────────────────────────────
// Tooth-with-teal-swirls mark for Inspire Dental (the demo clinic).
// Stored as a data URL so it can be used as <img src={CLINIC_LOGO_SVG} />.
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
