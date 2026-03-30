// mockData.ts — mock billing data for Phase 6 development.
// ⚠️ HIPAA: All patient names, insurance IDs, and claim IDs are fictional.

import type {
  CdtCode,
  FeeSchedule,
  TreatmentEntry,
  Claim,
  Payment,
  RemittanceAdvice,
} from './types';

// ── CDT Codes ──────────────────────────────────────────────────────────────────

export const CDT_CODES: CdtCode[] = [
  // Diagnostic
  { code: 'D0120', category: 'Diagnostic', description: 'Periodic oral evaluation — established patient',         layperson: 'Routine dental checkup',                  defaultFee: 5500  },
  { code: 'D0150', category: 'Diagnostic', description: 'Comprehensive oral evaluation — new or established',     layperson: 'New patient comprehensive exam',           defaultFee: 9500  },
  { code: 'D0210', category: 'Diagnostic', description: 'Intraoral — complete series of radiographic images',      layperson: 'Full set of dental X-rays',               defaultFee: 14000 },
  { code: 'D0220', category: 'Diagnostic', description: 'Intraoral — periapical first radiographic image',         layperson: 'Single tooth X-ray',                      defaultFee: 2500  },
  { code: 'D0274', category: 'Diagnostic', description: 'Bitewing radiographic image — four images',               layperson: 'Cavity-checking X-rays (4 images)',        defaultFee: 7500  },
  // Preventive
  { code: 'D1110', category: 'Preventive', description: 'Prophylaxis — adult',                                     layperson: 'Professional teeth cleaning (adult)',      defaultFee: 13500 },
  { code: 'D1120', category: 'Preventive', description: 'Prophylaxis — child',                                     layperson: 'Professional teeth cleaning (child)',      defaultFee: 9500  },
  { code: 'D1206', category: 'Preventive', description: 'Topical application of fluoride varnish',                 layperson: 'Fluoride varnish treatment',               defaultFee: 4500  },
  // Restorative
  { code: 'D2140', category: 'Restorative', description: 'Amalgam restoration — one surface, primary or permanent', layperson: 'Silver filling (1 surface)',               defaultFee: 15000 },
  { code: 'D2150', category: 'Restorative', description: 'Amalgam restoration — two surfaces, primary or permanent',layperson: 'Silver filling (2 surfaces)',              defaultFee: 19500 },
  { code: 'D2330', category: 'Restorative', description: 'Resin-based composite — one surface, anterior',           layperson: 'Tooth-colored filling, front tooth (1 surface)', defaultFee: 16500 },
  { code: 'D2331', category: 'Restorative', description: 'Resin-based composite — two surfaces, anterior',          layperson: 'Tooth-colored filling, front tooth (2 surfaces)', defaultFee: 21000 },
  { code: 'D2391', category: 'Restorative', description: 'Resin-based composite — one surface, posterior',          layperson: 'Tooth-colored filling, back tooth (1 surface)', defaultFee: 19000 },
  { code: 'D2392', category: 'Restorative', description: 'Resin-based composite — two surfaces, posterior',         layperson: 'Tooth-colored filling, back tooth (2 surfaces)', defaultFee: 23500 },
  { code: 'D2740', category: 'Restorative', description: 'Crown — porcelain/ceramic substrate',                     layperson: 'All-ceramic crown',                       defaultFee: 135000 },
  { code: 'D2750', category: 'Restorative', description: 'Crown — porcelain fused to high noble metal',             layperson: 'Porcelain-fused-to-metal crown',           defaultFee: 145000 },
  // Endodontics
  { code: 'D3310', category: 'Endodontics', description: 'Endodontic therapy, anterior tooth',                      layperson: 'Root canal, front tooth',                 defaultFee: 90000  },
  { code: 'D3320', category: 'Endodontics', description: 'Endodontic therapy, premolar tooth',                      layperson: 'Root canal, premolar tooth',               defaultFee: 100000 },
  { code: 'D3330', category: 'Endodontics', description: 'Endodontic therapy, molar tooth',                         layperson: 'Root canal, back molar tooth',             defaultFee: 125000 },
  // Periodontics
  { code: 'D4341', category: 'Periodontics', description: 'Periodontal scaling and root planing — four or more teeth per quadrant', layperson: 'Deep cleaning, one area of the mouth', defaultFee: 32000 },
  { code: 'D4910', category: 'Periodontics', description: 'Periodontal maintenance',                                layperson: 'Periodontal maintenance cleaning',         defaultFee: 15500 },
  // Oral Surgery
  { code: 'D7140', category: 'Oral Surgery', description: 'Extraction, erupted tooth or exposed root',              layperson: 'Simple tooth removal',                    defaultFee: 19000 },
  { code: 'D7210', category: 'Oral Surgery', description: 'Extraction, erupted tooth requiring removal of bone',    layperson: 'Surgical tooth removal',                  defaultFee: 35000 },
  { code: 'D7240', category: 'Oral Surgery', description: 'Removal of impacted tooth — completely bony',            layperson: 'Wisdom tooth removal (impacted)',          defaultFee: 55000 },
  // Other Services
  { code: 'D9110', category: 'Other Services', description: 'Palliative (emergency) treatment of dental pain',      layperson: 'Emergency pain relief visit',             defaultFee: 8500  },
  { code: 'D9230', category: 'Other Services', description: 'Inhalation of nitrous oxide/anxiolysis, analgesia',    layperson: 'Laughing gas (nitrous oxide)',             defaultFee: 12000 },
];

