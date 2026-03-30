// TaskCard — single task row in the TaskPanel.
// Shows priority dot, title, assignee initials, due date, and a done toggle.

import type { MessageTask, MessagingMember } from '../../types/messaging';

interface TaskCardProps {
  task: MessageTask;
  members: MessagingMember[];
  onToggle: (taskId: string) => void;
}

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  normal: 'bg-yellow-400',
  low:    'bg-blue-400',
};

const ROLE_COLOR: Record<string, string> = {
  admin:      'bg-[#0B3A70]',
  dentist:    'bg-blue-500',
  hygienist:  'bg-green-600',
  front_desk: 'bg-purple-600',
};

export function TaskCard({ task, members, onToggle }: TaskCardProps) {
  const assignee = members.find(m => m.id === task.assigneeId);
  const isDone   = task.status === 'done';

  const dueLabel = task.dueAt
    ? new Date(task.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isDone ? 'opacity-50' : 'hover:bg-slate-50'}`}>

      {/* Done toggle */}
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={isDone ? 'Mark as open' : 'Mark as done'}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isDone
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-slate-300 hover:border-[#0B3A70]'
        }`}
      >
        {isDone && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-current stroke-[1.5]">
            <polyline points="1,4 4,7 9,1" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {/* Priority dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
          <p className={`text-sm font-medium text-slate-900 truncate ${isDone ? 'line-through' : ''}`}>
            {task.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Assignee */}
          {assignee && (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${ROLE_COLOR[assignee.role] ?? 'bg-slate-500'}`}>
              {assignee.firstName[0]}{assignee.lastName[0]}
            </div>
          )}
          {assignee && (
            <span className="text-xs text-slate-500 truncate">
              {assignee.firstName} {assignee.lastName}
            </span>
          )}
          {dueLabel && (
            <span className="text-xs text-slate-400 ml-auto flex-shrink-0">{dueLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}
