// Button — primary interactive element used throughout the app.
// Variants match the Air Dental design system.

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

// Tailwind class maps for each variant and size
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:     'bg-[#0891b2] text-white hover:bg-[#0e7490] active:bg-[#155e75] shadow-sm',
  secondary:   'bg-white text-[#0f172a] border border-[rgba(0,0,0,0.12)] hover:bg-[#f8fafc] active:bg-[#f1f5f9] shadow-sm',
  ghost:       'text-[#0f172a] hover:bg-[#f1f5f9] active:bg-[#e2e8f0]',
  destructive: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] active:bg-[#991b1b] shadow-sm',
  outline:     'border border-[#0891b2] text-[#0891b2] hover:bg-[#f0f9ff] active:bg-[#e0f2fe]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm:  'px-3 py-1.5 text-sm rounded-lg',
  md:  'px-4 py-2 text-sm rounded-lg',
  lg:  'px-6 py-2.5 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0891b2] focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {/* Spinner shown while loading */}
      {isLoading && (
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