// ── Fee Schedules ──────────────────────────────────────────────────────────────

export const FEE_SCHEDULES: FeeSchedule[] = [
  {
    id:            'fs-1',
    name:          'UCR 2026',
    type:          'UCR',
    effectiveDate: '2026-01-01',
    fees: CDT_CODES.map(c => ({ cdtCode: c.code, allowedAmount: c.defaultFee })),
  },
  {
    id:            'fs-2',
    name:          'Delta Dental PPO',
    type:          'Insurance',
    effectiveDate: '2026-01-01',
    fees: CDT_CODES.map(c => ({ cdtCode: c.code, allowedAmount: Math.round(c.defaultFee * 0.80) })),
  },
  {
    id:            'fs-3',
    name:          'MetLife DHMO',
    type:          'Insurance',
    effectiveDate: '2026-01-01',
    fees: CDT_CODES.map(c => ({ cdtCode: c.code, allowedAmount: Math.round(c.defaultFee * 0.65) })),
  },
];

// ── Treatment Entries ──────────────────────────────────────────────────────────

export const TREATMENT_ENTRIES: TreatmentEntry[] = [
  // pat-1: John Smith
  {
    id: 'te-1-1', patientId: 'pat-1', providerId: 'prov-1',
    date: '2026-03-30', cdtCode: 'D0120', description: 'Periodic oral evaluation — established patient',
    fee: 5500, status: 'completed',
  },
  {
    id: 'te-1-2', patientId: 'pat-1', providerId: 'prov-1',
    date: '2023-06-15', toothNumber: 30, surfaces: ['O', 'B'],
    cdtCode: 'D2750', description: 'Crown — porcelain fused to high noble metal',
    fee: 145000, insurancePaid: 72500, status: 'billed', claimId: 'claim-1',
  },
  {
    id: 'te-1-3', patientId: 'pat-1', providerId: 'prov-1',
    date: '2025-09-10', cdtCode: 'D0274', description: 'Bitewing radiographic image — four images',
    fee: 7500, insurancePaid: 7500, patientPaid: 0, status: 'paid', claimId: 'claim-2',
  },
  {
    id: 'te-1-4', patientId: 'pat-1', providerId: 'prov-1',
    date: '2026-04-15', cdtCode: 'D1110', description: 'Prophylaxis — adult',
    fee: 13500, status: 'planned',
  },

  // pat-3: Michael Brown
  {
    id: 'te-3-1', patientId: 'pat-3', providerId: 'prov-2',
    date: '2026-03-30', toothNumber: 19, surfaces: ['M', 'D', 'O'],
    cdtCode: 'D3330', description: 'Endodontic therapy, molar tooth',
    fee: 125000, status: 'billed', claimId: 'claim-3',
  },
  {
    id: 'te-3-2', patientId: 'pat-3', providerId: 'prov-2',
    date: '2026-03-30', cdtCode: 'D0120', description: 'Periodic oral evaluation — established patient',
    fee: 5500, status: 'completed',
  },
  {
    id: 'te-3-3', patientId: 'pat-3', providerId: 'prov-2',
    date: '2025-11-08', cdtCode: 'D1110', description: 'Prophylaxis — adult',
    fee: 13500, insurancePaid: 13500, patientPaid: 0, status: 'paid', claimId: 'claim-4',
  },

  // pat-5: Oliver Wilson
  {
    id: 'te-5-1', patientId: 'pat-5', providerId: 'prov-3',
    date: '2026-03-30', toothNumber: 3,
    cdtCode: 'D6010', description: 'Surgical placement: endosteal implant',
    fee: 350000, status: 'billed', claimId: 'claim-5',
  },
  {
    id: 'te-5-2', patientId: 'pat-5', providerId: 'prov-3',
    date: '2024-09-12', toothNumber: 14,
    cdtCode: 'D2740', description: 'Crown — porcelain/ceramic substrate',
    fee: 135000, insurancePaid: 67500, patientPaid: 67500, status: 'paid', claimId: 'claim-4',
  },

  // pat-7: William Garcia
  {
    id: 'te-7-1', patientId: 'pat-7', providerId: 'prov-3',
    date: '2025-07-22', toothNumber: 12, surfaces: ['O'],
    cdtCode: 'D2391', description: 'Resin-based composite — one surface, posterior',
    fee: 19000, insurancePaid: 15200, patientPaid: 3800, status: 'paid',
  },
  {
    id: 'te-7-2', patientId: 'pat-7', providerId: 'prov-3',
    date: '2025-12-12', cdtCode: 'D0120', description: 'Periodic oral evaluation — established patient',
    fee: 5500, status: 'completed',
  },

  // pat-9: Mia Anderson
  {
    id: 'te-9-1', patientId: 'pat-9', providerId: 'prov-2',
    date: '2025-05-15', cdtCode: 'D4341', description: 'Periodontal scaling and root planing — four or more teeth per quadrant',
    fee: 32000, status: 'billed', claimId: 'claim-5',
  },
  {
    id: 'te-9-2', patientId: 'pat-9', providerId: 'prov-2',
    date: '2025-11-20', cdtCode: 'D1110', description: 'Prophylaxis — adult',
    fee: 13500, insurancePaid: 13500, patientPaid: 0, status: 'paid',
  },
];

