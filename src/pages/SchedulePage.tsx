// Schedule Page — the main dental scheduling view (previously in App.tsx)

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CalendarHeader } from '../components/CalendarHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { AppointmentModal } from '../components/AppointmentModal';
import { TimeSettingsModal } from '../components/TimeSettingsModal';
import type { Appointment, Provider } from '../App';

export default function SchedulePage() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [timeRange, setTimeRange] = useState({ start: 7, end: 20 });

  const [providers, setProviders] = useState<Provider[]>([
    { id: '1', name: 'Dr. Sarah Chen',      operatory: 'Operatory 1', color: '#3B82F6' },
    { id: '2', name: 'Dr. Michael Torres',  operatory: 'Operatory 2', color: '#10B981' },
    { id: '3', name: 'Dr. Emily White',     operatory: 'Operatory 3', color: '#8B5CF6' },
    { id: '4', name: 'Dr. James Park',      operatory: 'Operatory 4', color: '#F59E0B' },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', patientName: 'John Smith',    procedure: 'Crown Preparation',       providerId: '1', startTime: '09:00', endTime: '10:30', notes: 'Patient prefers local anesthesia' },
    { id: '2', patientName: 'Emma Johnson',  procedure: 'Routine Cleaning',         providerId: '1', startTime: '11:00', endTime: '12:00' },
    { id: '3', patientName: 'Michael Brown', procedure: 'Root Canal',               providerId: '2', startTime: '08:00', endTime: '09:30', notes: 'Follow-up appointment' },
    { id: '4', patientName: 'Sophia Davis',  procedure: 'Teeth Whitening',          providerId: '2', startTime: '14:00', endTime: '15:00' },
    { id: '5', patientName: 'Oliver Wilson', procedure: 'Dental Implant',           providerId: '3', startTime: '10:00', endTime: '12:00', notes: 'Surgical procedure - requires assistant' },
    { id: '6', patientName: 'Ava Martinez',  procedure: 'Orthodontic Consultation', providerId: '4', startTime: '13:00', endTime: '13:45' },
    { id: '7', patientName: 'William Garcia',procedure: 'Filling (2 cavities)',     providerId: '3', startTime: '15:30', endTime: '16:30' },
  ]);

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleUpdateProvider = (id: string, updates: Partial<Provider>) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setSelectedAppointment(null);
  };

  const handleUpdateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar currentDate={currentDate} onDateChange={setCurrentDate} />

      <div className="flex-1 flex flex-col">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onOpenTimeSettings={() => setShowTimeSettings(true)}
        />
        <CalendarGrid
          providers={providers}
          appointments={appointments}
          timeRange={timeRange}
          onAppointmentClick={setSelectedAppointment}
          onProviderUpdate={handleUpdateProvider}
        />
      </div>

      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          provider={providers.find(p => p.id === selectedAppointment.providerId)}
          onClose={() => setSelectedAppointment(null)}
          onDelete={handleDeleteAppointment}
          onUpdate={handleUpdateAppointment}
        />
      )}

      {showTimeSettings && (
        <TimeSettingsModal
          timeRange={timeRange}
          onClose={() => setShowTimeSettings(false)}
          onSave={setTimeRange}
        />
      )}
    </div>
  );
}
