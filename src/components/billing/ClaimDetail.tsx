// ClaimDetail.tsx — full claim detail view with status actions.
// ⚠️ HIPAA: Claim data is PHI. All status mutations must be audit-logged in production.

import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { Claim, ClaimStatus } from './types';
import { getClaim, updateClaimStatus } from '../../services/billingService';
import { validateClaim } from './utils/claimValidation';
import { MOCK_PATIENTS_MAP } from '../../constants/mockPatients';
import { formatCurrency } from '../../utils/formatUtils';

interface ClaimDetailProps {
  claimId:   string;
  onBack:    () => void;
  onUpdate?: (claim: Claim) => void;
}

const STATUS_BADGE: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-600',
  ready:        'bg-blue-100 text-blue-700',
  submitted:    'bg-indigo-100 text-indigo-700',
  acknowledged: 'bg-cyan-100 text-cyan-700',
  pending:      'bg-amber-100 text-amber-700',
  paid:         'bg-green-100 text-green-700',
  denied:       'bg-red-100 text-red-700',
  rejected:     'bg-red-100 text-red-700',
  appealed:     'bg-orange-100 text-orange-700',
};

export default function ClaimDetail({ claimId, onBack, onUpdate }: ClaimDetailProps) {
  const [claim, setClaim]   = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLoading(true);
    getClaim(claimId).then(c => {
      setClaim(c);
      setLoading(false);
    });
  }, [claimId]);

  const handleStatusChange = async (newStatus: ClaimStatus) => {
    if (!claim) return;
    setUpdating(true);
    try {
      const updated = await updateClaimStatus(claim.id, newStatus);
      setClaim(updated);
      onUpdate?.(updated);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !claim) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const patient = MOCK_PATIENTS_MAP[claim.patientId];
  const validation = validateClaim(claim);
  const showValidation = claim.status === 'draft' || claim.status === 'ready';

  const lineTotals = claim.lines.reduce(
    (acc, l) => ({
      fee:     acc.fee     + l.fee,
      allowed: acc.allowed + (l.allowedAmount ?? 0),
      paid:    acc.paid    + (l.insurancePaid  ?? 0),
      adj:     acc.adj     + (l.adjustmentAmount ?? 0),
      ptResp:  acc.ptResp  + (l.patientResponsibility ?? 0),
    }),
    { fee: 0, allowed: 0, paid: 0, adj: 0, ptResp: 0 }
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748b] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-[#0f172a]">Claim #{claim.id}</h2>
            <p className="text-xs text-[#64748b]">Created {new Date(claim.dateCreated + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ml-2 ${STATUS_BADGE[claim.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {claim.status}
          </span>
        </div>

        {/* Action buttons per status */}
        <div className="flex gap-2">
          {(claim.status === 'draft' || claim.status === 'ready') && (
            <>
              <button
                onClick={() => handleStatusChange('ready')}
                disabled={updating || claim.status === 'ready'}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#64748b] disabled:opacity-50 transition-colors"
              >
                Mark Ready
              </button>
              <button
                onClick={() => handleStatusChange('submitted')}
                disabled={updating || !validation.valid}
                className="text-sm px-3 py-1.5 bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490] disabled:opacity-50 transition-colors"
              >
                Submit Claim
              </button>
            </>
          )}
          {(claim.status === 'submitted' || claim.status === 'pending' || claim.status === 'acknowledged') && (
            <>
              <button
                onClick={() => handleStatusChange('denied')}
                disabled={updating}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50 transition-colors"
              >
                Mark Denied
              </button>
              <button
                onClick={() => handleStatusChange('paid')}
                disabled={updating}
                className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Mark Paid
              </button>
            </>
          )}
          {claim.status === 'denied' && (
            <button
              onClick={() => handleStatusChange('appealed')}
              disabled={updating}
              className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              Appeal Claim
            </button>
          )}
          {claim.status === 'paid' && (
            <span className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Paid — View ERA
            </span>
          )}
        </div>
      </div>

      {/* Validation warnings */}
      {showValidation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {err}
            </div>
          ))}
          {validation.warnings.map((warn, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {warn}
            </div>
          ))}
        </div>
      )}

      {/* Patient & Insurance info */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Patient & Insurance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Patient</p>
            <p className="font-medium text-[#0f172a]">{claim.patientName}</p>
          </div>
          {patient?.dateOfBirth && (
            <div>
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Date of Birth</p>
              <p className="text-[#0f172a]">{new Date(patient.dateOfBirth + 'T12:00:00').toLocaleDateString('en-US')}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Insurance</p>
            <p className="text-[#0f172a]">{claim.insuranceName}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Claim Type</p>
            <p className="text-[#0f172a]">{claim.claimType === 'P' ? 'Primary' : 'Secondary'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Member ID</p>
            <p className="font-mono text-[#0f172a]">{claim.insurancePlanId}</p>
          </div>
          {claim.dateSubmitted && (
            <div>
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Submitted</p>
              <p className="text-[#0f172a]">{new Date(claim.dateSubmitted + 'T12:00:00').toLocaleDateString('en-US')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Procedure lines */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">Procedure Lines</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-5 py-3">#</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Date</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Code</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Tooth</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Surf.</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Fee</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Allowed</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Ins. Paid</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Adj.</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Pt. Resp</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {claim.lines.map((line, i) => (
                <tr
                  key={i}
                  className={['border-b border-gray-100', line.status === 'denied' ? 'bg-red-50' : 'hover:bg-gray-50'].join(' ')}
                >
                  <td className="px-5 py-2.5 text-[#94a3b8]">{line.lineNumber}</td>
                  <td className="px-3 py-2.5 text-[#64748b] text-xs whitespace-nowrap">
                    {new Date(line.dateOfService + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[#0891b2] text-xs font-medium">{line.cdtCode}</td>
                  <td className="px-3 py-2.5 text-center">{line.toothNumber ?? '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-[#64748b]">{line.surfaces?.join('') ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(line.fee / 100)}</td>
                  <td className="px-3 py-2.5 text-right">{line.allowedAmount != null ? formatCurrency(line.allowedAmount / 100) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-green-700">{line.insurancePaid != null ? formatCurrency(line.insurancePaid / 100) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-amber-700">{line.adjustmentAmount != null ? formatCurrency(line.adjustmentAmount / 100) : '—'}</td>
                  <td className="px-3 py-2.5 text-right">{line.patientResponsibility != null ? formatCurrency(line.patientResponsibility / 100) : '—'}</td>
                  <td className="px-3 py-2.5">
                    {line.status === 'denied' && line.adjustmentReason ? (
                      <span className="text-[10px] text-red-600 font-medium" title={line.adjustmentReason}>Denied</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-gray-100 text-gray-600">
                        {line.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={5} className="px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-widest">Totals</td>
                <td className="px-3 py-3 text-right font-bold">{formatCurrency(lineTotals.fee / 100)}</td>
                <td className="px-3 py-3 text-right font-bold">{formatCurrency(lineTotals.allowed / 100)}</td>
                <td className="px-3 py-3 text-right font-bold text-green-700">{formatCurrency(lineTotals.paid / 100)}</td>
                <td className="px-3 py-3 text-right font-bold text-amber-700">{formatCurrency(lineTotals.adj / 100)}</td>
                <td className="px-3 py-3 text-right font-bold">{formatCurrency(lineTotals.ptResp / 100)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Totals summary */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Total Charged</p>
              <p className="text-lg font-bold text-[#0f172a]">{formatCurrency(claim.totalCharged / 100)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Total Allowed</p>
              <p className="text-lg font-bold text-[#0f172a]">{claim.totalAllowed != null ? formatCurrency(claim.totalAllowed / 100) : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Insurance Paid</p>
              <p className="text-lg font-bold text-green-700">{claim.totalInsurancePaid != null ? formatCurrency(claim.totalInsurancePaid / 100) : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Pt. Responsibility</p>
              <p className="text-lg font-bold text-amber-700">{claim.totalPatientResponsibility != null ? formatCurrency(claim.totalPatientResponsibility / 100) : '—'}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-5 pb-5">
          <label className="block text-xs font-medium text-[#64748b] mb-1">Claim Notes</label>
          <textarea
            defaultValue={claim.notes ?? ''}
            rows={2}
            placeholder="Add notes about this claim…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
          />
        </div>
      </div>
    </div>
  );
}