// ── Claims ─────────────────────────────────────────────────────────────────────

export const CLAIMS: Claim[] = [
  {
    id: 'claim-1',
    patientId: 'pat-1',
    patientName: 'John Smith',
    insurancePlanId: 'DDL-882134',
    insuranceName: 'Delta Dental PPO',
    claimType: 'P',
    status: 'denied',
    dateCreated: '2023-07-01',
    dateSubmitted: '2023-07-01',
    totalCharged: 145000,
    totalAllowed: 0,
    totalInsurancePaid: 0,
    totalPatientResponsibility: 145000,
    lines: [
      {
        lineNumber: 1,
        dateOfService: '2023-06-15',
        cdtCode: 'D2750',
        toothNumber: 30,
        surfaces: ['O', 'B'],
        fee: 145000,
        status: 'denied',
        allowedAmount: 0,
        insurancePaid: 0,
        adjustmentAmount: 145000,
        adjustmentReason: 'Crown not covered — frequency limitation (1 per 5 years)',
        patientResponsibility: 145000,
      },
    ],
    notes: 'Denied due to frequency limitation. Patient last had crown on tooth 30 in 2019.',
  },
  {
    id: 'claim-2',
    patientId: 'pat-1',
    patientName: 'John Smith',
    insurancePlanId: 'DDL-882134',
    insuranceName: 'Delta Dental PPO',
    claimType: 'P',
    status: 'paid',
    dateCreated: '2025-09-15',
    dateSubmitted: '2025-09-15',
    totalCharged: 7500,
    totalAllowed: 7500,
    totalInsurancePaid: 7500,
    totalPatientResponsibility: 0,
    lines: [
      {
        lineNumber: 1,
        dateOfService: '2025-09-10',
        cdtCode: 'D0274',
        fee: 7500,
        status: 'paid',
        allowedAmount: 7500,
        insurancePaid: 7500,
        adjustmentAmount: 0,
        patientResponsibility: 0,
      },
    ],
  },
  {
    id: 'claim-3',
    patientId: 'pat-3',
    patientName: 'Michael Brown',
    insurancePlanId: 'BCBS-776512',
    insuranceName: 'BlueCross BlueShield Dental',
    claimType: 'P',
    status: 'submitted',
    dateCreated: '2026-03-30',
    dateSubmitted: '2026-03-30',
    totalCharged: 125000,
    lines: [
      {
        lineNumber: 1,
        dateOfService: '2026-03-30',
        cdtCode: 'D3330',
        toothNumber: 19,
        surfaces: ['M', 'D', 'O'],
        fee: 125000,
        status: 'pending',
      },
    ],
  },
  {
    id: 'claim-4',
    patientId: 'pat-3',
    patientName: 'Michael Brown',
    insurancePlanId: 'BCBS-776512',
    insuranceName: 'BlueCross BlueShield Dental',
    claimType: 'P',
    status: 'paid',
    dateCreated: '2025-11-08',
    dateSubmitted: '2025-11-08',
    totalCharged: 13500,
    totalAllowed: 13500,
    totalInsurancePaid: 13500,
    totalPatientResponsibility: 0,
    lines: [
      {
        lineNumber: 1,
        dateOfService: '2025-11-08',
        cdtCode: 'D1110',
        fee: 13500,
        status: 'paid',
        allowedAmount: 13500,
        insurancePaid: 13500,
        adjustmentAmount: 0,
        patientResponsibility: 0,
      },
    ],
  },
  {
    id: 'claim-5',
    patientId: 'pat-5',
    patientName: 'Oliver Wilson',
    insurancePlanId: 'MET-223345',
    insuranceName: 'MetLife Dental',
    claimType: 'P',
    status: 'pending',
    dateCreated: '2026-03-30',
    dateSubmitted: '2026-03-30',
    totalCharged: 350000,
    lines: [
      {
        lineNumber: 1,
        dateOfService: '2026-03-30',
        cdtCode: 'D6010',
        toothNumber: 3,
        fee: 350000,
        status: 'pending',
      },
    ],
    notes: 'Pre-authorization required for implant placement. Narrative submitted.',
  },
];

