// NewTaskModal — create a task from a message.
// Accessible modal with ESC to close, focus trap, Navy/Red button.
// Props: source message + members list for assignee select.

import { useState, useEffect, useRef } from 'react';
import { X, ClipboardList } from 'lucide-react';
import type { Message, MessagingMember, TaskPriority } from '../../types/messaging';

interface NewTaskModalProps {
  message: Message | null;
  members: MessagingMember[];
  onConfirm: (params: {
    title: string;
    assigneeId: string;
    priority: TaskPriority;
    dueAt: string | null;
    messageId: string;
  }) => Promise<void>;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; dot: string }[] = [
  { value: 'urgent', label: 'Urgent',  dot: 'bg-red-500' },
  { value: 'normal', label: 'Normal',  dot: 'bg-yellow-400' },
  { value: 'low',    label: 'Low',     dot: 'bg-blue-400' },
];

const ROLE_COLOR: Record<string, string> = {
  admin: 'bg-[#0B3A70]', dentist: 'bg-blue-500',
  hygienist: 'bg-green-600', front_desk: 'bg-purple-600',
};

export function NewTaskModal({ message, members, onConfirm, onClose }: NewTaskModalProps) {
  const [title,      setTitle]      = useState('');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? '');
  const [priority,   setPriority]   = useState<TaskPriority>('normal');
  const [dueAt,      setDueAt]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const titleRef                    = useRef<HTMLInputElement>(null);

  // Pre-fill title from message
  useEffect(() => {
    if (message) {
      setTitle(message.body.slice(0, 80));
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [message]);

  // ESC closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!message) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;
    setSaving(true);
    try {
      await onConfirm({
        title:      title.trim(),
        assigneeId,
        priority,
        dueAt:      dueAt || null,
        messageId:  message.id,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0B3A70]" />
            <h2 id="task-modal-title" className="text-base font-semibold text-slate-900">
              Create Task
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source message preview */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">From message:</p>
          <p className="text-sm text-slate-700 line-clamp-2">{message.body}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">
              Task title
            </label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         text-slate-900 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-700">
              Assign to
            </label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         text-slate-900 bg-white
                         focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.role.replace('_',' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-700">Priority</p>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    priority === opt.value
                      ? 'border-[#0B3A70] bg-[#0B3A70]/5 text-[#0B3A70]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="task-due" className="block text-sm font-medium text-slate-700">
              Due date <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="task-due"
              type="date"
              value={dueAt}
              onChange={e => setDueAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         text-slate-900 bg-white
                         focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium
                         text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm
                         bg-[#0B3A70] hover:bg-[#A60F2D] transition-colors duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {saving
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating...</>
                : 'Create Task'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export { ROLE_COLOR };
