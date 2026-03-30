// ChannelSidebar — left panel of the messaging page.
// Shows channels section + DMs section with unread badges + online dots.
// Active item: Navy tinted background. Unread badge: Air Dental Red.

import { Hash, Lock } from 'lucide-react';
import { OnlineDot } from './OnlineDot';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../hooks/useAuth';
import type { Channel, MessagingMember } from '../../types/messaging';

const ROLE_COLOR: Record<string, string> = {
  admin:      'bg-[#0B3A70]',
  dentist:    'bg-blue-500',
  hygienist:  'bg-green-600',
  front_desk: 'bg-purple-600',
};

function ChannelRow({
  channel, isActive, onClick,
}: { channel: Channel; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors group ${
        isActive
          ? 'bg-[#0B3A70]/10 text-[#0B3A70]'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {channel.id === 'ch-urgent'
        ? <Lock className="w-4 h-4 flex-shrink-0 text-red-500" />
        : <Hash className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#0B3A70]' : 'text-slate-400 group-hover:text-slate-600'}`} />
      }
      <span className={`flex-1 text-sm truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
        {channel.displayName}
      </span>
      {channel.unreadCount > 0 && (
        <span className="bg-[#A60F2D] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
          {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
        </span>
      )}
    </button>
  );
}

function DmRow({
  channel, member, isActive, onClick,
}: {
  channel: Channel;
  member: MessagingMember | undefined;
  isActive: boolean;
  onClick: () => void;
}) {
  const roleColor = member ? (ROLE_COLOR[member.role] ?? 'bg-slate-500') : 'bg-slate-500';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-[#0B3A70]/10 text-[#0B3A70]'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {/* Avatar with online dot */}
      <div className="relative flex-shrink-0">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${roleColor}`}>
          {member ? `${member.firstName[0]}${member.lastName[0]}` : '?'}
        </div>
        {member && (
          <OnlineDot
            status={member.status}
            className="absolute -bottom-0.5 -right-0.5 !w-2.5 !h-2.5 !border-white"
          />
        )}
      </div>

      <span className={`flex-1 text-sm truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
        {channel.displayName}
      </span>

      {channel.unreadCount > 0 && (
        <span className="bg-[#A60F2D] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
          {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
        </span>
      )}
    </button>
  );
}

export function ChannelSidebar() {
  const { state, selectChannel } = useMessaging();
  const { state: authState }     = useAuth();
  const currentUserId            = authState.user?.id;

  const channels  = state.channels.filter(c => c.type === 'channel');
  const dms       = state.channels.filter(c => c.type === 'dm');

  // Get the other participant in a DM
  function getDmMember(channel: Channel): MessagingMember | undefined {
    const otherId = channel.memberIds.find(id => id !== currentUserId);
    return state.members.find(m => m.id === otherId);
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-y-auto">

      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">Messages</h2>
        <p className="text-xs text-slate-500 mt-0.5">Inspire Dental</p>
      </div>

      <div className="flex-1 px-2 py-3 space-y-4">

        {/* Channels section */}
        <div>
          <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Channels
          </p>
          <div className="space-y-0.5">
            {channels.map(ch => (
              <ChannelRow
                key={ch.id}
                channel={ch}
                isActive={state.activeChannelId === ch.id}
                onClick={() => selectChannel(ch.id)}
              />
            ))}
          </div>
        </div>

        {/* Direct Messages section */}
        {dms.length > 0 && (
          <div>
            <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Direct Messages
            </p>
            <div className="space-y-0.5">
              {dms.map(ch => (
                <DmRow
                  key={ch.id}
                  channel={ch}
                  member={getDmMember(ch)}
                  isActive={state.activeChannelId === ch.id}
                  onClick={() => selectChannel(ch.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Online team members */}
        <div>
          <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Team
          </p>
          <div className="space-y-0.5">
            {state.members
              .filter(m => m.id !== currentUserId)
              .map(m => {
                const roleColor = ROLE_COLOR[m.role] ?? 'bg-slate-500';
                return (
                  <div key={m.id} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg">
                    <div className="relative flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${roleColor}`}>
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      <OnlineDot
                        status={m.status}
                        className="absolute -bottom-0.5 -right-0.5 !w-2 !h-2"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize truncate">
                        {m.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </aside>
  );
}
