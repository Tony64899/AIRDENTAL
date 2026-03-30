// Spinner — loading indicator for full-page or section loading states.

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;  // Screen reader text
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className = '', label = 'Loading...' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={['inline-flex', className].join(' ')}>
      <svg
        className={['animate-spin text-[#0891b2]', SIZE_CLASSES[size]].join(' ')}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </span>
  );
}

// Full-page loading screen — used when a protected page is initializing
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-[#64748b]">{message}</p>
    </div>
  );
}
