import type { Appointment, Provider } from '../App';

interface AppointmentCardProps {
  appointment: Appointment;
  provider: Provider;
  rowSpan: number;
  onClick: () => void;
}

export function AppointmentCard({ appointment, provider, rowSpan, onClick }: AppointmentCardProps) {
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const hasEnoughSpace = rowSpan >= 3;

  return (
    <div
      onClick={onClick}
      className="absolute inset-0 m-0.5 rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-all group"
      style={{
        backgroundColor: `${provider.color}15`,
        borderColor: provider.color,
        gridRow: `span ${rowSpan}`,
      }}
    >
      <div className="h-full flex flex-col p-2">
        <div className="text-xs font-semibold mb-0.5 truncate" style={{ color: provider.color }}>
          {appointment.patientName}
        </div>
        {hasEnoughSpace && (
          <div className="text-xs text-gray-600 truncate mb-1">{appointment.procedure}</div>
        )}
        <div className="text-xs text-gray-500 mt-auto">
          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
        </div>
      </div>
      <div
        className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: provider.color }}
      />
    </div>
  );
}
