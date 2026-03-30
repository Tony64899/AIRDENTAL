// TopBar — global top header displayed above all protected pages.
// Phase 9: LocationSwitcher replaces the static clinic name + location badge.

import { LocationSwitcher } from './LocationSwitcher';

export function TopBar() {
  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-[rgba(0,0,0,0.08)]">
      {/* Left: clinic name + location switcher */}
      <LocationSwitcher />

      {/* Right: date display */}
      <div className="flex items-center gap-2">
        <div className="text-xs text-[#94a3b8] px-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
