import { useState } from 'react';
import { X } from 'lucide-react';

interface TimeSettingsModalProps {
  timeRange: { start: number; end: number };
  onClose: () => void;
  onSave: (timeRange: { start: number; end: number }) => void;
}

export function TimeSettingsModal({ timeRange, onClose, onSave }: TimeSettingsModalProps) {
  const [startHour, setStartHour] = useState(timeRange.start >= 12 ? timeRange.start - 12 || 12 : timeRange.start || 12);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(timeRange.start >= 12 ? 'PM' : 'AM');
  const [endHour, setEndHour] = useState(timeRange.end >= 12 ? timeRange.end - 12 || 12 : timeRange.end || 12);
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(timeRange.end >= 12 ? 'PM' : 'AM');

  const convertTo24Hour = (hour: number, period: 'AM' | 'PM') => {
    if (period === 'AM') return hour === 12 ? 0 : hour;
    return hour === 12 ? 12 : hour + 12;
  };

  const handleSave = () => {
    const start24 = convertTo24Hour(startHour, startPeriod);
    const end24 = convertTo24Hour(endHour, endPeriod);
    if (start24 >= end24) {
      alert('End time must be after start time');
      return;
    }
    onSave({ start: start24, end: end24 });
    onClose();
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Preset Time Frame</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Start Time</label>
            <div className="flex gap-3">
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <select
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value as 'AM' | 'PM')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">End Time</label>
            <div className="flex gap-3">
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <select
                value={endPeriod}
                onChange={(e) => setEndPeriod(e.target.value as 'AM' | 'PM')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
