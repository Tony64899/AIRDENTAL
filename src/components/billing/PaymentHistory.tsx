// PaymentHistory.tsx — payment ledger for all patients or a single patient.
// ⚠️ HIPAA: Payment records are PHI. Display only to authorized billing users.

import { useState, useEffect } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import type { Payment, PaymentMethod } from './types';
import { getPayments } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatUtils';
import PaymentModal from './PaymentModal';
import { MOCK_PATIENTS } from '../../constants/mockPatients';

interface PaymentHistoryProps {
  patientId?: string;
}

const METHOD_BADGE: Record<PaymentMethod, string> = {
  Cash:       'bg-green-100 text-green-700',
  Check:      'bg-blue-100 text-blue-700',
  CreditCard: 'bg-purple-100 text-purple-700',
  DebitCard:  'bg-purple-100 text-purple-700',
  ACH:        'bg-indigo-100 text-indigo-700',
  CareCredit: 'bg-orange-100 text-orange-700',
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  Cash:       'Cash',
  Check:      'Check',
  CreditCard: 'Credit Card',
  DebitCard:  'Debit Card',
  ACH:        'ACH',
  CareCredit: 'CareCredit',
};

export default function PaymentHistory({ patientId }: PaymentHistoryProps) {
  const [payments, setPayments]       = useState<Payment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [modalPatientId, setModalPt]  = useState(patientId ?? 'pat-1');

  const load = () => {
    setLoading(true);
    getPayments(patientId).then(data => {
      setPayments(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [patientId]);

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);

  const patient = MOCK_PATIENTS.find(p => p.id === modalPatientId);

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#0891b2]" />
          <h2 className="text-sm font-semibold text-[#0f172a]">
            {patientId ? 'Patient Payments' : 'All Payments'}
          </h2>
          {!loading && (
            <span className="text-xs text-[#94a3b8]">— {payments.length} records &middot; {formatCurrency(totalAmount / 100)}</span>
          )}
        </div>
        <button
          onClick={() => {
            if (!patientId) setModalPt('pat-1');
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Collect Payment
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-5 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-5 py-3 whitespace-nowrap">Date</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Patient</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Amount</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Method</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Reference</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3 whitespace-nowrap">Posted By</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-sm text-[#94a3b8]">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 text-[#64748b] text-xs whitespace-nowrap">
                      {new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3 font-medium text-[#0f172a]">{p.patientName}</td>
                    <td className="px-3 py-3 text-right font-bold text-green-700">{formatCurrency(p.amount / 100)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${METHOD_BADGE[p.method] ?? 'bg-gray-100 text-gray-600'}`}>
                        {METHOD_LABEL[p.method] ?? p.method}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#64748b]">{p.referenceNumber ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-[#64748b]">{p.postedBy}</td>
                    <td className="px-5 py-3 text-xs text-[#64748b] max-w-[180px] truncate">{p.notes ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <PaymentModal
          patientId={patientId ?? modalPatientId}
          patientName={patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
          onSave={saved => {
            setPayments(prev => [saved, ...prev]);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
