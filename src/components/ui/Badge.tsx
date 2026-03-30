// Badge — color-coded status chip used for appointment status, user roles, claim status, etc.

import type { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default:  'bg-[#f1f5f9] text-[#475569]',
  primary:  'bg-[#e0f2fe] text-[#0369a1]',
  success:  'bg-[#dcfce7] text-[#166534]',
  warning:  'bg-[#fef9c3] text-[#854d0e]',
  danger:   'bg-[#fee2e2] text-[#991b1b]',
  info:     'bg-[#f0f9ff] text-[#0369a1]',
  neutral:  'bg-[#f8fafc] text-[#64748b] border border-[rgba(0,0,0,0.08)]',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

// AppointmentStatusBadge — maps AppointmentStatus to the correct Badge variant
import type { AppointmentStatus } from '../../types/appointment';

const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  scheduled:  'default',
  confirmed:  'primary',
  arrived:    'info',
  in_chair:   'info',
  completed:  'success',
  cancelled:  'neutral',
  no_show:    'danger',
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled:  'Scheduled',
  confirmed:  'Confirmed',
  arrived:    'Arrived',
  in_chair:   'In Chair',
  completed:  'Completed',
  cancelled:  'Cancelled',
  no_show:    'No Show',
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
