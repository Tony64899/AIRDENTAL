// TimeSettingsModal — lets the user set the visible time range on the calendar
// and add new provider/operatory columns.
// Uses inline validation instead of window.alert().

import { useState }                    from 'react';
import { Plus }                        from 'lucide-react';
import { Modal }                       from '../ui/Modal';
import { Alert }                       from '../ui/Alert';
import { Button }                      from '../ui/Button';

interface TimeSettingsModalProps {
  timeRange:         { start: number; end: number };
  onClose:           () => void;
  onSave:            (timeRange: { start: number; end: number }) => void;
  onAddOperatory?:   () => void;   // creates a new provider column to the right
}

export function TimeSettingsModal({ timeRange, onClose, onSave, onAddOperatory }: TimeSettingsModalProps) {
  const [startHour,   setStartHour]   = useState(timeRange.start >= 12 ? timeRange.start - 12 || 12 : timeRange.start || 12);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(timeRange.start >= 12 ? 'PM' : 'AM');
  const [endHour,     setEndHour]     = useState(timeRange.end >= 12   ? timeRange.end   - 12 || 12 : timeRange.end   || 12);
  const [endPeriod,   setEndPeriod]   = useState<'AM' | 'PM'>(timeRange.end >= 12   ? 'PM' : 'AM');
  const [error, setError] = useState('');

  const to24h = (hour: number, period: 'AM' | 'PM') =>
    period === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);

  const handleSave = () => {
    setError('');
    const start24 = to24h(startHour, startPeriod);
    const end24   = to24h(endHour, endPeriod);

    if (start24 >= end24) {
      setError('End time must be after start time.');
      return;
    }
    onSave({ start: start24, end: end24 });
    onClose();
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const selectClass = 'flex-1 px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]';

  return (
    <Modal isOpen title="Preset Time Frame" onClose={onClose} size="sm">
      <div className="p-6 space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        {/* Start time */}
        <div>
          <label className="text-sm font-medium text-[#0f172a] block mb-2">Start Time</label>
          <div className="flex gap-3">
            <select value={startHour} onChange={e => setStartHour(Number(e.target.value))} className={selectClass}>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <select value={startPeriod} onChange={e => setStartPeriod(e.target.value as 'AM' | 'PM')} className="px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* End time */}
        <div>
          <label className="text-sm font-medium text-[#0f172a] block mb-2">End Time</label>
          <div className="flex gap-3">
            <select value={endHour} onChange={e => setEndHour(Number(e.target.value))} className={selectClass}>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <select value={endPeriod} onChange={e => setEndPeriod(e.target.value as 'AM' | 'PM')} className="px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Operatory section */}
      {onAddOperatory && (
        <div className="px-6 pb-2">
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-[#64748b] mb-3">
              Add a new provider column to the right side of the calendar.
            </p>
            <button
              onClick={onAddOperatory}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-[#0891b2]/40 text-[#0891b2] hover:bg-[#f0f9ff] text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              Add More Operatory
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-[#f8fafc] rounded-b-xl">
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="md" onClick={handleSave}>Confirm</Button>
      </div>
    </Modal>
  );
}
