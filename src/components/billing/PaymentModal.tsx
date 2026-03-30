// PaymentModal.tsx — collect patient payment with method selection.
// ⚠️ HIPAA: Payment data is PHI. All transactions must be audit-logged in production.

import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import type { Payment, PaymentMethod } from './types';
import { addPayment } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatUtils';

interface PaymentModalProps {
  patientId:      string;
  patientName:    string;
  defaultAmount?: number;
  onSave:         (payment: Payment) => void;
  onClose:        () => void;
}

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'Cash',       label: 'Cash'        },
  { id: 'Check',      label: 'Check'       },
  { id: 'CreditCard', label: 'Credit Card' },
  { id: 'DebitCard',  label: 'Debit Card'  },
  { id: 'ACH',        label: 'ACH'         },
  { id: 'CareCredit', label: 'CareCredit'  },
];

const METHOD_COLOR: Record<PaymentMethod, string> = {
  Cash:       'bg-green-100 text-green-700 border-green-300',
  Check:      'bg-blue-100 text-blue-700 border-blue-300',
  CreditCard: 'bg-purple-100 text-purple-700 border-purple-300',
  DebitCard:  'bg-purple-100 text-purple-700 border-purple-300',
  ACH:        'bg-indigo-100 text-indigo-700 border-indigo-300',
  CareCredit: 'bg-orange-100 text-orange-700 border-orange-300',
};

export default function PaymentModal({ patientId, patientName, defaultAmount, onSave, onClose }: PaymentModalProps) {
  const [amount, setAmount]     = useState(defaultAmount ? (defaultAmount / 100).toFixed(2) : '');
  const [method, setMethod]     = useState<PaymentMethod>('CreditCard');
  const [refNum, setRefNum]     = useState('');
  const [notes, setNotes]       = useState('');
  const [saving, setSaving]     = useState(false);

  const showRefNum = method === 'Check' || method === 'ACH';

  const handleSave = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents <= 0) return;
    setSaving(true);
    try {
      const payment = await addPayment({
        patientId,
        patientName,
        date: new Date().toISOString().split('T')[0],
        amount: cents,
        method,
        referenceNumber: refNum || undefined,
        appliedTo: [],
        postedBy: 'Front Desk',
        notes: notes || undefined,
      });
      onSave(payment);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#0891b2]" />
            <h2 className="text-base font-semibold text-[#0f172a]">Collect Payment</h2>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Patient */}
          <div className="bg-[#f8fafc] rounded-xl px-4 py-3">
            <p className="text-xs text-[#94a3b8] uppercase tracking-widest font-semibold mb-0.5">Patient</p>
            <p className="font-medium text-[#0f172a]">{patientName}</p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-lg font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-sm text-[#64748b] mt-0.5">{formatCurrency(parseFloat(amount))}</p>
            )}
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={[
                    'py-2 text-xs font-medium rounded-lg border transition-colors',
                    method === m.id
                      ? METHOD_COLOR[m.id]
                      : 'border-gray-200 text-[#64748b] hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference number */}
          {showRefNum && (
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">
                {method === 'Check' ? 'Check Number' : 'Reference Number'}
              </label>
              <input
                type="text"
                value={refNum}
                onChange={e => setRefNum(e.target.value)}
                placeholder={method === 'Check' ? 'e.g. 1042' : 'e.g. ACH-20260101'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Payment plan installment 3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#64748b] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !amount || parseFloat(amount) <= 0}
            className="px-4 py-2 text-sm bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? 'Posting…' : 'Post Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
