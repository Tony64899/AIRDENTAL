// CostEstimator.tsx — patient cost estimator with insurance calculation.
// ⚠️ HIPAA: Uses insurance PHI for estimates. For internal use only.

import { useState, useMemo } from 'react';
import { Calculator, AlertTriangle, Trash2 } from 'lucide-react';
import type { CdtCode } from './types';
import type { InsurancePlan } from '../../types/patient';
import { estimateCost, type CostEstimate } from './utils/costCalculation';
import { MOCK_PATIENTS } from '../../constants/mockPatients';
import { CDT_BY_CODE } from './mockData';
import { formatCurrency } from '../../utils/formatUtils';
import CdtCodeLookup from './CdtCodeLookup';

export default function CostEstimator() {
  const [patientId, setPatientId]     = useState('');
  const [selectedCodes, setSelected]  = useState<CdtCode[]>([]);
  const [showLookup, setShowLookup]   = useState(false);

  const patient = useMemo(() => MOCK_PATIENTS.find(p => p.id === patientId), [patientId]);
  const insurance: InsurancePlan | undefined = patient?.primaryInsurance;

  const estimates: CostEstimate[] = useMemo(() =>
    selectedCodes.map(code => estimateCost(code, insurance)),
    [selectedCodes, insurance]
  );

  const totals = useMemo(() => {
    return estimates.reduce(
      (acc, e) => ({
        fee:  acc.fee  + e.fee,
        ins:  acc.ins  + e.estimatedInsurance,
        pt:   acc.pt   + e.estimatedPatient,
      }),
      { fee: 0, ins: 0, pt: 0 }
    );
  }, [estimates]);

  const handleSelectCode = (code: CdtCode) => {
    if (!selectedCodes.some(c => c.code === code.code)) {
      setSelected(prev => [...prev, code]);
    }
  };

  const removeCode = (code: string) => {
    setSelected(prev => prev.filter(c => c.code !== code));
  };

  return (
    <div className="space-y-5">
      {/* Patient selector */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-[#0891b2]" />
          <h2 className="text-sm font-semibold text-[#0f172a]">Cost Estimator</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#64748b] mb-1">Select Patient</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
            >
              <option value="">Choose a patient to load insurance…</option>
              {MOCK_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — #{p.chartNumber}</option>
              ))}
            </select>
          </div>
          {patient?.primaryInsurance && (
            <div className="text-sm">
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-0.5">Primary Insurance</p>
              <p className="font-medium text-[#0f172a]">{patient.primaryInsurance.carrier}</p>
              <p className="text-[#64748b] text-xs">Annual Max Remaining: {
                patient.primaryInsurance.annualMax > 0
                  ? formatCurrency((patient.primaryInsurance.annualMax - patient.primaryInsurance.annualMaxUsed) / 100)
                  : 'Unlimited'
              }</p>
            </div>
          )}
        </div>
      </div>

      {/* Procedure selector */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">Procedures</h3>
          <button
            onClick={() => setShowLookup(v => !v)}
            className="text-xs text-[#0891b2] hover:underline"
          >
            {showLookup ? 'Hide CDT lookup' : '+ Add procedure'}
          </button>
        </div>

        {showLookup && (
          <div className="mb-4 border border-gray-200 rounded-xl p-3 bg-[#f8fafc]">
            <CdtCodeLookup onSelect={code => { handleSelectCode(code); setShowLookup(false); }} embedded />
          </div>
        )}

        {/* Estimates table */}
        {selectedCodes.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#94a3b8]">
            No procedures selected. Click "+ Add procedure" to begin.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Code</th>
                    <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Description</th>
                    <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Fee</th>
                    <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Est. Insurance</th>
                    <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Est. Pt. Cost</th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {estimates.map((est, i) => (
                    <>
                      <tr key={est.cdtCode} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 pr-3 font-mono text-[#0891b2] text-xs font-medium">{est.cdtCode}</td>
                        <td className="py-2.5 pr-3 text-[#0f172a]">{est.description}</td>
                        <td className="py-2.5 pr-3 text-right">{formatCurrency(est.fee / 100)}</td>
                        <td className="py-2.5 pr-3 text-right text-green-700 font-medium">{formatCurrency(est.estimatedInsurance / 100)}</td>
                        <td className="py-2.5 pr-3 text-right font-bold text-[#0891b2]">{formatCurrency(est.estimatedPatient / 100)}</td>
                        <td className="py-2.5">
                          <button
                            onClick={() => removeCode(est.cdtCode)}
                            className="p-1 text-[#94a3b8] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                      {(est.annualMaxWarning || est.deductibleNote) && (
                        <tr key={`${est.cdtCode}-note`} className="border-b border-gray-100">
                          <td colSpan={6} className="pb-2 px-0">
                            {est.annualMaxWarning && (
                              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mx-0">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                {est.annualMaxWarning}
                              </div>
                            )}
                            {est.deductibleNote && (
                              <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg mt-1">
                                {est.deductibleNote}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={2} className="px-0 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-widest">Total</td>
                    <td className="py-3 pr-3 text-right font-bold text-[#0f172a]">{formatCurrency(totals.fee / 100)}</td>
                    <td className="py-3 pr-3 text-right font-bold text-green-700">{formatCurrency(totals.ins / 100)}</td>
                    <td className="py-3 pr-3 text-right font-bold text-[#0891b2] text-base">{formatCurrency(totals.pt / 100)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>Estimate only.</strong> This is an estimate only. Actual coverage may vary based on plan terms, annual usage, frequency limitations, and insurer adjudication. Always verify benefits with the insurance carrier before treatment.
        </p>
      </div>
    </div>
  );
}
