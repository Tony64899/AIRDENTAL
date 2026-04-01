// NotesPage — /notes route. Apple Notes-style 2-panel layout.
// Left: NotesSidebar (w-72)  Right: NoteEditor (flex-1)

import NotesSidebar from '../components/notes/NotesSidebar';
import NoteEditor   from '../components/notes/NoteEditor';

export default function NotesPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <NotesSidebar />
      <NoteEditor />
    </div>
  );
}
