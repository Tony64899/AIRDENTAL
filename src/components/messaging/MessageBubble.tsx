// MessageBubble — individual message in the thread.
// Own messages: right-aligned Navy. Others: left-aligned slate.
// PHI suspected: amber left border + AlertTriangle.
// Hover: ghost "Create Task" button appears.
// Urgent: red ⚡ badge on bubble.

import { useState } from 'react';
import { AlertTriangle, ClipboardList, Zap, ExternalLink } from 'lucide-react';
import type { Message, MessagingMember } from '../../types/messaging';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender: MessagingMember | undefined;
  onCreateTask: (msg: Message) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function MessageBubble({ message, isOwn, sender, onCreateTask }: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false);

  const senderName = sender
    ? `${sender.firstName} ${sender.lastName}`
    : 'Unknown';

  const roleColor: Record<string, string> = {
    admin:      'bg-[#0B3A70]',
    dentist:    'bg-blue-500',
    hygienist:  'bg-green-600',
    front_desk: 'bg-purple-600',
  };
  const avatarBg = sender ? (roleColor[sender.role] ?? 'bg-slate-500') : 'bg-slate-500';

  return (
    <div
      className={`flex gap-2.5 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar (others only) */}
      {!isOwn && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1 ${avatarBg}`}>
          {sender ? `${sender.firstName[0]}${sender.lastName[0]}` : '?'}
        </div>
      )}

      <div className={`flex flex-col max-w-[68%] ${isOwn ? 'items-end' : 'items-start'}`}>

        {/* Sender name + time (others) */}
        {!isOwn && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-700">{senderName}</span>
            <span className="text-xs text-slate-400">{formatTime(message.sentAt)}</span>
          </div>
        )}

        <div className="relative">
          {/* PHI border */}
          <div className={`${message.phiSuspected ? 'border-l-4 border-amber-400 pl-2' : ''}`}>
            <div
              className={`px-4 py-2.5 text-sm leading-relaxed ${
                isOwn
                  ? 'bg-[#0B3A70] text-white rounded-2xl rounded-tr-sm'
                  : 'bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm'
              }`}
            >
              {/* Urgent badge */}
              {message.isUrgent && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full mr-2">
                  <Zap className="w-2.5 h-2.5" />URGENT
                </span>
              )}

              {message.body}

              {/* Patient ref chip */}
              {message.patientRef && (
                <a
                  href={message.patientRef.chartPath}
                  className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium underline-offset-2 hover:underline ${
                    isOwn ? 'bg-white/20 text-white' : 'bg-[#0B3A70]/10 text-[#0B3A70]'
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  {message.patientRef.displayName}
                </a>
              )}
            </div>
          </div>

          {/* PHI warning badge */}
          {message.phiSuspected && (
            <div className="flex items-center gap-1 mt-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px] font-medium">Possible PHI detected</span>
            </div>
          )}

          {/* Task badge on bubble */}
          {message.taskId && (
            <div className="flex items-center gap-1 mt-1">
              <ClipboardList className={`w-3 h-3 ${isOwn ? 'text-blue-300' : 'text-slate-400'}`} />
              <span className="text-[10px] text-slate-400">Task created</span>
            </div>
          )}
        </div>

        {/* Own message: time below */}
        {isOwn && (
          <span className="text-[10px] text-slate-400 mt-1 mr-1">{formatTime(message.sentAt)}</span>
        )}
      </div>

      {/* Hover actions */}
      {hovered && !message.taskId && (
        <div className={`flex items-center self-center ${isOwn ? 'mr-2' : 'ml-2'}`}>
          <button
            type="button"
            onClick={() => onCreateTask(message)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Task
          </button>
        </div>
      )}
    </div>
  );
}