// ── ERA / Remittance Advices ────────────────────────────────────────────────────

export const REMITTANCE_ADVICES: RemittanceAdvice[] = [
  {
    id: 'era-1',
    receivedDate: '2025-09-22',
    payerName: 'Delta Dental PPO',
    checkNumber: 'DDL-442891',
    checkDate: '2025-09-20',
    totalPaid: 750000,
    posted: true,
    claims: [
      {
        claimId: 'claim-2',
        patientName: 'John Smith',
        dateOfService: '2025-09-10',
        totalCharged: 7500,
        totalAllowed: 7500,
        totalPaid: 7500,
        patientResponsibility: 0,
        adjustments: [],
        lineDetails: [
          {
            cdtCode: 'D0274',
            charged: 7500,
            allowed: 7500,
            paid: 7500,
            adjustments: [],
          },
        ],
      },
    ],
  },
  {
    id: 'era-2',
    receivedDate: '2025-11-15',
    payerName: 'BlueCross BlueShield Dental',
    checkNumber: 'BCBS-331120',
    checkDate: '2025-11-14',
    totalPaid: 1350000,
    posted: false,
    claims: [
      {
        claimId: 'claim-4',
        patientName: 'Michael Brown',
        dateOfService: '2025-11-08',
        totalCharged: 13500,
        totalAllowed: 13500,
        totalPaid: 13500,
        patientResponsibility: 0,
        adjustments: [
          {
            reasonCode: '45',
            groupCode: 'CO',
            amount: 0,
            description: 'Charge exceeds fee schedule/maximum allowable',
          },
        ],
        lineDetails: [
          {
            cdtCode: 'D1110',
            charged: 13500,
            allowed: 13500,
            paid: 13500,
            adjustments: [
              {
                reasonCode: '45',
                groupCode: 'CO',
                amount: 0,
                description: 'Charge exceeds fee schedule/maximum allowable',
              },
            ],
          },
        ],
      },
    ],
  },
];

