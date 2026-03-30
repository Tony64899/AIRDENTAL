// ToothContextMenu — right-click context menu for tooth-level actions.
// ⚠️ HIPAA: Actions here mutate PHI — all changes are audit-logged upstream.

import { useEffect, useRef } from 'react';
import { XCircle, Zap, FileText, Eraser, History } from 'lucide-react';

interface ToothContextMenuProps {
  toothNumber:   number;
  x:             number;
  y:             number;
  onSetMissing:  () => void;
  onSetImplant:  () => void;
  onAddNote:     () => void;
  onClearTooth:  () => void;
  onViewHistory: () => void;
  onClose:       () => void;
}

export function ToothContextMenu({
  toothNumber,
  x,
  y,
  onSetMissing,
  onSetImplant,
  onAddNote,
  onClearTooth,
  onViewHistory,
  onClose,
}: ToothContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function item(
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    colorClass = 'text-[#0f172a]',
    hoverClass = 'hover:text-[#0f172a]',
  ) {
    return (
      <button
        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer w-full text-left hover:bg-gray-50 transition-colors ${colorClass} ${hoverClass} text-sm`}
        onClick={() => { onClick(); onClose(); }}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 w-48 text-sm"
      style={{
        left: Math.min(x, window.innerWidth - 200),
        top:  Math.min(y, window.innerHeight - 220),
      }}
    >
      <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] border-b border-gray-100 mb-0.5">
        Tooth #{toothNumber}
      </div>
      {item(<XCircle className="w-3.5 h-3.5" />, 'Set as Missing',   onSetMissing,  'text-[#0f172a]', 'hover:text-red-600')}
      {item(<Zap      className="w-3.5 h-3.5" />, 'Set as Implant',  onSetImplant,  'text-[#0f172a]', 'hover:text-green-600')}
      {item(<FileText className="w-3.5 h-3.5" />, 'Add / Edit Note', onAddNote)}
      {item(<Eraser   className="w-3.5 h-3.5" />, 'Clear This Tooth', onClearTooth,  'text-[#0f172a]', 'hover:text-amber-600')}
      {item(<History  className="w-3.5 h-3.5" />, 'View Change History', onViewHistory)}
    </div>
  );
}
