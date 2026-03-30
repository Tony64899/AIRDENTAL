// TaskPanel — right panel showing tasks for the active channel.
// Grouped by status: Urgent open, Normal open, In Progress, Done.
// "+ Create Task" opens NewTaskModal with no source message (standalone).

import { useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { NewTaskModal } from './NewTaskModal';
import { useMessaging } from '../../contexts/MessagingContext';
import type { MessageTask, TaskStatus } from '../../types/messaging';

const STATUS_ORDER: TaskStatus[] = ['open', 'in_progress', 'done'];

const STATUS_LABELS: Record<TaskStatus, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  done:        'Done',
};

const STATUS_DOT: Record<TaskStatus, string> = {
  open:        'bg-red-400',
  in_progress: 'bg-yellow-400',
  done:        'bg-green-500',
};

export function TaskPanel() {
  const { state, createTask, updateTaskStatus } = useMessaging();
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const channelId = state.activeChannelId;
  const tasks     = channelId
    ? state.tasks.filter(t => t.channelId === channelId)
    : state.tasks;

  // Grouped tasks by status
  const grouped = STATUS_ORDER.reduce<Record<TaskStatus, MessageTask[]>>((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, { open: [], in_progress: [], done: [] });

  const handleToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const nextStatus: TaskStatus = task.status === 'done' ? 'open' : 'done';
    await updateTaskStatus(taskId, nextStatus);
  };

  // Standalone task (not from a message) uses a placeholder message ID
  const STANDALONE_MSG_ID = '__standalone__';

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-l border-slate-200 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#0B3A70]" />
          <h3 className="text-sm font-semibold text-slate-900">Tasks</h3>
          {tasks.filter(t => t.status !== 'done').length > 0 && (
            <span className="bg-[#0B3A70] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {tasks.filter(t => t.status !== 'done').length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setNewTaskOpen(true)}
          disabled={!channelId}
          aria-label="Create task"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                     text-[#0B3A70] bg-[#0B3A70]/10 hover:bg-[#0B3A70]/20 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
            <ClipboardList className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No tasks yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Hover over a message and click "Task" to create one.
            </p>
          </div>
        ) : (
          STATUS_ORDER.map(status => {
            const group = grouped[status];
            if (group.length === 0) return null;
            return (
              <div key={status} className="px-2 py-3">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {STATUS_LABELS[status]} · {group.length}
                  </p>
                </div>
                <div className="space-y-0.5">
                  {group.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={state.members}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Standalone New Task Modal (no source message) */}
      {newTaskOpen && channelId && (
        <NewTaskModal
          message={{
            id:           STANDALONE_MSG_ID,
            channelId:    channelId,
            senderId:     '',
            body:         '',
            sentAt:       new Date().toISOString(),
            readBy:       [],
            phiSuspected: false,
            isUrgent:     false,
            patientRef:   null,
            taskId:       null,
          }}
          members={state.members}
          onConfirm={async params => {
            await createTask(params);
          }}
          onClose={() => setNewTaskOpen(false)}
        />
      )}
    </aside>
  );
}
