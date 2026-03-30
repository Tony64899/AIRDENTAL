// billingService — in-memory billing CRUD.
// ⚠️ HIPAA: All billing data is PHI. Production must use audited API.

import {
  CDT_CODES,
  FEE_SCHEDULES,
  TREATMENT_ENTRIES,
  CLAIMS,
  REMITTANCE_ADVICES,
  PAYMENTS,
} from '../components/billing/mockData';

import type {
  CdtCode,
  FeeSchedule,
  TreatmentEntry,
  Claim,
  ClaimStatus,
  RemittanceAdvice,
  Payment,
} from '../components/billing/types';

// Mutable in-memory copies
let cdtCodes        = [...CDT_CODES];
let feeSchedules    = [...FEE_SCHEDULES];
let treatmentEntries= [...TREATMENT_ENTRIES];
let claims          = [...CLAIMS];
let eras            = [...REMITTANCE_ADVICES];
let payments        = [...PAYMENTS];

const delay = () => new Promise(r => setTimeout(r, 200));

// ── CDT ──────────────────────────────────────────────────────────────────────

export async function getCdtCodes(): Promise<CdtCode[]> {
  await delay();
  return [...cdtCodes];
}

export async function searchCdtCodes(query: string): Promise<CdtCode[]> {
  await delay();
  const q = query.toLowerCase();
  return cdtCodes.filter(c =>
    c.code.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.layperson.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
}

// ── Fee Schedules ─────────────────────────────────────────────────────────────

export async function getFeeSchedules(): Promise<FeeSchedule[]> {
  await delay();
  return [...feeSchedules];
}

export async function getFeeSchedule(id: string): Promise<FeeSchedule> {
  await delay();
  const fs = feeSchedules.find(f => f.id === id);
  if (!fs) throw new Error(`Fee schedule not found: ${id}`);
  return { ...fs };
}

export async function updateFeeSchedule(id: string, updates: Partial<FeeSchedule>): Promise<FeeSchedule> {
  await delay();
  const idx = feeSchedules.findIndex(f => f.id === id);
  if (idx === -1) throw new Error(`Fee schedule not found: ${id}`);
  feeSchedules[idx] = { ...feeSchedules[idx], ...updates };
  return { ...feeSchedules[idx] };
}

// ── Treatment Entries ─────────────────────────────────────────────────────────

export async function getTreatmentEntries(patientId: string): Promise<TreatmentEntry[]> {
  await delay();
  return treatmentEntries
    .filter(e => e.patientId === patientId)
    .map(e => ({ ...e }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function addTreatmentEntry(entry: Omit<TreatmentEntry, 'id'>): Promise<TreatmentEntry> {
  await delay();
  const newEntry: TreatmentEntry = {
    ...entry,
    id: `te-${Date.now()}`,
  };
  treatmentEntries.push(newEntry);
  return { ...newEntry };
}

export async function updateTreatmentEntry(id: string, updates: Partial<TreatmentEntry>): Promise<TreatmentEntry> {
  await delay();
  const idx = treatmentEntries.findIndex(e => e.id === id);
  if (idx === -1) throw new Error(`Treatment entry not found: ${id}`);
  treatmentEntries[idx] = { ...treatmentEntries[idx], ...updates };
  return { ...treatmentEntries[idx] };
}

// ── Claims ────────────────────────────────────────────────────────────────────

export async function getClaims(filter?: Partial<{ status: ClaimStatus; patientId: string }>): Promise<Claim[]> {
  await delay();
  let result = [...claims];
  if (filter?.status) result = result.filter(c => c.status === filter.status);
  if (filter?.patientId) result = result.filter(c => c.patientId === filter.patientId);
  return result.map(c => ({ ...c, lines: [...c.lines] }));
}

export async function getClaim(id: string): Promise<Claim> {
  await delay();
  const claim = claims.find(c => c.id === id);
  if (!claim) throw new Error(`Claim not found: ${id}`);
  return { ...claim, lines: [...claim.lines] };
}

export async function createClaim(claim: Omit<Claim, 'id' | 'dateCreated'>): Promise<Claim> {
  await delay();
  const newClaim: Claim = {
    ...claim,
    id: `claim-${Date.now()}`,
    dateCreated: new Date().toISOString().split('T')[0],
  };
  claims.push(newClaim);
  return { ...newClaim, lines: [...newClaim.lines] };
}

export async function updateClaimStatus(id: string, status: ClaimStatus): Promise<Claim> {
  await delay();
  const idx = claims.findIndex(c => c.id === id);
  if (idx === -1) throw new Error(`Claim not found: ${id}`);
  claims[idx] = {
    ...claims[idx],
    status,
    ...(status === 'submitted' && !claims[idx].dateSubmitted
      ? { dateSubmitted: new Date().toISOString().split('T')[0] }
      : {}),
  };
  return { ...claims[idx], lines: [...claims[idx].lines] };
}

// ── ERA ───────────────────────────────────────────────────────────────────────

export async function getRemittanceAdvices(): Promise<RemittanceAdvice[]> {
  await delay();
  return eras.map(e => ({ ...e, claims: [...e.claims] }));
}

export async function postEra(eraId: string): Promise<RemittanceAdvice> {
  await delay();
  const idx = eras.findIndex(e => e.id === eraId);
  if (idx === -1) throw new Error(`ERA not found: ${eraId}`);
  eras[idx] = { ...eras[idx], posted: true };
  // Auto-update related claims to paid
  eras[idx].claims.forEach(ec => {
    const claimIdx = claims.findIndex(c => c.id === ec.claimId);
    if (claimIdx !== -1) {
      claims[claimIdx] = {
        ...claims[claimIdx],
        status: 'paid',
        totalInsurancePaid: ec.totalPaid,
        totalPatientResponsibility: ec.patientResponsibility,
      };
    }
  });
  return { ...eras[idx], claims: [...eras[idx].claims] };
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function getPayments(patientId?: string): Promise<Payment[]> {
  await delay();
  const result = patientId
    ? payments.filter(p => p.patientId === patientId)
    : [...payments];
  return result.map(p => ({ ...p })).sort((a, b) => b.date.localeCompare(a.date));
}

export async function addPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
  await delay();
  const newPayment: Payment = {
    ...payment,
    id: `pay-${Date.now()}`,
  };
  payments.push(newPayment);
  return { ...newPayment };
}

// ── KPI Summary ───────────────────────────────────────────────────────────────

export async function getBillingKpis(): Promise<{
  totalOutstanding: number;
  avgDaysToPayment: number;
  denialRate:       number;
  claimsPending:    number;
}> {
  await delay();

  const nonPaidClaims = claims.filter(c => c.status !== 'paid');
  const totalOutstanding = nonPaidClaims.reduce((sum, c) => sum + c.totalCharged, 0);

  const paidClaims = claims.filter(c => c.status === 'paid' && c.dateSubmitted);
  const avgDaysToPayment = paidClaims.length > 0
    ? Math.round(
        paidClaims.reduce((sum, c) => {
          const submitted = new Date(c.dateSubmitted!);
          const created   = new Date(c.dateCreated);
          return sum + Math.max(0, (submitted.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / paidClaims.length
      )
    : 18;

  const submittedOrMore = claims.filter(c =>
    ['submitted', 'acknowledged', 'pending', 'paid', 'denied', 'rejected', 'appealed'].includes(c.status)
  );
  const deniedClaims = claims.filter(c => c.status === 'denied' || c.status === 'rejected');
  const denialRate = submittedOrMore.length > 0
    ? Math.round((deniedClaims.length / submittedOrMore.length) * 100 * 10) / 10
    : 0;

  const claimsPending = claims.filter(c =>
    ['submitted', 'acknowledged', 'pending'].includes(c.status)
  ).length;

  return { totalOutstanding, avgDaysToPayment, denialRate, claimsPending };
}
