// Skeleton — animated loading placeholder used while data is fetching.
// Replaces blank white space with a shimmer to show "something is loading here."

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

// Single skeleton bar
export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={['rounded-md bg-[#e2e8f0] animate-pulse', className].join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// Preset skeleton layouts for common use cases

// A row of text (e.g., patient name + info)
export function SkeletonText({ lines = 2 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          // Each line is a slightly different width for a realistic look
          width={i === 0 ? '70%' : i === lines - 1 ? '40%' : '90%'}
        />
      ))}
    </div>
  );
}

// A card-shaped skeleton (e.g., appointment card or metric card)
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={['bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-5 space-y-3', className].join(' ')}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// A table row skeleton
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex gap-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}
