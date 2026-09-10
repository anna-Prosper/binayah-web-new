/**
 * deal-check/types.ts — the contract between the parser, the engine and the UI.
 */

export type DealPurchaseType = "ready" | "off-plan";
export type DealPropertyKind = "apartment" | "villa" | "townhouse" | "penthouse" | "plot" | "commercial";

/** What we managed to establish about the property, however it was submitted. */
export interface DealInput {
  price: number | null;
  areaSqft: number | null;
  bedrooms: number | null; // 0 = studio
  community: string | null;
  building: string | null;
  propertyKind: DealPropertyKind | null;
  purchaseType: DealPurchaseType | null;
  /** Advertised annual rent, when the source stated one. */
  statedRent: number | null;
  /** Developer payment plan, off-plan only. */
  paymentPlan: PaymentPlanStep[] | null;
  handover: string | null;
  developer: string | null;
  /** Buyer intends to finance — drives mortgage cost lines and LTV. */
  mortgage: boolean;
  downPaymentPct: number | null;
  sourceUrl: string | null;
}

export interface PaymentPlanStep {
  label: string;
  percentage: number | null;
  amount: number | null;
  /** "booking" | "construction" | "handover" | "post-handover" */
  phase: string;
}

/** A single money line in the cash-required or rental breakdown. */
export interface CostLine {
  label: string;
  amount: number;
  note: string;
  /** Market convention rather than a statutory rate. */
  convention?: boolean;
  /** Range where the true figure varies (NOC, valuation). */
  range?: { min: number; max: number };
}

export interface PriceAssessment {
  verdict: "well-below" | "below" | "in-line" | "above" | "well-above" | "unknown";
  /** Subject price per sqft. */
  subjectPsf: number | null;
  /** DLD median PSF for the matched comparable set. */
  comparablePsf: number | null;
  /** Signed fraction: +0.08 = 8% above the comparable median. */
  deltaPct: number | null;
  /** Median transacted price for the same type + bedroom count. */
  comparableMedianPrice: number | null;
  sampleSize: number | null;
  confidence: "strong" | "usable" | "thin" | "none";
  comparableLabel: string | null;
  /** Plain-language reading of the gap, written by the engine not the model. */
  summary: string;
  source: string | null;
  periodLabel: string | null;
}

export interface CashRequired {
  lines: CostLine[];
  /** Cash to complete a ready purchase, or to reach handover on off-plan. */
  total: number;
  /** Ready: price + costs. Off-plan: total contract + costs. */
  totalWithPrice: number;
  /** Off-plan only — the staged view. */
  schedule: CashScheduleStage[] | null;
  /** Financed purchases: the loan and the deposit it implies. */
  financing: {
    loanAmount: number;
    downPayment: number;
    ltv: number;
    ltvCapped: boolean;
  } | null;
}

export interface CashScheduleStage {
  label: string;
  amount: number;
  /** Costs that fall due at this stage on top of the instalment. */
  extras: CostLine[];
  cumulative: number;
  timing: string;
}

export interface RentalEconomics {
  /** Annual gross rent — stated by the listing, or modelled from DLD rent PSF. */
  grossRent: number | null;
  grossRentSource: "stated" | "dld-modelled" | "none";
  serviceCharge: number | null;
  serviceChargePsf: number | null;
  deductions: CostLine[];
  netIncome: number | null;
  grossYieldPct: number | null;
  netYieldPct: number | null;
  /** Net yield against total cash in (price + purchase costs), not just price. */
  netYieldOnCashPct: number | null;
  /** DLD's own area gross yield, for cross-checking our model. */
  areaGrossYieldPct: number | null;
  confidence: "strong" | "usable" | "thin" | "none";
  assumptions: string[];
}

export interface DealQuestion {
  question: string;
  why: string;
  /** "payment" | "costs" | "condition" | "legal" | "rental" | "market" */
  category: string;
  /** True when this is a material red flag rather than routine diligence. */
  priority: boolean;
}

export interface DealAlternative {
  name: string;
  kind: "project" | "listing";
  slug: string | null;
  community: string | null;
  price: number | null;
  areaSqft: number | null;
  bedrooms: number | null;
  pricePsf: number | null;
  developer: string | null;
  handover: string | null;
  /** Why this is worth comparing against the subject — engine-written. */
  rationale: string;
  url: string | null;
  image: string | null;
}

/**
 * Assessment of a RENTAL listing — asking rent against median registered
 * Ejari contracts for the area. A separate product from the purchase report:
 * a tenant is answering "is this rent fair?", not "is this a good buy?".
 */
export interface RentAssessment {
  verdict: "well-below" | "below" | "in-line" | "above" | "well-above" | "unknown";
  askingRent: number | null;
  /** Asking rent per sqft, the comparable unit. */
  askingRentPsf: number | null;
  /** Median registered Ejari rent per sqft for the area. */
  marketRentPsf: number | null;
  /** What the area median implies this unit should rent for. */
  impliedMarketRent: number | null;
  deltaPct: number | null;
  sampleSize: number | null;
  confidence: "strong" | "usable" | "thin" | "none";
  areaName: string | null;
  summary: string;
  /** What buying the same unit would cost, from area sale PSF. */
  impliedPurchasePrice: number | null;
  /** Gross yield the asking rent implies against that price. */
  impliedGrossYieldPct: number | null;
  /** Tenant-side costs and diligence, not a buyer's. */
  questions: DealQuestion[];
}

export interface DealCheckReport {
  input: DealInput;
  /** What the parser could not establish — drives the "what's missing" prompts. */
  missing: string[];
  price: PriceAssessment;
  cash: CashRequired;
  rental: RentalEconomics;
  questions: DealQuestion[];
  alternatives: DealAlternative[];
  /** One-paragraph read of the deal. */
  verdict: string;
  /** Every assumption used, for the disclosure panel. */
  assumptions: CostLine[];
  dataAsOf: string | null;
  generatedAt: string;
}
