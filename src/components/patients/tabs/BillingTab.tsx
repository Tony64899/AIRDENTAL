// BillingTab — transaction history and current balance.
// ⚠️ HIPAA: Financial data is PHI. Never cache, log, or expose without authorization.

import { AlertCircle } from 'lucide-react';
import type { Patient, BillingTransaction, TransactionType } from '../../../types/patient';
import { formatCurrency } from '../../../utils/formatUtils';

interface BillingTabProps {
  patient: Patient;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

// ── Transaction type badge ─────────────────────────────────────────────────
const TYPE_BADGE: Record<TransactionType, string> = {
  charge:             'bg-red-50 text-red-700 border border-red-200',
  insurance_payment:  'bg-blue-50 text-blue-700 border border-blue-200',
  patient_payment:    'bg-green-50 text-green-700 border border-green-200',
  adjustment:         'bg-purple-50 text-purple-700 border border-purple-200',
  credit:             'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const TYPE_LABEL: Record<TransactionType, string> = {
  charge:             'Charge',
  insurance_payment:  'Insurance',
  patient_payment:    'Payment',
  adjustment:         'Adjustment',
  credit:             'Credit',
};

function formatAmount(txn: BillingTransaction): { display: string; color: string } {
  const dollars = txn.amount / 100;
  if (txn.type === 'charge') {
    return {
      display: `+${formatCurrency(dollars)}`,
      color:   'text-red-600 font-medium',
    };
  }
  // Payments and credits are negative amounts
  const absDollars = Math.abs(dollars);
  return {
    display: `-${formatCurrency(absDollars)}`,
    color:   'text-green-600 font-medium',
  };
}

// ── Main component ─────────────────────────────────────────────────────────

export function BillingTab({ patient }: BillingTabProps) {
  const balanceDollars = patient.balance / 100;
  let balanceColor: string;
  if (balanceDollars <= 0) {
    balanceColor = 'text-green-700';
  } else if (patient.billingAlert) {
    balanceColor = 'text-red-700';
  } else {
    balanceColor = 'text-amber-700';
  }

  // Sort transactions newest-first
  const sorted = [...patient.transactions].sort(
    (a, b) => b.date.localeCompare(a.date),
  );

  return (
    <div className="space-y-4">
      {/* Balance summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-2">Current Balance</div>
        <div className={`text-2xl font-bold ${balanceColor}`}>
          {formatCurrency(balanceDollars)}
        </div>
        {patient.billingAlert && (
          <div className="flex items-start gap-2 mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-red-700">{patient.billingAlert}</span>
          </div>
        )}
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#0f172a]">Transaction History</h3>
        </div>

        {sorted.length === 0 ? (
          <div className="px-5 py-8 text-sm text-[#94a3b8] text-center">
            No transaction history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Date</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Description</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Type</th>
                  <th className="text-right px-3 py-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Amount</th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Balance</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((txn, idx) => {
                  const { display, color } = formatAmount(txn);
                  return (
                    <tr
                      key={txn.id}
                      className={[
                        'border-b border-gray-50',
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30',
                      ].join(' ')}
                    >
                      <td className="px-5 py-3 text-[#64748b] whitespace-nowrap">
                        {formatDate(txn.date)}
                      </td>
                      <td className="px-3 py-3 text-[#0f172a] min-w-[180px]">
                        {txn.description}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={[
                            'text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase',
                            TYPE_BADGE[txn.type],
                          ].join(' ')}
                        >
                          {TYPE_LABEL[txn.type]}
                        </span>
                      </td>
                      <td className={`px-3 py-3 text-right whitespace-nowrap ${color}`}>
                        {display}
                      </td>
                      <td className="px-5 py-3 text-right text-[#94a3b8] whitespace-nowrap">
                        {formatCurrency(txn.balance / 100)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
