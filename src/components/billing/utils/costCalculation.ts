// costCalculation.ts — patient responsibility estimator logic.
// ⚠️ HIPAA: Estimates are based on PHI (insurance plan, annual usage).

import type { CdtCode, FeeSchedule } from '../types';
import type { InsurancePlan } from '../../../types/patient';  // existing patient insurance type

export interface CostEstimate {
  cdtCode:              string;
  description:          string;
  fee:                  number;    // cents
  estimatedInsurance:   number;    // cents
  estimatedPatient:     number;    // cents
  annualMaxWarning?:    string;
  deductibleNote?:      string;
}

// Determine coverage category from CDT code prefix
function getCoverageCategory(cdtCode: string): 'preventive' | 'basic' | 'major' {
  const prefix = parseInt(cdtCode.slice(1, 3));
  if (prefix <= 15) return 'preventive';   // D0xxx, D1xxx
  if (prefix <= 49) return 'basic';        // D2xxx–D4xxx
  return 'major';                          // D5xxx+
}

export function estimateCost(
  code: CdtCode,
  insurance: InsurancePlan | undefined,
  feeSchedule?: FeeSchedule,
): CostEstimate {
  const fee = code.defaultFee;
  if (!insurance) {
    return { cdtCode: code.code, description: code.description, fee, estimatedInsurance: 0, estimatedPatient: fee };
  }

  const category = getCoverageCategory(code.code);
  const coveragePct =
    category === 'preventive' ? insurance.preventiveCoverage :
    category === 'basic'      ? insurance.basicCoverage :
                                insurance.majorCoverage;

  const allowedAmount = feeSchedule
    ? (feeSchedule.fees.find(f => f.cdtCode === code.code)?.allowedAmount ?? fee)
    : fee;

  // Apply deductible first (for basic/major only)
  const deductibleRemaining = Math.max(0, insurance.deductible - insurance.deductibleMet);
  const applicableDeductible = category === 'preventive' ? 0 : Math.min(deductibleRemaining, allowedAmount);

  const afterDeductible = allowedAmount - applicableDeductible;
  let insuranceAmount = Math.round(afterDeductible * coveragePct / 100);

  // Check annual max
  const annualRemaining = insurance.annualMax > 0
    ? Math.max(0, insurance.annualMax - insurance.annualMaxUsed)
    : Infinity;

  let annualMaxWarning: string | undefined;
  if (insurance.annualMax > 0 && insuranceAmount > annualRemaining) {
    insuranceAmount = annualRemaining;
    annualMaxWarning = 'Annual maximum reached — patient responsible for remaining balance';
  }

  const patientAmount = fee - insuranceAmount;

  return {
    cdtCode:            code.code,
    description:        code.description,
    fee,
    estimatedInsurance: insuranceAmount,
    estimatedPatient:   Math.max(0, patientAmount),
    annualMaxWarning,
    deductibleNote:     applicableDeductible > 0 ? `$${(applicableDeductible / 100).toFixed(2)} applied to deductible` : undefined,
  };
}
