// ⚠️ HIPAA: Mock messaging service — all data in-memory only, no localStorage.
// Mirrors authService.ts pattern: module-scoped state, async with delay(), audit log.
// subscribe() uses recursive setTimeout so the interval is variable (6–14 s).
// Designed to drop-in replace with WebSocket in a backend phase.

import type {
  Channel, Message, MessageTask, MessagingMember,
  OnlineStatus, TaskPriority, TaskStatus, PatientRef,
} from '../types/messaging';
import { containsPhi } from '../utils/phiDetector';

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function minsAgo(n: number) {
  return new Date(Date.now() - n * 60_000).toISOString();
}

// ── Seed members (mirror auth MOCK_USERS + mockStaff ids) ────────────────────
const SEED_MEMBERS: MessagingMember[] = [
  { id: 'u-1', firstName: 'Sarah',   lastName: 'Chen',    role: 'admin',      status: 'online',  lastSeen: null },
  { id: 'u-2', firstName: 'Michael', lastName: 'Torres',  role: 'dentist',    status: 'online',  lastSeen: null },
  { id: 'u-3', firstName: 'Emily',   lastName: 'White',   role: 'hygienist',  status: 'away',    lastSeen: minsAgo(8) },
  { id: 'u-4', firstName: 'James',   lastName: 'Park',    role: 'front_desk', status: 'online',  lastSeen: null },
  { id: 'u-5', firstName: 'Priya',   lastName: 'Patel',   role: 'dentist',    status: 'online',  lastSeen: null },
  { id: 'u-6', firstName: 'Carlos',  lastName: 'Rivera',  role: 'dentist',    status: 'offline', lastSeen: minsAgo(45) },
  { id: 'u-7', firstName: 'Sophia',  lastName: 'Adams',   role: 'front_desk', status: 'away',    lastSeen: minsAgo(15) },
];

// ── Seed channels ─────────────────────────────────────────────────────────────
const ALL_IDS = SEED_MEMBERS.map(m => m.id);
const CLINICAL_IDS = SEED_MEMBERS.filter(m =>
  ['admin','dentist','hygienist'].includes(m.role)).map(m => m.id);
const FRONTDESK_IDS = SEED_MEMBERS.filter(m =>
  ['admin','front_desk'].includes(m.role)).map(m => m.id);

const SEED_CHANNELS: Channel[] = [
  {
    id: 'ch-general',
    type: 'channel',
    name: '#general',
    displayName: 'general',
    description: 'Team-wide announcements and general chat',
    memberIds: ALL_IDS,
    lastMessageAt: minsAgo(5),
    lastMessagePreview: '오늘 마지막 환자 5시예요 — 모두 감사해요!',
    unreadCount: 3,
  },
  {
    id: 'ch-front-desk',
    type: 'channel',
    name: '#front-desk',
    displayName: 'front-desk',
    description: 'Scheduling, check-in, insurance',
    memberIds: FRONTDESK_IDS,
    lastMessageAt: minsAgo(12),
    lastMessagePreview: 'Insurance pre-auth 승인됐어요',
    unreadCount: 0,
  },
  {
    id: 'ch-clinical',
    type: 'channel',
    name: '#clinical',
    displayName: 'clinical',
    description: 'Clinical team — procedures, supplies, rooms',
    memberIds: CLINICAL_IDS,
    lastMessageAt: minsAgo(20),
    lastMessagePreview: 'Autoclave cycle 완료 — Room 2 ready',
    unreadCount: 1,
  },
  {
    id: 'ch-urgent',
    type: 'channel',
    name: '#urgent',
    displayName: 'urgent',
    description: '🔴 Time-sensitive items only',
    memberIds: ALL_IDS,
    lastMessageAt: minsAgo(65),
    lastMessagePreview: 'Suction unit 3번 방 작동 안 해요',
    unreadCount: 0,
  },
  {
    id: 'dm-u1-u2',
    type: 'dm',
    name: 'dm:u-1:u-2',
    displayName: 'Michael Torres',
    description: '',
    memberIds: ['u-1', 'u-2'],
    lastMessageAt: minsAgo(30),
    lastMessagePreview: '내일 스케줄 확인 부탁드려요',
    unreadCount: 2,
  },
];

