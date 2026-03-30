// Input — styled text field with label, error state, and helper text support.
// Used in all forms across the app.

import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#0f172a]"
        >
          {label}
          {props.required && <span className="text-[#dc2626] ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Input wrapper (handles icon positioning) */}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          {...props}
          className={[
            'w-full px-3 py-2 text-sm text-[#0f172a] bg-white',
            'border rounded-lg transition-colors',
            'placeholder:text-[#94a3b8]',
            'focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]',
            'disabled:bg-[#f8fafc] disabled:cursor-not-allowed disabled:text-[#94a3b8]',
            error
              ? 'border-[#dc2626] focus:ring-[#dc2626]/30 focus:border-[#dc2626]'
              : 'border-[rgba(0,0,0,0.12)]',
            leftIcon  ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            className,
          ].join(' ')}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-[#dc2626]" role="alert">
          {error}
        </p>
      )}

      {/* Helper text (only shown when no error) */}
      {helperText && !error && (
        <p className="text-xs text-[#64748b]">{helperText}</p>
      )}
    </div>
  );
}
