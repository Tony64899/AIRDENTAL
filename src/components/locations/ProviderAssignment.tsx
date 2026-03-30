// ProviderAssignment — checkbox list of all clinic providers for a given location.
// Assigning/removing a provider updates both provider.locationIds and location.providerIds.

import type { Provider } from '../../types/provider';

interface ProviderAssignmentProps {
  locationId:  string;
  allProviders: Provider[];
  assignedIds: string[];   // location.providerIds
  onAssign:    (providerId: string) => void;
  onRemove:    (providerId: string) => void;
}

const ROLE_LABEL: Record<string, string> = {
  dentist:       'Dentist',
  hygienist:     'Hygienist',
  orthodontist:  'Orthodontist',
  endodontist:   'Endodontist',
  oral_surgeon:  'Oral Surgeon',
  periodontist:  'Periodontist',
  other:         'Provider',
};

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map(p => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProviderAssignment({
  locationId, allProviders, assignedIds, onAssign, onRemove,
}: ProviderAssignmentProps) {
  // Separate into assigned vs. available pools
  const assigned   = allProviders.filter(p => assignedIds.includes(p.id));
  const unassigned = allProviders.filter(p => !assignedIds.includes(p.id));

  function toggle(provider: Provider) {
    if (assignedIds.includes(provider.id)) {
      onRemove(provider.id);
    } else {
      onAssign(provider.id);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#64748b]">
        Select which providers work at this location. A provider can be assigned to multiple locations.
      </p>

      {/* Assigned */}
      {assigned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
            Assigned ({assigned.length})
          </p>
          <div className="space-y-1">
            {assigned.map(p => (
              <ProviderRow key={p.id} provider={p} checked onToggle={() => toggle(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Available to add */}
      {unassigned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
            Not assigned
          </p>
          <div className="space-y-1">
            {unassigned.map(p => (
              <ProviderRow key={p.id} provider={p} checked={false} onToggle={() => toggle(p)} />
            ))}
          </div>
        </div>
      )}

      {allProviders.length === 0 && (
        <p className="text-sm text-[#94a3b8] text-center py-6 border border-dashed border-gray-200 rounded-xl">
          No providers in this clinic yet.
        </p>
      )}
    </div>
  );
}

function ProviderRow({
  provider,
  checked,
  onToggle,
}: {
  provider: Provider;
  checked:  boolean;
  onToggle: () => void;
}) {
  const initials   = getInitials(provider.name);
  const roleLabel  = ROLE_LABEL[provider.role ?? ''] ?? 'Provider';
  const otherLocs  = provider.locationIds.length - (checked ? 1 : 0);

  return (
    <label
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors',
        checked
          ? 'border-[#0891b2] bg-[#f0f9ff]'
          : 'border-gray-200 bg-white hover:border-gray-300',
      ].join(' ')}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-4 h-4 rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2] cursor-pointer"
      />

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#0891b2] flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-white">{initials}</span>
      </div>

      {/* Name + specialty */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#0f172a] truncate">{provider.name}</div>
        <div className="text-xs text-[#94a3b8]">
          {provider.specialty ?? roleLabel}
          {otherLocs > 0 && ` · +${otherLocs} other location${otherLocs > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Active badge */}
      {(provider.status ?? 'active') === 'active' ? (
        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
          Active
        </span>
      ) : (
        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
          Inactive
        </span>
      )}
    </label>
  );
}
