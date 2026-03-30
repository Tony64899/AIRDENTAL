// MessagesPage — /messages route.
// 3-panel layout: ChannelSidebar | MessageThread | TaskPanel (collapsible).
// MessagingContext must be in the provider tree (provided in App.tsx).

import { ChannelSidebar } from '../components/messaging/ChannelSidebar';
import { MessageThread }  from '../components/messaging/MessageThread';
import { TaskPanel }      from '../components/messaging/TaskPanel';
import { useMessaging }   from '../contexts/MessagingContext';

export default function MessagesPage() {
  const { state } = useMessaging();

  return (
    <div className="flex h-full overflow-hidden">
      <ChannelSidebar />
      <MessageThread />
      {state.isTaskPanelOpen && <TaskPanel />}
    </div>
  );
}
