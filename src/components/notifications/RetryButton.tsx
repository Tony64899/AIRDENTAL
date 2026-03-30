// RetryButton.tsx — Retry action button for failed notification log entries.
// Disabled when retry count has reached maximum (3).

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';

interface RetryButtonProps {
  logId:      string;
  retryCount: number;
  onRetry:    (id: string) => Promise<void>;
}

export function RetryButton({ logId, retryCount, onRetry }: RetryButtonProps) {
  const [loading, setLoading] = useState(false);
  const maxed = retryCount >= 3;

  const handleRetry = async () => {
    if (maxed || loading) return;
    setLoading(true);
    try {
      await onRetry(logId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-0.5">
      <button
        onClick={handleRetry}
        disabled={maxed || loading}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors
          ${maxed
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#0891b2] hover:bg-[#e0f2fe] cursor-pointer'}`}
      >
        {loading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <RotateCcw className="w-3 h-3" />
        }
        {maxed ? 'Max retries' : 'Retry'}
      </button>
      <span className="text-[10px] text-[#94a3b8] pl-2.5">{retryCount}/3 attempts</span>
    </div>
  );
}