// ── Seed messages per channel ─────────────────────────────────────────────────
const SEED_MESSAGES: Record<string, Message[]> = {
  'ch-general': [
    {
      id: uid(), channelId: 'ch-general', senderId: 'u-4',
      body: '안녕하세요 팀! 오늘 하루도 잘 부탁드려요 🦷',
      sentAt: minsAgo(60), readBy: ALL_IDS, phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
    {
      id: uid(), channelId: 'ch-general', senderId: 'u-2',
      body: 'Prophy paste 재고 부탁해요 — 민트 맛 떨어졌어요',
      sentAt: minsAgo(25), readBy: ['u-2','u-1','u-4'], phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
    {
      id: uid(), channelId: 'ch-general', senderId: 'u-1',
      body: '오늘 마지막 환자 5시예요 — 모두 감사해요!',
      sentAt: minsAgo(5), readBy: ['u-1'], phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
  ],
  'ch-front-desk': [
    {
      id: uid(), channelId: 'ch-front-desk', senderId: 'u-7',
      body: '3시 appointment — 환자분 지금 막 도착하셨어요',
      sentAt: minsAgo(40), readBy: FRONTDESK_IDS, phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
    {
      id: uid(), channelId: 'ch-front-desk', senderId: 'u-4',
      body: 'Insurance pre-auth 승인됐어요 👍',
      sentAt: minsAgo(12), readBy: FRONTDESK_IDS, phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
  ],
  'ch-clinical': [
    {
      id: uid(), channelId: 'ch-clinical', senderId: 'u-3',
      body: 'Room 3 setup 완료 — impression tray 준비됐어요',
      sentAt: minsAgo(45), readBy: CLINICAL_IDS, phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
    {
      id: uid(), channelId: 'ch-clinical', senderId: 'u-5',
      body: 'Autoclave cycle 완료 — Room 2 ready ✅',
      sentAt: minsAgo(20), readBy: ['u-5','u-2'], phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
  ],
  'ch-urgent': [
    {
      id: uid(), channelId: 'ch-urgent', senderId: 'u-3',
      body: 'Suction unit 3번 방 작동 안 해요 — 수리 필요해요',
      sentAt: minsAgo(65), readBy: ALL_IDS, phiSuspected: false,
      isUrgent: true, patientRef: null, taskId: null,
    },
  ],
  'dm-u1-u2': [
    {
      id: uid(), channelId: 'dm-u1-u2', senderId: 'u-2',
      body: '내일 오전 스케줄 확인 부탁드려요',
      sentAt: minsAgo(35), readBy: ['u-2'], phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
    {
      id: uid(), channelId: 'dm-u1-u2', senderId: 'u-1',
      body: '확인했어요! 9시부터 12시까지 3명 예약돼 있어요',
      sentAt: minsAgo(30), readBy: ['u-1'], phiSuspected: false,
      isUrgent: false, patientRef: null, taskId: null,
    },
  ],
};

// ── Module-scoped mutable state ───────────────────────────────────────────────
let _channels: Channel[]             = SEED_CHANNELS.map(c => ({ ...c }));
let _messages: Record<string, Message[]> = Object.fromEntries(
  Object.entries(SEED_MESSAGES).map(([k, v]) => [k, v.map(m => ({ ...m }))]),
);
let _tasks: MessageTask[]            = [];
let _members: MessagingMember[]      = SEED_MEMBERS.map(m => ({ ...m }));

// ── Audit log (HIPAA: metadata only, no message body) ─────────────────────────
interface AuditEntry { timestamp: string; action: string; userId: string; channelId?: string; }
const _auditLog: AuditEntry[] = [];
function audit(action: string, userId: string, channelId?: string) {
  _auditLog.push({ timestamp: now(), action, userId, channelId });
}

// ── Real-time subscription (WebSocket-ready) ──────────────────────────────────
export type MessageListener = (msg: Message) => void;
const _listeners = new Set<MessageListener>();
let _simTimer: ReturnType<typeof setTimeout> | null = null;

const BOT_MESSAGES = [
  'Room 3 환자 준비됐나요?',
  'impression tray 재고 확인 부탁드려요',
  '오늘 2시 appointment 컨펌됐나요?',
  'Autoclave sterilization cycle 완료됐어요 ✅',
  '다음 환자 보험 pre-auth 필요해요',
  'Suction tubing 교체 필요할 것 같아요',
  'X-ray sensor 3번 방에서 찾았어요',
  'New patient paperwork 준비됐어요',
  'Lab case 오늘 픽업 예정이에요',
  'Handpiece 3번 sterilization 완료됐어요',
  'Last patient for today just checked in',
  'Treatment room 2 disinfection 완료',
  '스케줄 변경 필요한 부분 있으면 알려주세요',
  '다음 주 supplies 주문 목록 공유해 드릴게요',
  'Break room 커피 다 떨어졌어요 ☕',
];

function pushSimulatedMessage() {
  if (_listeners.size === 0) { _simTimer = null; return; }

  const channels = _channels.filter(c => c.type === 'channel');
  const channel  = channels[Math.floor(Math.random() * channels.length)];
  const members  = _members.filter(m => channel.memberIds.includes(m.id) && m.id !== 'u-1');
  const sender   = members[Math.floor(Math.random() * members.length)];

  const msg: Message = {
    id:           uid(),
    channelId:    channel.id,
    senderId:     sender.id,
    body:         BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)],
    sentAt:       now(),
    readBy:       [sender.id],
    phiSuspected: false,
    isUrgent:     false,
    patientRef:   null,
    taskId:       null,
  };

  if (!_messages[channel.id]) _messages[channel.id] = [];
  _messages[channel.id] = [..._messages[channel.id], msg];

  const ch = _channels.find(c => c.id === channel.id);
  if (ch) {
    ch.lastMessageAt      = msg.sentAt;
    ch.lastMessagePreview = msg.body.slice(0, 60);
    ch.unreadCount        = (ch.unreadCount || 0) + 1;
  }

  _listeners.forEach(fn => fn(msg));

  // Schedule next tick with random delay
  const nextDelay = Math.floor(Math.random() * 8_000) + 6_000;
  _simTimer = setTimeout(pushSimulatedMessage, nextDelay);
}

export function subscribe(fn: MessageListener): () => void {
  _listeners.add(fn);
  if (_listeners.size === 1 && !_simTimer) {
    const initialDelay = Math.floor(Math.random() * 8_000) + 6_000;
    _simTimer = setTimeout(pushSimulatedMessage, initialDelay);
  }
  return () => {
    _listeners.delete(fn);
    if (_listeners.size === 0 && _simTimer) {
      clearTimeout(_simTimer);
      _simTimer = null;
    }
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getMembers(): Promise<MessagingMember[]> {
  await delay(100);
  return _members.map(m => ({ ...m }));
}

export async function getChannels(userId: string): Promise<Channel[]> {
  await delay(150);
  audit('get_channels', userId);
  return _channels
    .filter(c => c.memberIds.includes(userId))
    .map(c => ({ ...c }));
}

export async function getMessages(channelId: string, userId: string): Promise<Message[]> {
  await delay(200);
  audit('read_messages', userId, channelId);

  const msgs = (_messages[channelId] || []).map(m => {
    if (!m.readBy.includes(userId)) {
      return { ...m, readBy: [...m.readBy, userId] };
    }
    return { ...m };
  });
  _messages[channelId] = msgs;

  // Clear unread for this channel
  const ch = _channels.find(c => c.id === channelId);
  if (ch) ch.unreadCount = 0;

  return msgs;
}

export async function sendMessage(
  channelId: string,
  senderId: string,
  body: string,
  opts?: { patientRef?: PatientRef; isUrgent?: boolean },
): Promise<Message> {
  await delay(100);

  const msg: Message = {
    id:           uid(),
    channelId,
    senderId,
    body,
    sentAt:       now(),
    readBy:       [senderId],
    phiSuspected: containsPhi(body),
    isUrgent:     opts?.isUrgent ?? false,
    patientRef:   opts?.patientRef ?? null,
    taskId:       null,
  };

  if (!_messages[channelId]) _messages[channelId] = [];
  _messages[channelId] = [..._messages[channelId], msg];

  const ch = _channels.find(c => c.id === channelId);
  if (ch) {
    ch.lastMessageAt      = msg.sentAt;
    ch.lastMessagePreview = body.slice(0, 60);
  }

  audit('send_message', senderId, channelId);
  return { ...msg };
}

export async function createTask(params: {
  title: string;
  assigneeId: string;
  priority: TaskPriority;
  dueAt: string | null;
  messageId: string;
  channelId: string;
  creatorId: string;
}): Promise<MessageTask> {
  await delay(150);

  const task: MessageTask = {
    id:         uid(),
    title:      params.title,
    assigneeId: params.assigneeId,
    priority:   params.priority,
    status:     'open',
    dueAt:      params.dueAt,
    createdAt:  now(),
    messageId:  params.messageId,
    channelId:  params.channelId,
  };

  _tasks = [..._tasks, task];

  // Link task back to source message
  if (_messages[params.channelId]) {
    _messages[params.channelId] = _messages[params.channelId].map(m =>
      m.id === params.messageId ? { ...m, taskId: task.id } : m,
    );
  }

  audit('create_task', params.creatorId, params.channelId);
  return { ...task };
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  userId: string,
): Promise<MessageTask> {
  await delay(100);

  const idx = _tasks.findIndex(t => t.id === taskId);
  if (idx === -1) throw new Error('Task not found');

  _tasks[idx] = { ..._tasks[idx], status };
  audit('update_task', userId);
  return { ..._tasks[idx] };
}

export async function getTasks(channelId?: string): Promise<MessageTask[]> {
  await delay(100);
  if (channelId) return _tasks.filter(t => t.channelId === channelId).map(t => ({ ...t }));
  return _tasks.map(t => ({ ...t }));
}

export async function getOrCreateDm(
  userA: string,
  userB: string,
): Promise<Channel> {
  await delay(100);

  const existing = _channels.find(
    c => c.type === 'dm' && c.memberIds.includes(userA) && c.memberIds.includes(userB),
  );
  if (existing) return { ...existing };

  const member = _members.find(m => m.id === userB);
  const ch: Channel = {
    id:                  `dm-${userA}-${userB}`,
    type:                'dm',
    name:                `dm:${userA}:${userB}`,
    displayName:         member ? `${member.firstName} ${member.lastName}` : 'Direct Message',
    description:         '',
    memberIds:           [userA, userB],
    lastMessageAt:       null,
    lastMessagePreview:  null,
    unreadCount:         0,
  };

  _channels = [..._channels, ch];
  return { ...ch };
}

export function getAuditLog() { return [..._auditLog]; }
