import { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface SidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function Sidebar({ currentDate, onDateChange }: SidebarProps) {
  const selectedPatient = {
    name: 'Emma Johnson',
    dob: '03/15/1985',
    age: 41,
    alerts: ['Penicillin Allergy', 'High Blood Pressure'],
  };

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(calendarMonth);

  const handlePreviousMonth = () => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCalendarMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCalendarMonth(newDate);
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(calendarMonth);
    newDate.setDate(day);
    onDateChange(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      calendarMonth.getMonth() === today.getMonth() &&
      calendarMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === currentDate.getDate() &&
      calendarMonth.getMonth() === currentDate.getMonth() &&
      calendarMonth.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Patient Information */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 mb-4">PATIENT INFORMATION</h2>
        <div className="space-y-3">
          <div>
            <div className="font-semibold text-gray-900">{selectedPatient.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              DOB: {selectedPatient.dob} ({selectedPatient.age} years old)
            </div>
          </div>
          {selectedPatient.alerts.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Medical Alerts
              </div>
              <div className="space-y-1">
                {selectedPatient.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="text-sm px-3 py-1.5 bg-red-50 text-red-700 rounded border border-red-200"
                  >
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <button onClick={handlePreviousMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const today = isToday(day);
            const selected = isSelected(day);
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded transition-colors
                  ${selected ? 'bg-blue-600 text-white font-medium' : ''}
                  ${today && !selected ? 'bg-blue-50 text-blue-600 font-medium' : ''}
                  ${!selected && !today ? 'hover:bg-gray-100 text-gray-700' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
