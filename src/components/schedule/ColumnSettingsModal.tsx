// ColumnSettingsModal — rename provider and operatory for a scheduler column.

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Provider } from '../../types/provider';

interface ColumnSettingsModalProps {
  provider: Provider;
  onClose: () => void;
  onSave: (updates: Partial<Provider>) => void;
}

export function ColumnSettingsModal({ provider, onClose, onSave }: ColumnSettingsModalProps) {
  const [name, setName]           = useState(provider.name);
  const [operatory, setOperatory] = useState(provider.operatory);

  const handleSave = () => onSave({ name, operatory });

  const inputClass = 'w-full px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]';

  return (
    <Modal isOpen title="Column Settings" onClose={onClose} size="sm">
      <div className="p-6 space-y-4">
        <div>
          <label htmlFor="provider-name" className="text-sm font-medium text-[#0f172a] block mb-2">
            Provider Name
          </label>
          <input
            id="provider-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className={inputClass}
            placeholder="Enter provider name"
          />
        </div>
        <div>
          <label htmlFor="operatory-name" className="text-sm font-medium text-[#0f172a] block mb-2">
            Operatory Name
          </label>
          <input
            id="operatory-name"
            type="text"
            value={operatory}
            onChange={e => setOperatory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className={inputClass}
            placeholder="Enter operatory name"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-[#f8fafc] rounded-b-xl">
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="md" onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  );
}
