// AppointmentModal — detail view, status workflow, and notes editing for a selected appointment.
// Phase 3: adds status progression buttons (scheduled → confirmed → arrived → in_chair → completed).
// Uses ConfirmModal instead of window.confirm(). ⚠️ HIPAA: no PHI in console.log.

import { useState } from 'react';
import { Edit2, Save, Trash2, ChevronRight } from 'lucide-react';
import { formatTime } from '../../utils/dateUtils';
import { Modal, ConfirmModal } from '../ui/Modal';
import { AppointmentStatusBadge } from '../ui/Badge';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import type { Provider }    from '../../types/provider';

interface AppointmentModalProps {
  appointment: Appointment;
  provider?:   Provider;
  onClose:     () => void;
  onDelete:    (id: string) => void;
  onUpdate:    (id: string, updates: Partial<Appointment>) => void;
}

// --- Status workflow ---
// Maps each status to the single most-likely next step in the dental office workflow.
// The front desk / assistant clicks ONE button to advance the appointment.
const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  scheduled:  'confirmed',
  confirmed:  'arrived',
  arrived:    'in_chair',
  in_chair:   'completed',
};

const NEXT_ACTION_LABEL: Partial<Record<AppointmentStatus, string>> = {
  scheduled:  'Confirm Appointment',
  confirmed:  'Patient Arrived',
  arrived:    'Seat Patient',
  in_chair:   'Mark Complete',
};

export function AppointmentModal({
  appointment, provider, onClose, onDelete, onUpdate,
}: AppointmentModalProps) {
  const [isEditing,        setIsEditing]        = useState(false);
  const [editedNotes,      setEditedNotes]      = useState(appointment.notes ?? '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Track current status locally so the badge updates immediately
  const [currentStatus,   setCurrentStatus]    = useState<AppointmentStatus>(
    appointment.status ?? 'scheduled',
  );

  const handleSaveNotes = () => {
    onUpdate(appointment.id, { notes: editedNotes });
    setIsEditing(false);
  };

  const handleStatusAdvance = () => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setCurrentStatus(next);
    onUpdate(appointment.id, { status: next });
  };

  const handleMarkNoShow = () => {
    setCurrentStatus('no_show');
    onUpdate(appointment.id, { status: 'no_show' });
  };

  const handleMarkCancelled = () => {
    setCurrentStatus('cancelled');
    onUpdate(appointment.id, { status: 'cancelled' });
  };

  const handleDeleteConfirmed = () => {
    setShowDeleteConfirm(false);
    onDelete(appointment.id);
  };

  const nextAction = NEXT_ACTION_LABEL[currentStatus];
  const isTerminal = currentStatus === 'completed'
    || currentStatus === 'no_show'
    || currentStatus === 'cancelled';

  return (
    <>
      <Modal isOpen title="Appointment Details" onClose={onClose} size="md">
        <div className="p-6 space-y-5">

          {/* Patient */}
          <div>
            <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-1">
              Patient
            </label>
            <div className="font-semibold text-[#0f172a]">{appointment.patientName}</div>
          </div>

          {/* Provider */}
          {provider && (
            <div>
              <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-1">
                Provider
              </label>
              <div className="font-medium text-[#0f172a]">{provider.name}</div>
              <div className="text-sm text-[#64748b] mt-0.5">{provider.operatory}</div>
            </div>
          )}

          {/* Procedure */}
          <div>
            <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-1">
              Procedure
            </label>
            <div className="text-[#0f172a]">{appointment.procedure}</div>
          </div>

          {/* Time */}
          <div>
            <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-1">
              Time
            </label>
            <div className="text-[#0f172a]">
              {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
            </div>
          </div>

          {/* Status + workflow ─────────────────────────────── */}
          <div>
            <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest block mb-2">
              Status
            </label>

            <div className="flex items-center gap-3 flex-wrap">
              <AppointmentStatusBadge status={currentStatus} />

              {/* Primary next-step CTA */}
              {nextAction && !isTerminal && (
                <button
                  onClick={handleStatusAdvance}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {nextAction}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Secondary actions — no-show / cancel — only when appointment is still active */}
            {!isTerminal && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleMarkNoShow}
                  className="text-xs text-[#dc2626] hover:text-[#b91c1c] font-medium transition-colors"
                >
                  No Show
                </button>
                <span className="text-[#e2e8f0]">·</span>
                <button
                  onClick={handleMarkCancelled}
                  className="text-xs text-[#64748b] hover:text-[#475569] font-medium transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            )}
          </div>

          {/* Notes — editable ─────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">
                Notes
              </label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-[#0891b2] hover:text-[#0e7490] transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedNotes}
                  onChange={e => setEditedNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] resize-none"
                  rows={4}
                  placeholder="Add notes…"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] transition-colors text-sm font-medium"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditedNotes(appointment.notes ?? ''); }}
                    className="px-3 py-1.5 text-[#475569] hover:bg-[#f1f5f9] rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#0f172a] bg-[#f8fafc] px-3 py-2.5 rounded-lg min-h-[60px]">
                {appointment.notes
                  ? appointment.notes
                  : <span className="text-[#94a3b8] italic">No notes</span>
                }
              </div>
            )}
          </div>

        </div>{/* /body */}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(0,0,0,0.06)] bg-[#f8fafc] rounded-b-xl">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment? This cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
