import { useState } from 'react';
import { X, Trash2, Edit2, Save } from 'lucide-react';
import type { Appointment, Provider } from '../App';

interface AppointmentModalProps {
  appointment: Appointment;
  provider?: Provider;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Appointment>) => void;
}

export function AppointmentModal({ appointment, provider, onClose, onDelete, onUpdate }: AppointmentModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(appointment.notes ?? '');

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleSave = () => {
    onUpdate(appointment.id, { notes: editedNotes });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      onDelete(appointment.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Appointment Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Patient Name</label>
            <div className="font-semibold text-gray-900">{appointment.patientName}</div>
          </div>

          {provider && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Provider</label>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: provider.color }} />
                <div className="font-medium text-gray-900">{provider.name}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">{provider.operatory}</div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Procedure</label>
            <div className="text-gray-900">{appointment.procedure}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Time</label>
            <div className="text-gray-900">
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-500">Notes</label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Add notes..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditedNotes(appointment.notes ?? ''); }}
                    className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[60px]">
                {appointment.notes ?? <span className="text-gray-400 italic">No notes</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Appointment
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
