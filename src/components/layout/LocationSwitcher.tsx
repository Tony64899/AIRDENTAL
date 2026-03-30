// LocationSwitcher — dropdown in TopBar for switching the active clinic location.
// Clicking a location item calls ClinicContext.switchLocation() which re-scopes
// the entire app (scheduler, billing, production numbers) to the selected office.

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Check, Building2 } from 'lucide-react';
import { useClinic } from '../../contexts/ClinicContext';

export function LocationSwitcher() {
  const { clinicName, currentLocation, availableLocations, switchLocation } = useClinic();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  function handleSelect(locationId: string) {
    switchLocation(locationId);
    setIsOpen(false);
  }

  const showSwitcher = availableLocations.length > 1;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => showSwitcher && setIsOpen(o => !o)}
        className={[
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors group',
          showSwitcher
            ? 'hover:bg-gray-100 cursor-pointer'
            : 'cursor-default',
        ].join(' ')}
        aria-haspopup={showSwitcher ? 'listbox' : undefined}
        aria-expanded={showSwitcher ? isOpen : undefined}
        title={showSwitcher ? 'Switch location' : undefined}
      >
        {/* Brand icon */}
        <div className="flex-shrink-0">
          <Building2 className="w-4 h-4 text-[#0891b2]" aria-hidden="true" />
        </div>

        {/* Label */}
        <div className="text-left leading-none">
          <div className="text-[11px] text-[#94a3b8] font-medium">{clinicName}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-[#64748b]" aria-hidden="true" />
            <span className="text-sm font-semibold text-[#0f172a]">{currentLocation.name}</span>
          </div>
        </div>

        {showSwitcher && (
          <ChevronDown
            className={[
              'w-3.5 h-3.5 text-[#94a3b8] transition-transform flex-shrink-0',
              isOpen ? 'rotate-180' : '',
            ].join(' ')}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
          role="listbox"
          aria-label="Select location"
        >
          <div className="px-3 py-1.5 mb-1 border-b border-gray-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
              Switch Location
            </span>
          </div>

          {availableLocations.map(loc => {
            const isActive = loc.id === currentLocation.id;
            return (
              <button
                key={loc.id}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(loc.id)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                  isActive
                    ? 'bg-[#f0f9ff] text-[#0891b2]'
                    : 'hover:bg-gray-50 text-[#0f172a]',
                ].join(' ')}
              >
                {/* Status dot */}
                <span
                  className={[
                    'w-2 h-2 rounded-full flex-shrink-0',
                    loc.isActive ? 'bg-green-500' : 'bg-gray-300',
                  ].join(' ')}
                  aria-label={loc.isActive ? 'Active' : 'Inactive'}
                />

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{loc.name}</div>
                  <div className="text-xs text-[#94a3b8] truncate">
                    {loc.city}, {loc.state} {loc.zip}
                  </div>
                </div>

                {/* Check mark for active */}
                {isActive && (
                  <Check className="w-4 h-4 text-[#0891b2] flex-shrink-0" aria-hidden="true" />
                )}

                {/* Primary badge */}
                {loc.isPrimary && !isActive && (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-[#94a3b8] flex-shrink-0">
                    Primary
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