// ── Payments ───────────────────────────────────────────────────────────────────

export const PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    patientId: 'pat-1',
    patientName: 'John Smith',
    date: '2026-03-30',
    amount: 5500,
    method: 'CreditCard',
    referenceNumber: 'CC-8821',
    appliedTo: [{ treatmentEntryId: 'te-1-1', amount: 5500 }],
    postedBy: 'Dr. Sarah Chen',
    notes: 'Copay for periodic exam',
  },
  {
    id: 'pay-2',
    patientId: 'pat-3',
    patientName: 'Michael Brown',
    date: '2025-11-15',
    amount: 12000,
    method: 'Check',
    referenceNumber: 'CHK-4412',
    appliedTo: [{ treatmentEntryId: 'te-3-1', amount: 12000 }],
    postedBy: 'Front Desk',
    notes: 'Patient payment — Check #4412',
  },
  {
    id: 'pay-3',
    patientId: 'pat-5',
    patientName: 'Oliver Wilson',
    date: '2025-10-01',
    amount: 15000,
    method: 'ACH',
    referenceNumber: 'ACH-20251001',
    appliedTo: [{ treatmentEntryId: 'te-5-1', amount: 15000 }],
    postedBy: 'Front Desk',
    notes: 'Payment plan installment 1',
  },
  {
    id: 'pay-4',
    patientId: 'pat-5',
    patientName: 'Oliver Wilson',
    date: '2025-11-01',
    amount: 7000,
    method: 'ACH',
    referenceNumber: 'ACH-20251101',
    appliedTo: [{ treatmentEntryId: 'te-5-1', amount: 7000 }],
    postedBy: 'Front Desk',
    notes: 'Payment plan installment 2',
  },
  {
    id: 'pay-5',
    patientId: 'pat-7',
    patientName: 'William Garcia',
    date: '2025-08-15',
    amount: 2500,
    method: 'Cash',
    appliedTo: [{ treatmentEntryId: 'te-7-1', amount: 2500 }],
    postedBy: 'Dr. Emily White',
    notes: 'Cash payment',
  },
  {
    id: 'pay-6',
    patientId: 'pat-9',
    patientName: 'Mia Anderson',
    date: '2025-06-10',
    amount: 7000,
    method: 'DebitCard',
    referenceNumber: 'DC-55210',
    appliedTo: [{ treatmentEntryId: 'te-9-1', amount: 7000 }],
    postedBy: 'Front Desk',
    notes: 'Partial payment on SRP balance',
  },
  {
    id: 'pay-7',
    patientId: 'pat-1',
    patientName: 'John Smith',
    date: '2025-10-15',
    amount: 15000,
    method: 'CareCredit',
    referenceNumber: 'CC-CARE-9981',
    appliedTo: [{ treatmentEntryId: 'te-1-2', amount: 15000 }],
    postedBy: 'Front Desk',
    notes: 'CareCredit financing — partial payment on crown',
  },
  {
    id: 'pay-8',
    patientId: 'pat-3',
    patientName: 'Michael Brown',
    date: '2026-03-30',
    amount: 5500,
    method: 'Cash',
    appliedTo: [{ treatmentEntryId: 'te-3-2', amount: 5500 }],
    postedBy: 'Dr. Michael Torres',
    notes: 'Cash payment for periodic exam',
  },
];

// ── Convenience lookups ────────────────────────────────────────────────────────

export const CDT_BY_CODE: Record<string, CdtCode> = Object.fromEntries(
  CDT_CODES.map(c => [c.code, c])
);

export const FEE_SCHEDULE_MAP: Record<string, FeeSchedule> = Object.fromEntries(
  FEE_SCHEDULES.map(f => [f.id, f])
);
