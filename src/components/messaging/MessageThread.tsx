// MessageThread — center panel: message list + compose bar.
// Auto-scrolls to bottom on new messages via lastMessageRef.
// Shows date separators between messages from different days.
// Empty state when no channel selected or no messages yet.

import { useEffect, useRef, useState, useCallback } from 'react';
import { Hash, MessageCircle, PanelRightClose, PanelRightOpen, Lock } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ComposeBar } from './ComposeBar';
import { NewTaskModal } from './NewTaskModal';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../hooks/useAuth';
import type { Message } from '../../types/messaging';

function formatDateSeparator(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function MessageThread() {
  const { state, sendMessage, createTask, toggleTaskPanel } = useMessaging();
  const { state: authState } = useAuth();
  const currentUserId = authState.user?.id ?? '';

  const [taskSourceMsg, setTaskSourceMsg] = useState<Message | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const activeChannel = state.channels.find(c => c.id === state.activeChannelId);
  const messages      = state.activeChannelId ? (state.messages[state.activeChannelId] ?? []) : [];

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(async (
    body: string, opts?: { isUrgent?: boolean },
  ) => {
    await sendMessage(body, opts);
  }, [sendMessage]);

  const handleCreateTask = useCallback(async (params: {
    title: string; assigneeId: string; priority: Message['phiSuspected'] extends boolean ? any : any;
    dueAt: string | null; messageId: string;
  }) => {
    await createTask(params);
  }, [createTask]);

  // Empty state — no channel selected
  if (!activeChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-[#0B3A70]/10 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-[#0B3A70]" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Welcome to Messages</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Select a channel or direct message from the sidebar to start collaborating with your team.
        </p>
      </div>
    );
  }

  const isChannel = activeChannel.type === 'channel';
  const isLoading = state.isLoading && messages.length === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">

      {/* Thread header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {activeChannel.id === 'ch-urgent'
            ? <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />
            : isChannel
              ? <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
              : null
          }
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">
              {activeChannel.displayName}
            </h2>
            {activeChannel.description && (
              <p className="text-xs text-slate-500 truncate">{activeChannel.description}</p>
            )}
          </div>
        </div>

        {/* Task panel toggle */}
        <button
          type="button"
          onClick={toggleTaskPanel}
          aria-label={state.isTaskPanelOpen ? 'Close task panel' : 'Open task panel'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          {state.isTaskPanelOpen
            ? <PanelRightClose className="w-4 h-4" />
            : <PanelRightOpen className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {isLoading ? (
          // Skeleton
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex gap-3 ${i % 2 ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="space-y-2 max-w-xs">
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-10 bg-slate-200 rounded-2xl" style={{ width: `${160 + i*30}px` }} />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Hash className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              No messages yet in {activeChannel.displayName}
            </p>
            <p className="text-xs text-slate-400 mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const showDateSep = !prevMsg || !isSameDay(prevMsg.sentAt, msg.sentAt);
            const sender = state.members.find(m => m.id === msg.senderId);

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDateSeparator(msg.sentAt)}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                )}
                <div className="py-0.5">
                  <MessageBubble
                    message={msg}
                    isOwn={msg.senderId === currentUserId}
                    sender={sender}
                    onCreateTask={setTaskSourceMsg}
                  />
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose bar */}
      <ComposeBar
        channelName={activeChannel.displayName}
        disabled={state.isLoading}
        onSend={handleSend}
      />

      {/* New Task Modal */}
      <NewTaskModal
        message={taskSourceMsg}
        members={state.members}
        onConfirm={handleCreateTask}
        onClose={() => setTaskSourceMsg(null)}
      />
    </div>
  );
}
