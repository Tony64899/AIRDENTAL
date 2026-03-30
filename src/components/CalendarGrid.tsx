import { useState } from 'react';
import { Settings } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';
import { ColumnSettingsModal } from './ColumnSettingsModal';
import type { Provider, Appointment } from '../App';

interface CalendarGridProps {
  providers: Provider[];
  appointments: Appointment[];
  timeRange: { start: number; end: number };
  onAppointmentClick: (appointment: Appointment) => void;
  onProviderUpdate: (id: string, updates: Partial<Provider>) => void;
}

export function CalendarGrid({
  providers,
  appointments,
  timeRange,
  onAppointmentClick,
  onProviderUpdate,
}: CalendarGridProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ col: number; row: number } | null>(null);

  // Generate 15-minute time slots
  const timeSlots: string[] = [];
  for (let hour = timeRange.start; hour <= timeRange.end; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === timeRange.end && minute > 0) break;
      timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const isHourMark = (time: string) => time.endsWith(':00');

  const timeToSlotIndex = (time: string) => timeSlots.indexOf(time);

  const getAppointmentPosition = (appointment: Appointment) => {
    const startIndex = timeToSlotIndex(appointment.startTime);
    const endIndex = timeToSlotIndex(appointment.endTime);
    if (startIndex === -1 || endIndex === -1) return null;
    return { rowStart: startIndex + 2, rowSpan: endIndex - startIndex };
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="min-w-max">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `80px repeat(${providers.length}, minmax(200px, 1fr))`,
            gridTemplateRows: `60px auto repeat(${timeSlots.length}, 20px)`,
          }}
        >
          {/* Corner cell */}
          <div className="bg-white border-b border-r border-gray-200" />

          {/* Provider headers */}
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white border-b border-r border-gray-200 px-4 py-3 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{provider.name}</div>
                <div className="text-sm text-gray-500 truncate">{provider.operatory}</div>
              </div>
              <button
                onClick={() => setSelectedProviderId(provider.id)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                title="Provider Settings"
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}

          {/* Sub-header row */}
          <div className="bg-gray-50 border-b border-r border-gray-200" />
          {providers.map((provider) => (
            <div key={`col-${provider.id}`} className="bg-gray-50 border-b border-r border-gray-200" />
          ))}

          {/* Time slots */}
          {timeSlots.map((time, rowIndex) => (
            <div key={time} className="contents">
              <div
                className={`bg-white border-r border-gray-200 px-3 py-1 text-right text-sm ${
                  isHourMark(time)
                    ? 'border-t border-gray-300 text-gray-700 font-medium'
                    : 'border-t border-gray-100 text-gray-500'
                }`}
              >
                {isHourMark(time) ? formatTime(time) : ''}
              </div>

              {providers.map((provider, colIndex) => {
                const appointmentInSlot = appointments
                  .filter(apt => apt.providerId === provider.id)
                  .find(apt => timeToSlotIndex(apt.startTime) === rowIndex);

                return (
                  <div
                    key={`${provider.id}-${time}`}
                    className={`relative border-r bg-white ${
                      isHourMark(time) ? 'border-t border-gray-300' : 'border-t border-gray-100'
                    } ${
                      hoveredSlot?.col === colIndex && hoveredSlot?.row === rowIndex ? 'bg-gray-50' : ''
                    } transition-colors cursor-pointer`}
                    onMouseEnter={() => setHoveredSlot({ col: colIndex, row: rowIndex })}
                    onMouseLeave={() => setHoveredSlot(null)}
                    style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 3 }}
                  >
                    {appointmentInSlot && (
                      <AppointmentCard
                        appointment={appointmentInSlot}
                        provider={provider}
                        rowSpan={getAppointmentPosition(appointmentInSlot)?.rowSpan ?? 1}
                        onClick={() => onAppointmentClick(appointmentInSlot)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedProviderId && (
        <ColumnSettingsModal
          provider={providers.find(p => p.id === selectedProviderId)!}
          onClose={() => setSelectedProviderId(null)}
          onSave={(updates) => {
            onProviderUpdate(selectedProviderId, updates);
            setSelectedProviderId(null);
          }}
        />
      )}
    </div>
  );
}
