// MessagingContext — global messaging state via useReducer + Context.
// Mirrors AuthContext pattern: one provider at the App level, one custom hook.
// Provider initialises when the user is authenticated and tears down on logout.
// subscribe() cleanup is returned from useEffect — React StrictMode safe.

import {
  createContext, useContext, useReducer, useEffect, useCallback, useMemo,
} from 'react';
import type { ReactNode } from 'react';

import type {
  MessagingState, MessagingAction, Channel, ChannelId,
  MessageTask, TaskStatus, PatientRef,
} from '../types/messaging';
import * as svc from '../services/messagingService';
import { useAuth } from '../hooks/useAuth';

// ── Initial state ─────────────────────────────────────────────────────────────
const INITIAL_STATE: MessagingState = {
  channels:          [],
  messages:          {},
  tasks:             [],
  members:           [],
  activeChannelId:   null,
  isTaskPanelOpen:   true,
  isLoading:         false,
  error:             null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  switch (action.type) {

    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        channels: action.payload.channels,
        members:  action.payload.members,
        isLoading: false,
      };

    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };

    case 'SELECT_CHANNEL': {
      const { channelId } = action.payload;
      return {
        ...state,
        activeChannelId: channelId,
        // Optimistically zero unread count on selection
        channels: state.channels.map(c =>
          c.id === channelId ? { ...c, unreadCount: 0 } : c,
        ),
      };
    }

    case 'MESSAGES_LOADED': {
      const { channelId, messages, userId } = action.payload;
      return {
        ...state,
        messages: { ...state.messages, [channelId]: messages },
        channels: state.channels.map(c =>
          c.id === channelId ? { ...c, unreadCount: 0 } : c,
        ),
        tasks: state.tasks, // unchanged
        members: state.members.map(m =>
          m.id === userId ? m : m,
        ),
      };
    }

    case 'SEND_MESSAGE': {
      const msg = action.payload;
      const existing = state.messages[msg.channelId] ?? [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [msg.channelId]: [...existing, msg],
        },
        channels: state.channels.map(c =>
          c.id === msg.channelId
            ? { ...c, lastMessageAt: msg.sentAt, lastMessagePreview: msg.body.slice(0, 60) }
            : c,
        ),
      };
    }

    case 'RECEIVE_MESSAGE': {
      const msg = action.payload;
      const existing = state.messages[msg.channelId] ?? [];
      // Avoid duplicates (StrictMode may fire twice)
      if (existing.some(m => m.id === msg.id)) return state;

      const isActive = state.activeChannelId === msg.channelId;
      return {
        ...state,
        messages: {
          ...state.messages,
          [msg.channelId]: [...existing, msg],
        },
        channels: state.channels.map(c =>
          c.id === msg.channelId
            ? {
                ...c,
                lastMessageAt:      msg.sentAt,
                lastMessagePreview: msg.body.slice(0, 60),
                unreadCount:        isActive ? 0 : c.unreadCount + 1,
              }
            : c,
        ),
      };
    }

    case 'CREATE_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        // Link taskId to source message
        messages: {
          ...state.messages,
          [action.payload.channelId]: (state.messages[action.payload.channelId] ?? []).map(m =>
            m.id === action.payload.messageId ? { ...m, taskId: action.payload.id } : m,
          ),
        },
      };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, status: action.payload.status }
            : t,
        ),
      };

    case 'TOGGLE_TASK_PANEL':
      return { ...state, isTaskPanelOpen: !state.isTaskPanelOpen };

    case 'RESET':
      return INITIAL_STATE;

    default:
      return state;
  }
}

// ── Context value type ────────────────────────────────────────────────────────
interface MessagingContextValue {
  state:             MessagingState;
  totalUnread:       number;
  selectChannel:     (id: ChannelId) => Promise<void>;
  sendMessage:       (body: string, opts?: { patientRef?: PatientRef; isUrgent?: boolean }) => Promise<void>;
  createTask:        (params: {
    title: string; assigneeId: string; priority: MessageTask['priority'];
    dueAt: string | null; messageId: string;
  }) => Promise<void>;
  updateTaskStatus:  (taskId: string, status: TaskStatus) => Promise<void>;
  toggleTaskPanel:   () => void;
  openDm:            (targetUserId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function MessagingProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth();
  const [state, dispatch] = useReducer(messagingReducer, INITIAL_STATE);

  // Initialise / reset when auth changes
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user) {
      dispatch({ type: 'RESET' });
      return;
    }

