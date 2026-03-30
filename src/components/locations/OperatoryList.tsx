// OperatoryList — manage operatories (exam chairs) for a location.
// Inline add/rename/toggle active/delete.

import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Pencil, Check, X } from 'lucide-react';
import type { Operatory } from '../../types/clinic';

interface OperatoryListProps {
  operatories: Operatory[];
  onAdd:       (name: string) => void;
  onUpdate:    (id: string, patch: Partial<Pick<Operatory, 'name' | 'isActive'>>) => void;
  onDelete:    (id: string) => void;
}

export function OperatoryList({ operatories, onAdd, onUpdate, onDelete }: OperatoryListProps) {
  const [addingName,  setAddingName]  = useState('');
  const [isAdding,    setIsAdding]    = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  function handleAdd() {
    const trimmed = addingName.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setAddingName('');
    setIsAdding(false);
  }

  function startEdit(op: Operatory) {
    setEditingId(op.id);
    setEditingName(op.name);
  }

  function commitEdit(id: string) {
    const trimmed = editingName.trim();
    if (trimmed) onUpdate(id, { name: trimmed });
    setEditingId(null);
  }

  return (
    <div className="space-y-1">
      {/* List */}
      {operatories.length === 0 && !isAdding && (
        <p className="text-sm text-[#94a3b8] text-center py-6 border border-dashed border-gray-200 rounded-xl">
          No operatories added yet.
        </p>
      )}

      {operatories.map(op => (
        <div
          key={op.id}
          className={[
            'flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
            op.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60',
          ].join(' ')}
        >
          {/* Inline name editor */}
          {editingId === op.id ? (
            <input
              autoFocus
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit(op.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="flex-1 text-sm border border-[#0891b2] rounded-lg px-2 py-1 focus:outline-none"
            />
          ) : (
            <span className="flex-1 text-sm font-medium text-[#0f172a]">{op.name}</span>
          )}

          {/* Status badge */}
          <span className={[
            'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
            op.isActive
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200',
          ].join(' ')}>
            {op.isActive ? 'Active' : 'Inactive'}
          </span>

          {/* Actions */}
          {editingId === op.id ? (
            <>
              <button
                onClick={() => commitEdit(op.id)}
                className="p-1 rounded text-green-600 hover:bg-green-50"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 rounded text-[#94a3b8] hover:bg-gray-100"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(op)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#64748b] hover:bg-gray-100 transition-colors"
                title="Rename"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdate(op.id, { isActive: !op.isActive })}
                className="p-1 rounded text-[#94a3b8] hover:text-[#64748b] hover:bg-gray-100 transition-colors"
                title={op.isActive ? 'Deactivate' : 'Activate'}
              >
                {op.isActive
                  ? <ToggleRight className="w-4 h-4 text-[#0891b2]" />
                  : <ToggleLeft  className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDelete(op.id)}
                className="p-1 rounded text-[#94a3b8] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ))}

      {/* Add new row */}
      {isAdding ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#0891b2] bg-[#f0f9ff]">
          <input
            autoFocus
            value={addingName}
            onChange={e => setAddingName(e.target.value)}
            placeholder="Operatory name (e.g. Op 4)"
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setIsAdding(false); setAddingName(''); }
            }}
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-[#94a3b8]"
          />
          <button
            onClick={handleAdd}
            disabled={!addingName.trim()}
            className="text-sm font-medium text-white bg-[#0891b2] px-3 py-1 rounded-lg disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => { setIsAdding(false); setAddingName(''); }}
            className="text-sm text-[#64748b] hover:text-[#0f172a]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-[#64748b] hover:border-[#0891b2] hover:text-[#0891b2] hover:bg-[#f0f9ff] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Operatory
        </button>
      )}
    </div>
  );
}
