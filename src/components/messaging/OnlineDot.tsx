// OnlineDot — presence indicator used in ChannelSidebar next to DM avatars.

import type { OnlineStatus } from '../../types/messaging';

interface OnlineDotProps {
  status: OnlineStatus;
  className?: string;
}

const COLOR: Record<OnlineStatus, string> = {
  online:  'bg-green-500',
  away:    'bg-yellow-400',
  offline: 'bg-slate-300',
};

export function OnlineDot({ status, className = '' }: OnlineDotProps) {
  return (
    <span
      aria-label={status}
      className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-white flex-shrink-0 ${COLOR[status]} ${className}`}
    />
  );
}
