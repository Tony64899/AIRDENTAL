// BillingPage — Phase 6 Billing & Insurance.
// ⚠️ HIPAA: All financial data is PHI. Render only for authenticated users.

import { useState, useEffect } from 'react';
import {
  FileText, Receipt, DollarSign, BookOpen,
  Shield, Tag, Search, Calculator,
} from 'lucide-react';
import type { TreatmentEntry } from '../components/billing/types';
import { MOCK_PATIENTS } from '../constants/mockPatients';
import { getBillingKpis } from '../services/billingService';
import { formatCurrency } from '../utils/formatUtils';

import ClaimsDashboard    from '../components/billing/ClaimsDashboard';
import ClaimDetail        from '../components/billing/ClaimDetail';
import ClaimForm          from '../components/billing/ClaimForm';
import EraProcessor       from '../components/billing/EraProcessor';
import EraDetail          from '../components/billing/EraDetail';
import PaymentHistory     from '../components/billing/PaymentHistory';
import PatientLedger      from '../components/billing/PatientLedger';
import InsuranceCardView  from '../components/billing/InsuranceCardView';
import FeeScheduleManager from '../components/billing/FeeScheduleManager';
import CdtCodeLookup      from '../components/billing/CdtCodeLookup';
import CostEstimator      from '../components/billing/CostEstimator';

type BillingSection = 'claims' | 'era' | 'payments' | 'ledger' | 'insurance' | 'fee' | 'cdt' | 'estimator';

const BILLING_NAV = [
  { id: 'claims',    label: 'Claims',        icon: FileText   },
  { id: 'era',       label: 'ERA / EOB',     icon: Receipt    },
  { id: 'payments',  label: 'Payments',      icon: DollarSign },
  { id: 'ledger',    label: 'Ledger',        icon: BookOpen   },
  { id: 'insurance', label: 'Insurance',     icon: Shield     },
  { id: 'fee',       label: 'Fee Schedules', icon: Tag        },
  { id: 'cdt',       label: 'CDT Codes',     icon: Search     },
  { id: 'estimator', label: 'Estimator',     icon: Calculator },
] as const;

interface KpiData {
  totalOutstanding: number;
  avgDaysToPayment: number;
  denialRate:       number;
  claimsPending:    number;
}

export default function BillingPage() {
  const [section, setSection]                   = useState<BillingSection>('claims');
  const [selectedClaimId, setSelectedClaimId]   = useState<string | null>(null);
  const [selectedEraId, setSelectedEraId]       = useState<string | null>(null);
  const [showClaimForm, setShowClaimForm]       = useState(false);
  const [claimFormEntries, setClaimFormEntries] = useState<TreatmentEntry[] | undefined>();
  const [ledgerPatientId, setLedgerPatientId]   = useState<string>('pat-1');
  const [insurancePatientId, setInsurancePatientId] = useState<string>('pat-1');
  const [kpis, setKpis]                         = useState<KpiData | null>(null);

  useEffect(() => {
    getBillingKpis().then(setKpis);
  }, []);

  const handleNavClick = (id: BillingSection) => {
    setSection(id);
    setSelectedClaimId(null);
    setSelectedEraId(null);
  };

  const renderPatientPicker = (value: string, onChange: (id: string) => void) => (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs font-medium text-[#64748b]">Patient:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
      >
        {MOCK_PATIENTS.map(p => (
          <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — #{p.chartNumber}</option>
        ))}
      </select>
    </div>
  );

  const renderContent = () => {
    if (section === 'claims' && selectedClaimId) {
      return (
        <ClaimDetail
          claimId={selectedClaimId}
          onBack={() => setSelectedClaimId(null)}
        />
      );
    }

    if (section === 'claims') {
      return (
        <ClaimsDashboard
          onViewClaim={id => setSelectedClaimId(id)}
          onCreateClaim={() => { setClaimFormEntries(undefined); setShowClaimForm(true); }}
        />
      );
    }

    if (section === 'era' && selectedEraId) {
      return (
        <EraDetail
          eraId={selectedEraId}
          onBack={() => setSelectedEraId(null)}
          onPost={() => setSelectedEraId(null)}
        />
      );
    }

    if (section === 'era') {
      return <EraProcessor onViewEra={id => setSelectedEraId(id)} />;
    }

    if (section === 'payments') {
      return <PaymentHistory />;
    }

    if (section === 'ledger') {
      return (
        <>
          {renderPatientPicker(ledgerPatientId, setLedgerPatientId)}
          <PatientLedger
            patientId={ledgerPatientId}
            onCreateClaim={entries => {
              setClaimFormEntries(entries);
              setShowClaimForm(true);
            }}
          />
        </>
      );
    }

    if (section === 'insurance') {
      return (
        <>
          {renderPatientPicker(insurancePatientId, setInsurancePatientId)}
          <InsuranceCardView patientId={insurancePatientId} />
        </>
      );
    }

    if (section === 'fee') {
      return <FeeScheduleManager />;
    }

    if (section === 'cdt') {
      return <CdtCodeLookup />;
    }

    if (section === 'estimator') {
      return <CostEstimator />;
    }

    return null;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left nav */}
      <nav className="w-48 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col py-4 overflow-y-auto">
        <p className="px-4 mb-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Billing</p>
        <div className="space-y-0.5">
          {BILLING_NAV.map(({ id, label, icon: Icon }) => {
            const isActive = section === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id as BillingSection)}
                className={[
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-lg mx-2 text-sm transition-colors cursor-pointer w-[calc(100%-16px)]',
                  isActive
                    ? 'bg-[#e0f2fe] text-[#0891b2] font-medium'
                    : 'text-[#64748b] hover:bg-gray-50 hover:text-[#0f172a]',
                ].join(' ')}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
        <div className="p-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-[#0f172a]">Billing &amp; Insurance</h1>
              <p className="text-xs text-[#94a3b8] mt-0.5">Manage claims, ERA, payments, and patient ledgers</p>
            </div>
          </div>

          {/* KPI bar */}
          {kpis && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Outstanding</p>
                  <p className="text-base font-bold text-[#0f172a] leading-tight">{formatCurrency(kpis.totalOutstanding / 100)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Avg Days to Pay</p>
                  <p className="text-base font-bold text-[#0f172a] leading-tight">{kpis.avgDaysToPayment}d</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Denial Rate</p>
                  <p className="text-base font-bold text-[#0f172a] leading-tight">{kpis.denialRate}%</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Claims Pending</p>
                  <p className="text-base font-bold text-[#0f172a] leading-tight">{kpis.claimsPending}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section content */}
          {renderContent()}
        </div>
      </div>

      {/* Claim form overlay */}
      {showClaimForm && (
        <ClaimForm
          initialEntries={claimFormEntries}
          onSubmit={claim => {
            setShowClaimForm(false);
            setSection('claims');
            setSelectedClaimId(claim.id);
          }}
          onClose={() => setShowClaimForm(false)}
        />
      )}
    </div>
  );
}
