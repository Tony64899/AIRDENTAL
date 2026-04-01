// NotesPage — /notes route.
// 3-panel layout: NotesSubNav (billing-style) | NotesSidebar (list) | NoteEditor

import NotesSubNav  from '../components/notes/NotesSubNav';
import NotesSidebar from '../components/notes/NotesSidebar';
import NoteEditor   from '../components/notes/NoteEditor';

export default function NotesPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <NotesSubNav />
      <NotesSidebar />
      <NoteEditor />
    </div>
  );
}
