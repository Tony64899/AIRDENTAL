// Alert — inline banner for error, success, warning, and info messages.
// Used inside forms, page-level notifications, and HIPAA notices.

import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  className?: string;
}

const STYLES: Record<AlertVariant, { container: string; icon: string; iconComponent: typeof AlertCircle }> = {
  error:   { container: 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]', icon: 'text-[#ef4444]', iconComponent: AlertCircle },
  success: { container: 'bg-[#f0fdf4] border-[#86efac] text-[#166534]', icon: 'text-[#22c55e]', iconComponent: CheckCircle2 },
  warning: { container: 'bg-[#fefce8] border-[#fde047] text-[#854d0e]', icon: 'text-[#eab308]', iconComponent: AlertTriangle },
  info:    { container: 'bg-[#f0f9ff] border-[#7dd3fc] text-[#0369a1]', icon: 'text-[#0ea5e9]', iconComponent: Info },
};

export function Alert({ variant, title, children, dismissible = false, className = '' }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const style = STYLES[variant];
  const IconComponent = style.iconComponent;

  return (
    <div
      className={[
        'flex gap-3 p-4 rounded-lg border text-sm',
        style.container,
        className,
      ].join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <IconComponent className={['w-4 h-4 flex-shrink-0 mt-0.5', style.icon].join(' ')} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 p-0.5 hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
