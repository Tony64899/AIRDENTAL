// LocationCard — compact selectable card shown in the left panel of LocationsPage.
// Displays quick stats (appointments, production, providers, operatories) for today.

import { MapPin, Phone, Users, LayoutGrid, Calendar, DollarSign } from 'lucide-react';
import type { Location, LocationStats } from '../../types/clinic';

interface LocationCardProps {
  location:  Location;
  stats:     LocationStats | undefined;
  isSelected: boolean;
  isActive:  boolean;  // currently active app context
  onSelect:  () => void;
  onSwitch:  () => void;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return raw;
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function LocationCard({
  location, stats, isSelected, isActive, onSelect, onSwitch,
}: LocationCardProps) {
  return (
    <button
      onClick={onSelect}
      className={[
        'w-full text-left p-4 rounded-xl border transition-all',
        isSelected
          ? 'border-[#0891b2] bg-[#f0f9ff] shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
      ].join(' ')}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Active indicator */}
          <span
            className={[
              'w-2 h-2 rounded-full flex-shrink-0 mt-0.5',
              location.isActive ? 'bg-green-500' : 'bg-gray-300',
            ].join(' ')}
            title={location.isActive ? 'Active' : 'Inactive'}
          />
          <span className="text-sm font-semibold text-[#0f172a] truncate">{location.name}</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {location.isPrimary && (
            <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#0891b2]/10 text-[#0891b2]">
              Primary
            </span>
          )}
          {isActive && (
            <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center gap-1 text-xs text-[#64748b] mb-1">
        <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">{location.address}, {location.city}</span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-1 text-xs text-[#64748b] mb-3">
        <Phone className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        <span>{formatPhone(location.phone)}</span>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <StatPill icon={<Calendar className="w-3 h-3" />} value={`${stats.todayAppointments} appts`} />
          <StatPill icon={<DollarSign className="w-3 h-3" />} value={formatCurrency(stats.todayProduction)} />
          <StatPill icon={<Users className="w-3 h-3" />} value={`${stats.providerCount} providers`} />
          <StatPill icon={<LayoutGrid className="w-3 h-3" />} value={`${stats.operatoryCount} ops`} />
        </div>
      )}

      {/* Switch button */}
      {!isActive && (
        <button
          onClick={e => { e.stopPropagation(); onSwitch(); }}
          className="w-full text-center text-xs font-medium text-[#0891b2] hover:text-[#0e7490] py-1 rounded-lg hover:bg-[#0891b2]/5 transition-colors border border-[#0891b2]/20"
        >
          Switch to this location
        </button>
      )}
    </button>
  );
}

function StatPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
      <span className="text-[#94a3b8]">{icon}</span>
      <span className="text-xs text-[#64748b] font-medium truncate">{value}</span>
    </div>
  );
}
