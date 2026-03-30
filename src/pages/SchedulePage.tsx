// SchedulePage — main appointment scheduling view.
// Phase 3+: useSchedule hook, AddAppointmentModal, status workflow,
//            privacy mode, drag-to-move, column reorder, patient sidebar.
// ⚠️ HIPAA: Privacy Mode is UI-only — PHI stays in memory, audit logging still applies.

import { useState, useEffect } from 'react';
import { Plus }                 from 'lucide-react';

import { useSchedule }         from '../hooks/useSchedule';
import { ScheduleSidebar }     from '../components/schedule/ScheduleSidebar';
import { CalendarHeader }      from '../components/schedule/CalendarHeader';
import { CalendarGrid }        from '../components/schedule/CalendarGrid';
import { AppointmentModal }    from '../components/schedule/AppointmentModal';
import { AddAppointmentModal } from '../components/schedule/AddAppointmentModal';
import { TimeSettingsModal }   from '../components/schedule/TimeSettingsModal';
import { Alert }               from '../components/ui/Alert';
import { toISODate }           from '../utils/dateUtils';
import type { Appointment }    from '../types/appointment';
import type { Provider }       from '../types/provider';

export default function SchedulePage() {
  // ── View / navigation state ───────────────────────────────────────────
  const [view,        setView]        = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeRange,   setTimeRange]   = useState({ start: 7, end: 20 });

  // ── Modal state ───────────────────────────────────────────────────────
  const [selectedAppointment,  setSelectedAppointment]  = useState<Appointment | null>(null);
  const [sidebarAppointment,   setSidebarAppointment]   = useState<Appointment | null>(null);
  const [showAddModal,         setShowAddModal]          = useState(false);
  const [showTimeSettings,     setShowTimeSettings]      = useState(false);

  // ── Privacy Mode ──────────────────────────────────────────────────────
  // ⚠️ HIPAA: Privacy Mode hides PHI on screen only — data still in memory.
  //            Intended for patient-facing display situations.
  const [privacyMode, setPrivacyMode] = useState(false);

  // Press 'P' to toggle Privacy Mode (keyboard shortcut)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'p' && e.key !== 'P') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      setPrivacyMode(prev => !prev);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // ── Data — powered by useSchedule hook ────────────────────────────────
  const {
    appointments,
    providers,
    loadState,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    updateProvider,
    addProvider,
    reorderProvider,
  } = useSchedule(currentDate);

  // ── Date navigation ───────────────────────────────────────────────────
  const handlePreviousDay = () => setCurrentDate(prev => {
    const d = new Date(prev); d.setDate(d.getDate() - 1); return d;
  });
  const handleNextDay = () => setCurrentDate(prev => {
    const d = new Date(prev); d.setDate(d.getDate() + 1); return d;
  });

  // ── Appointment CRUD handlers ─────────────────────────────────────────
  const handleAdd = async (data: Omit<Appointment, 'id'>) => {
    await addAppointment(data);
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
    setSelectedAppointment(null);
    // Also clear sidebar if it was showing that appointment
    setSidebarAppointment(prev => prev?.id === id ? null : prev);
  };

  const handleUpdate = async (id: string, updates: Partial<Appointment>) => {
    await updateAppointment(id, updates);
    setSelectedAppointment(prev => prev?.id === id ? { ...prev, ...updates } : prev);
    setSidebarAppointment(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  };

  // ── Provider handlers ─────────────────────────────────────────────────
  const handleAddOperatory = () => {
    addProvider({
      id:          `prov-${Date.now()}`,
      name:        'Doctor',
      operatory:   `Operatory ${providers.length + 1}`,
      specialty:   'General Dentistry',
      clinicId:    'clinic-1',
      locationId:  'loc-1',
    } satisfies Provider);
    setShowTimeSettings(false);
  };

  const isLoading = loadState === 'idle' || loadState === 'loading';

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Error banner */}
      {error && (
        <div className="px-6 pt-3">
          <Alert variant="error" title="Failed to load schedule">{error}</Alert>
        </div>
      )}

      {/* Page header: date nav + privacy toggle + Day/Week + settings */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        privacyMode={privacyMode}
        onViewChange={setView}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onOpenTimeSettings={() => setShowTimeSettings(true)}
        onTogglePrivacyMode={() => setPrivacyMode(prev => !prev)}
      />

      {/* Main body: sidebar + calendar grid */}
      <div className="flex flex-1 overflow-hidden">
        <ScheduleSidebar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          selectedAppointment={sidebarAppointment}
        />
        <CalendarGrid
          providers={providers}
          appointments={appointments}
          timeRange={timeRange}
          currentDate={toISODate(currentDate)}
          privacyMode={privacyMode}
          onAppointmentSingleClick={setSidebarAppointment}
          onAppointmentDoubleClick={setSelectedAppointment}
          onAppointmentUpdate={handleUpdate}
          onProviderUpdate={updateProvider}
          onReorderProvider={reorderProvider}
          onOpenTimeSettings={() => setShowTimeSettings(true)}
        />
      </div>

      {/* ── Floating "New Appointment" button ── */}
      <button
        onClick={() => setShowAddModal(true)}
        disabled={isLoading}
        className="
          fixed bottom-6 right-6 z-40
          flex items-center gap-2
          bg-[#0891b2] hover:bg-[#0e7490] active:bg-[#155e75]
          disabled:opacity-50 disabled:cursor-not-allowed
          text-white font-medium text-sm
          px-4 py-3 rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-150
        "
        aria-label="Add new appointment"
      >
        <Plus size={18} />
        New Appointment
      </button>

      {/* ── Modals ── */}

      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          provider={providers.find(p => p.id === selectedAppointment.providerId)}
          onClose={() => setSelectedAppointment(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

      {showAddModal && (
        <AddAppointmentModal
          providers={providers}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

      {showTimeSettings && (
        <TimeSettingsModal
          timeRange={timeRange}
          onClose={() => setShowTimeSettings(false)}
          onSave={setTimeRange}
          onAddOperatory={handleAddOperatory}
        />
      )}
    </div>
  );
}