    const userId = authState.user.id;
    dispatch({ type: 'LOAD_START' });

    Promise.all([
      svc.getChannels(userId),
      svc.getMembers(),
    ]).then(([channels, members]) => {
      dispatch({ type: 'LOAD_SUCCESS', payload: { channels, members } });
    }).catch(err => {
      dispatch({ type: 'SET_ERROR', payload: String(err) });
    });

    // Real-time subscription
    const unsub = svc.subscribe(msg => {
      dispatch({ type: 'RECEIVE_MESSAGE', payload: msg });
    });

    // Update online statuses every 30 seconds
    const statusInterval = setInterval(async () => {
      const fresh = await svc.getMembers();
      // Re-dispatch LOAD_SUCCESS to sync members (channels unchanged)
      const channels = await svc.getChannels(userId);
      dispatch({ type: 'LOAD_SUCCESS', payload: { channels, members: fresh } });
    }, 30_000);

    return () => {
      unsub();
      clearInterval(statusInterval);
    };
  }, [authState.isAuthenticated, authState.user?.id]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const selectChannel = useCallback(async (channelId: ChannelId) => {
    const userId = authState.user?.id;
    if (!userId) return;

    dispatch({ type: 'SELECT_CHANNEL', payload: { channelId, userId } });

    // Load messages if not already loaded
    const msgs = await svc.getMessages(channelId, userId);
    dispatch({ type: 'MESSAGES_LOADED', payload: { channelId, messages: msgs, userId } });

    // Load tasks for this channel
    const tasks = await svc.getTasks(channelId);
    tasks.forEach(t => {
      if (!state.tasks.find(existing => existing.id === t.id)) {
        dispatch({ type: 'CREATE_TASK', payload: t });
      }
    });
  }, [authState.user?.id, state.tasks]);

  const sendMessage = useCallback(async (
    body: string,
    opts?: { patientRef?: PatientRef; isUrgent?: boolean },
  ) => {
    const userId    = authState.user?.id;
    const channelId = state.activeChannelId;
    if (!userId || !channelId || !body.trim()) return;

    const msg = await svc.sendMessage(channelId, userId, body, opts);
    dispatch({ type: 'SEND_MESSAGE', payload: msg });
  }, [authState.user?.id, state.activeChannelId]);

  const createTask = useCallback(async (params: {
    title: string; assigneeId: string; priority: MessageTask['priority'];
    dueAt: string | null; messageId: string;
  }) => {
    const userId    = authState.user?.id;
    const channelId = state.activeChannelId;
    if (!userId || !channelId) return;

    const task = await svc.createTask({ ...params, channelId, creatorId: userId });
    dispatch({ type: 'CREATE_TASK', payload: task });
  }, [authState.user?.id, state.activeChannelId]);

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    const userId = authState.user?.id;
    if (!userId) return;

    await svc.updateTaskStatus(taskId, status, userId);
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } });
  }, [authState.user?.id]);

  const toggleTaskPanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_TASK_PANEL' });
  }, []);

  const openDm = useCallback(async (targetUserId: string) => {
    const userId = authState.user?.id;
    if (!userId) return;

    const ch = await svc.getOrCreateDm(userId, targetUserId);
    dispatch({ type: 'LOAD_SUCCESS', payload: {
      channels: [...state.channels.filter(c => c.id !== ch.id), ch],
      members: state.members,
    }});
    await selectChannel(ch.id);
  }, [authState.user?.id, state.channels, state.members, selectChannel]);

  const totalUnread = useMemo(
    () => state.channels.reduce((sum, c) => sum + c.unreadCount, 0),
    [state.channels],
  );

  const value: MessagingContextValue = {
    state, totalUnread, selectChannel, sendMessage,
    createTask, updateTaskStatus, toggleTaskPanel, openDm,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMessaging(): MessagingContextValue {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used inside MessagingProvider');
  return ctx;
}
