// ⚠️ HIPAA: Messaging types — no PHI stored in messages directly
// Patient references use IDs + display-only names, never SSN, DOB, or policy numbers.

import type { UserRole } from './auth';

export type ChannelId = string;
export type OnlineStatus = 'online' | 'away' | 'offline';
export type TaskPriority = 'urgent' | 'normal' | 'low';
export type TaskStatus = 'open' | 'in_progress' | 'done';

// ── Members ──────────────────────────────────────────────────────────────────
export interface MessagingMember {
  id: string;           // matches auth User.id (u-1 … u-7)
  firstName: string;
  lastName: string;
  role: UserRole;
  status: OnlineStatus;
  lastSeen: string | null;
}

// ── Patient reference (display-only, never stored in URL) ────────────────────
export interface PatientRef {
  patientId: string;
  displayName: string;  // shown in bubble only
  chartPath: string;    // e.g. /patients/p-1
}

// ── Tasks created from messages ───────────────────────────────────────────────
export interface MessageTask {
  id: string;
  title: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string | null;
  createdAt: string;
  messageId: string;    // source message that spawned this task
  channelId: ChannelId;
}

// ── Individual message ────────────────────────────────────────────────────────
export interface Message {
  id: string;
  channelId: ChannelId;
  senderId: string;
  body: string;
  sentAt: string;
  readBy: string[];       // array of user IDs who have read this
  phiSuspected: boolean;  // set by containsPhi() at send time
  isUrgent: boolean;
  patientRef: PatientRef | null;
  taskId: string | null;  // populated after task creation
}

// ── Channel (named channel or DM) ─────────────────────────────────────────────
export interface Channel {
  id: ChannelId;
  type: 'channel' | 'dm';
  name: string;             // '#general' | 'dm:u-1:u-2' etc.
  displayName: string;      // human-readable label
  description: string;
  memberIds: string[];
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

// ── Global messaging state (reducer) ─────────────────────────────────────────
export interface MessagingState {
  channels: Channel[];
  messages: Record<ChannelId, Message[]>;
  tasks: MessageTask[];
  members: MessagingMember[];
  activeChannelId: ChannelId | null;
  isTaskPanelOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

// ── Reducer actions ───────────────────────────────────────────────────────────
export type MessagingAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { channels: Channel[]; members: MessagingMember[] } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SELECT_CHANNEL'; payload: { channelId: ChannelId; userId: string } }
  | { type: 'MESSAGES_LOADED'; payload: { channelId: ChannelId; messages: Message[]; userId: string } }
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'RECEIVE_MESSAGE'; payload: Message }
  | { type: 'CREATE_TASK'; payload: MessageTask }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: TaskStatus } }
  | { type: 'TOGGLE_TASK_PANEL' }
  | { type: 'RESET' };
