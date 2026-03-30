// LocationsPage — multi-location dashboard + settings (Admin only).
// Left panel: location cards with today's quick stats.
// Right panel: full settings for the selected location.
// ⚠️ HIPAA: NPI and Tax ID visible only when admin explicitly reveals them.

import { useState, useEffect } from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';
import type { Location, LocationStats } from '../types/clinic';
import type { Provider } from '../types/provider';
import { getLocations, getLocationStats, createLocation, getProviders } from '../services/locationService';
import { LocationCard }         from '../components/locations/LocationCard';
import { LocationSettingsPanel } from '../components/locations/LocationSettingsPanel';
import { AddLocationModal }      from '../components/locations/AddLocationModal';

export default function LocationsPage() {
  const { clinicId, currentLocation, switchLocation } = useClinic();

  const [locations,  setLocations]  = useState<Location[]>([]);
  const [statsMap,   setStatsMap]   = useState<Record<string, LocationStats>>({});
  const [providers,  setProviders]  = useState<Provider[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load on mount
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  // Default selection to currentLocation once loaded
  useEffect(() => {
    if (locations.length > 0 && selectedId === null) {
      setSelectedId(currentLocation.id);
    }
  }, [locations, currentLocation.id, selectedId]);

  async function load() {
    setIsLoading(true);
    try {
      const [locs, stats, provs] = await Promise.all([
        getLocations(clinicId),
        getLocationStats(clinicId),
        getProviders(clinicId),
      ]);
      setLocations(locs);
      setStatsMap(Object.fromEntries(stats.map(s => [s.locationId, s])));
      setProviders(provs);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddLocation(data: Parameters<typeof createLocation>[0]) {
    const newLoc = await createLocation(data);
    setLocations(prev => [...prev, newLoc]);
    setSelectedId(newLoc.id);
    setShowAddModal(false);
  }

  function handleLocationUpdated(updated: Location) {
    setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
  }

  const selectedLocation = locations.find(l => l.id === selectedId) ?? null;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 flex-shrink-0 border-r border-gray-200 p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-36" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="animate-pulse bg-gray-200 rounded-xl h-8 w-48" />
          <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* ── Left panel — location list ─────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
        {/* List header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0891b2]" />
            <span className="text-sm font-bold text-[#0f172a]">
              Locations
              <span className="ml-1.5 text-[10px] font-semibold text-[#94a3b8] bg-gray-100 px-1.5 py-0.5 rounded-full">
                {locations.length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={load}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#64748b] hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#0891b2] text-white hover:bg-[#0e7490] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Location cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {locations.map(loc => (
            <LocationCard
              key={loc.id}
              location={loc}
              stats={statsMap[loc.id]}
              isSelected={selectedId === loc.id}
              isActive={currentLocation.id === loc.id}
              onSelect={() => setSelectedId(loc.id)}
              onSwitch={() => switchLocation(loc.id)}
            />
          ))}

          {locations.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No locations yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm font-medium text-[#0891b2] hover:text-[#0e7490]"
              >
                + Add first location
              </button>
            </div>
          )}
        </div>

        {/* Summary footer */}
        {locations.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <SummaryRow
              label="Today's Appointments"
              value={Object.values(statsMap).reduce((s, st) => s + st.todayAppointments, 0).toString()}
            />
            <SummaryRow
              label="Today's Production"
              value={formatCurrency(Object.values(statsMap).reduce((s, st) => s + st.todayProduction, 0))}
            />
          </div>
        )}
      </div>

      {/* ── Right panel — location settings ───────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {selectedLocation ? (
          <LocationSettingsPanel
            key={selectedLocation.id}
            location={selectedLocation}
            allProviders={providers}
            onLocationUpdated={handleLocationUpdated}
          />
        ) : (
          <EmptyState onAdd={() => setShowAddModal(true)} />
        )}
      </div>

      {/* Add location modal */}
      {showAddModal && (
        <AddLocationModal
          clinicId={clinicId}
          onSave={handleAddLocation}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-[#94a3b8]">{label}</span>
      <span className="text-xs font-semibold text-[#0f172a]">{value}</span>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center text-center p-12">
      <div>
        <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-[#0f172a] mb-1">Select a location</h3>
        <p className="text-xs text-[#94a3b8] mb-4">
          Choose a location from the left panel to view and edit its settings.
        </p>
        <button
          onClick={onAdd}
          className="text-sm font-medium text-[#0891b2] hover:text-[#0e7490] transition-colors"
        >
          + Add new location
        </button>
      </div>
    </div>
  );
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
