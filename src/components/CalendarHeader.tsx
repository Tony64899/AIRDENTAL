import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  view: 'day' | 'week';
  onViewChange: (view: 'day' | 'week') => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onOpenTimeSettings: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPreviousDay,
  onNextDay,
  onOpenTimeSettings,
}: CalendarHeaderProps) {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="font-semibold text-gray-900">Dental Schedule</h1>
          <div className="flex items-center gap-3">
            <button onClick={onPreviousDay} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-sm text-gray-700 min-w-[280px] text-center">
              {formatDate(currentDate)}
            </div>
            <button onClick={onNextDay} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange('day')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => onViewChange('week')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>
          <button onClick={onOpenTimeSettings} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Time Settings">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
