# Page Prompt 05 — Insurance & Billing
# 저장 경로: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\prompts\05_billing.md
# 사용법: MASTER_PROMPT.md 복붙 후 이 내용을 아래에 이어 붙여넣으세요.

---

```
Now let's build Page 05: Insurance & Billing for Air Dental.

## Goal
A complete dental insurance claim and billing management system.

## Key Concepts (I am the dentist — here is the clinical context)
- CDT codes = Current Dental Terminology (e.g. D0120 = periodic exam, D2750 = crown)
- ADA Claim Form = standard paper/electronic claim form
- Clearinghouse = middleman between us and insurance companies (e.g. Availity, Tesia)
- ERA = Electronic Remittance Advice (insurance payment explanation)
- EOB = Explanation of Benefits (patient version)
- Primary vs Secondary insurance (patient may have two insurances)

## Pages / Sections
1. Create Claim — select patient, date, provider, CDT codes, fees
2. Claims Tracker — list of all claims with status (pending, paid, denied, resubmit)
3. Payment Posting — record insurance payments + patient payments
4. Insurance Companies — manage Delta Dental, MetLife, Cigna, Aetna, etc.
5. Patient Ledger — running balance per patient

## Requirements
- CDT code search/lookup (type D0 → shows matching codes with descriptions)
- ADA 2012 claim form preview before submission
- 👨‍💻 BIL: Clearinghouse API integration (Availity or Tesia) for electronic submission
- ERA auto-import and payment posting
- Aging report (30/60/90 days outstanding)
- Patient responsibility calculation after insurance

## File paths to create
frontend\src\pages\BillingPage.tsx
frontend\src\components\billing\CreateClaimForm.tsx
frontend\src\components\billing\ClaimsTracker.tsx
frontend\src\components\billing\PaymentPosting.tsx
frontend\src\components\billing\CdtCodeSearch.tsx
frontend\src\components\billing\PatientLedger.tsx
frontend\src\hooks\useBilling.ts
backend\src\billing\billing.controller.ts
backend\src\billing\billing.service.ts
backend\src\billing\claim.entity.ts
backend\src\billing\payment.entity.ts

## Start here
Build CreateClaimForm.tsx with CDT code search first.
This is the most used feature — get this right first.
```
