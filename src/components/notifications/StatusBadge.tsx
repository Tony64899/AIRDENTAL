// StatusBadge.tsx — Visual badge for notification delivery status.
// Displays colored dot + label in a pill shape.

import type { NotificationStatus } from '../../types/notification';

interface StatusBadgeProps {
  status: NotificationStatus;
  size?:  'sm' | 'md';
}

const STATUS_CONFIG: Record<NotificationStatus, { bg: string; text: string; dot: string; label: string }> = {
  queued:    { bg: 'bg-gray-100',  text: 'text-gray-600',  dot: 'bg-gray-400',  label: 'Queued'    },
  sent:      { bg: 'bg-blue-50',   text: 'text-blue-700',  dot: 'bg-blue-500',  label: 'Sent'      },
  delivered: { bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500', label: 'Delivered' },
  failed:    { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'bg-red-500',   label: 'Failed'    },
  opted_out: { bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-500', label: 'Opted Out' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${textSize} ${px} ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
