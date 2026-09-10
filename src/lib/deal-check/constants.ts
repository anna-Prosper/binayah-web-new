/**
 * deal-check/constants.ts
 *
 * Canonical Dubai transaction-cost and running-cost assumptions for Binayah
 * Deal Check. Every figure the tool shows a visitor traces back to a constant
 * here, and every constant carries the source it came from — the UI renders
 * `note` verbatim in the assumptions panel, so a visitor can audit any number
 * without asking us.
 *
 * Rates are statutory unless `convention: true`, which marks a market norm that
 * is negotiable in practice (agency commission, management fees, vacancy).
 * Keep that distinction — the report leans on it to separate "this is the law"
 * from "this is what people usually pay".
 */

export interface CostRate {
  /** Fraction of price (0.04 = 4%) — mutually exclusive with `amount`. */
  rate?: number;
  /** Flat AED amount — mutually exclusive with `rate`. */
  amount?: number;
  label: string;
  note: string;
  /** True = market convention, negotiable. False/absent = statutory. */
  convention?: boolean;
}

export const VAT = 0.05;

/** DLD transfer fee. 4% of price, buyer-paid by convention (statute splits
 *  2%/2% buyer/seller but Dubai practice is buyer pays all — the report says so). */
export const DLD_TRANSFER: CostRate = {
  rate: 0.04,
  label: "DLD transfer fee",
  note: "4% of the purchase price, paid to Dubai Land Department. Legally split 2% buyer / 2% seller, but in practice the buyer pays the full 4% in almost every Dubai deal.",
};

/**
 * DLD admin + title deed bundle. DLD's published schedule is AED 250 title
 * deed + 250 map + 10 knowledge + 10 innovation; the widely-quoted "AED 580"
 * is that bundle, not a standalone title-deed fee. We bundle it the same way
 * so the total matches what a buyer is actually invoiced.
 */
export const DLD_ADMIN_BUNDLE = 580;

/** Off-plan registers through Oqood, whose admin charge is only AED 40. */
export const OQOOD_ADMIN = 40;

/**
 * Trustee ("service partner") fee, tiered at AED 500k, plus 5% VAT.
 * NOTE: this is the SAME line item as the AED 2,000/4,000 charge some sources
 * present separately as a "DLD admin fee" — counting both double-charges the
 * buyer by up to AED 4,200. Source: DLD Property Sale Registration schedule.
 */
export const TRUSTEE_BELOW = 2000;
export const TRUSTEE_ABOVE = 4000;
export const TRUSTEE_THRESHOLD = 500_000;

/** Developer's own off-plan registration/admin charge — varies by developer. */
export const DEVELOPER_OQOOD_ADMIN_TYPICAL = 3000;
export const DEVELOPER_OQOOD_ADMIN_MIN = 1000;
export const DEVELOPER_OQOOD_ADMIN_MAX = 6000;

/** Agency commission — 2% + VAT is the Dubai norm on secondary sales.
 *  Off-plan is developer-paid, so the buyer's line is zero. */
export const AGENCY_COMMISSION: CostRate = {
  rate: 0.02,
  label: "Agency commission",
  note: "2% of the purchase price plus 5% VAT, the standard Dubai brokerage fee on a resale. On off-plan the developer pays the agency, so a buyer purchasing directly pays nothing here.",
  convention: true,
};

/** NOC — developer's no-objection certificate, secondary only. Wide range. */
export const NOC_FEE_MIN = 500;
export const NOC_FEE_MAX = 5000;
export const NOC_FEE_TYPICAL = 1750;

/** Mortgage costs, only applied when the buyer finances. */
export const MORTGAGE_REGISTRATION_RATE = 0.0025; // 0.25% of loan
export const MORTGAGE_REGISTRATION_ADMIN = 290;
export const BANK_ARRANGEMENT_RATE = 0.01; // ~1% of loan, often negotiable
export const VALUATION_FEE_TYPICAL = 3000; // AED 2,500–3,500 + VAT

/**
 * Loan-to-value caps, expat first purchase (UAE Central Bank).
 * Sources vary between 75% and 80% under AED 5M; we take the conservative 75%
 * so the tool never understates the deposit a buyer has to find.
 */
export const LTV_EXPAT_UNDER_5M = 0.75;
export const LTV_EXPAT_OVER_5M = 0.65;
export const LTV_OFF_PLAN = 0.5;
export const LTV_PRICE_THRESHOLD = 5_000_000;

/**
 * THE most important financing rule in this tool.
 *
 * Since 1 February 2025 (CBUAE directive), the 4% DLD transfer fee and the 2%
 * agency commission may NO LONGER be financed into a mortgage. Banks used to
 * lend ~80% of those costs; buyers must now find the full ~6% in liquid cash
 * on top of the deposit. Reported to have affected roughly 70% of secondary
 * mortgage buyers. Every cash figure this tool produces must treat purchase
 * costs as 100% cash — never netted into the loan.
 */
export const COSTS_MUST_BE_CASH = true;
export const COSTS_CASH_RULE_NOTE =
  "Since February 2025 the UAE Central Bank no longer allows the 4% DLD fee or the agency commission to be added to a mortgage. These have to be paid in cash on top of your deposit — the change caught out a lot of buyers who had budgeted the old way.";

/**
 * Annual service charge, AED per sqft, by community.
 *
 * IMPORTANT HONESTY CAVEAT, surfaced to the user verbatim in the UI:
 * DLD's Service Charge Index is published **per building**, not per community
 * — there is no official community-average table anywhere, and no public feed
 * we can query. Every figure below is therefore a planning estimate derived
 * from brokerage data, and real buildings vary enormously within one community
 * (Damac Hills alone spans roughly 3.8 to 19.5 AED/sqft). Brokerage area
 * estimates also skew high against real Mollak statements, so these sit toward
 * the lower, corroborated end of the published bands.
 *
 * The biggest single driver of the spread is whether district cooling is
 * bundled into the charge or billed separately.
 *
 * Always point the buyer at their actual building on the DLD index:
 * https://dubailand.gov.ae/en/eservices/service-charge-index-overview/service-charge-index
 */
export const SERVICE_CHARGE_PSF: Record<string, number> = {
  // ── Apartment communities ────────────────────────────────────────────────
  "downtown dubai": 20,
  "burj khalifa": 20,
  "dubai marina": 17,
  "marsa dubai": 17,
  "business bay": 16,
  "jumeirah lake towers": 14,
  "jlt": 14,
  "jumeirah village circle": 12,
  "jvc": 12,
  "jumeirah village triangle": 12,
  "jvt": 12,
  "dubai sports city": 12,
  "the greens": 15,
  "the views": 16,
  "dubai creek harbour": 17,
  "city walk": 21,
  "bluewaters": 24,
  "dubai south": 10,
  "madinat al mataar": 10,
  "jumeirah beach residence": 18,
  "jbr": 18,
  "dubai silicon oasis": 10,
  "international city": 8,
  "discovery gardens": 9,
  "al furjan": 12,
  "meydan": 14,
  "mohammed bin rashid city": 16,
  "hadaeq sheikh mohammed bin rashid": 16,
  "dubai islands": 15,
  "za'abeel": 20,
  "zabeel": 20,
  // Palm Jumeirah sources conflict badly (10-15 vs 25-38), largely because
  // apartments and villas get averaged together. Mid-band for apartments.
  "palm jumeirah": 18,
  "nakhlat jumeira": 18,
  // Dubai Hills apartments run ~20; its villas are 3-4 and handled below.
  "dubai hills estate": 18,
  "dubai hills": 18,
  // ── Villa / townhouse communities — ALREADY villa rates ──────────────────
  "arabian ranches": 3.5,
  "emirates hills": 6,
  "damac hills": 9,
  "damac hills 2": 5,
  "town square": 6,
  "mudon": 6,
  "the valley": 5,
  "tilal al ghaf": 9,
  "DEFAULT": 14,
};

/**
 * Communities whose figure above is ALREADY a villa rate — applying the villa
 * multiplier on top would understate the charge by a further 40%.
 */
export const VILLA_RATE_COMMUNITIES = new Set([
  "arabian ranches",
  "emirates hills",
  "damac hills",
  "damac hills 2",
  "town square",
  "mudon",
  "the valley",
  "tilal al ghaf",
]);

export const DLD_SERVICE_CHARGE_INDEX_URL =
  "https://dubailand.gov.ae/en/eservices/service-charge-index-overview/service-charge-index";

/** Villas/townhouses carry lower per-sqft charges than towers — no shared
 *  cooling plant, lifts or lobby. Applied as a multiplier to the area figure. */
export const VILLA_SERVICE_CHARGE_MULTIPLIER = 0.6;

/** Running-cost conventions for the rental model. All negotiable/variable, so
 *  each is surfaced as an editable assumption in the UI. */
export const VACANCY_ALLOWANCE: CostRate = {
  rate: 0.04,
  label: "Vacancy allowance",
  note: "About two weeks a year empty between tenancies — roughly 4% of gross rent. Dubai leases are annual, so a unit that re-lets immediately may lose nothing, while a slow re-let can cost far more.",
  convention: true,
};

export const MANAGEMENT_FEE: CostRate = {
  rate: 0.05,
  label: "Property management",
  note: "5% of collected rent, the usual Dubai agency rate for a managed unit. Self-managing landlords save this but take on tenant handling, maintenance and Ejari renewals.",
  convention: true,
};

/**
 * Maintenance reserve, as a share of GROSS RENT (not property value).
 *
 * The common "1% of property value" rule of thumb is a US import and travels
 * badly to Dubai: the service charge already funds the building fabric, plant
 * and common areas, so the owner's residual exposure is limited to in-unit
 * items — appliances, AC servicing, repainting between tenants. On a AED 2.2M
 * apartment the 1% rule produces AED 22,000 a year against ~AED 98,000 of
 * rent, which is not a reserve so much as a fiction. 5% of rent is the
 * realistic figure for an apartment where the service charge does the heavy
 * lifting; villas carry more because the owner also owns the roof and garden.
 */
export const MAINTENANCE_ALLOWANCE: CostRate = {
  rate: 0.05,
  label: "Maintenance reserve",
  note: "5% of rent set aside for in-unit repairs the service charge does not cover — appliances, AC servicing, repainting between tenants. The building fabric and common areas are already funded by the service charge.",
  convention: true,
};

/** Villas carry the roof, garden and their own plant, so the reserve is higher. */
export const MAINTENANCE_ALLOWANCE_VILLA_RATE = 0.08;

/** Landlord-side statutory/utility items, annual AED. */
export const DEWA_CONNECTION_TYPICAL = 2000;
export const EJARI_REGISTRATION = 220;
export const LANDLORD_INSURANCE_TYPICAL = 1200;

/**
 * Dubai Municipality housing fee — 5% of the annual rental value, billed
 * monthly through the DEWA account. This is the single most commonly omitted
 * running cost in Dubai property calculators, and on a tenanted investment
 * property it is a real deduction, so we model it explicitly.
 */
export const MUNICIPALITY_HOUSING_FEE_RATE = 0.05;

/** Optional but advisable one-off costs, surfaced as context not totals. */
export const CONVEYANCING_MIN = 6000;
export const CONVEYANCING_MAX = 10_000;
export const SNAGGING_APARTMENT = 2000;
export const SNAGGING_VILLA = 4500;
/** Refundable, so excluded from cost totals — shown as cash-flow context. */
export const DEWA_DEPOSIT_APARTMENT = 2000;
export const DEWA_DEPOSIT_VILLA = 4000;

/** Sample-size floors before a DLD figure is quoted as evidence rather than
 *  shown as indicative. Mirrors the gating in lib/area-stats.ts. */
export const MIN_COMPS_STRONG = 30;
export const MIN_COMPS_USABLE = 12;

/** Price-vs-comps verdict bands, as a fraction above/below the median. */
export const PRICE_BAND_WELL_BELOW = -0.1;
export const PRICE_BAND_BELOW = -0.03;
export const PRICE_BAND_ABOVE = 0.03;
export const PRICE_BAND_WELL_ABOVE = 0.1;

export const SQM_TO_SQFT = 10.7639;

/**
 * Plausibility guards — the last line of defence before a figure reaches a
 * visitor.
 *
 * These exist because a rental listing was once parsed as a purchase: an
 * AED 134,999 annual rent became the "price" of a 1,217 sqft Arjan apartment,
 * and the report confidently announced a 92% discount to market and a 66% net
 * yield. Every individual calculation was correct; the input was garbage, and
 * nothing downstream objected.
 *
 * So: whenever a derived figure lands outside the range Dubai property can
 * actually occupy, we suppress the verdict and say the input looks wrong,
 * rather than rendering an impossible number with a confident label. A visitor
 * seeing "66% net yield" learns nothing except that the tool cannot be trusted.
 */

/** Dubai sale PSF floor/ceiling. Below ~AED 300/sqft is not a sale price. */
export const PLAUSIBLE_SALE_PSF_MIN = 300;
export const PLAUSIBLE_SALE_PSF_MAX = 15_000;

/** Gross yields outside this band mean the price or the rent is wrong. */
export const PLAUSIBLE_GROSS_YIELD_MIN = 1;
export const PLAUSIBLE_GROSS_YIELD_MAX = 15;

/**
 * A price this far from the comparable median is not a discount, it is a data
 * problem — a rent read as a price, a missing digit, a per-sqft figure read as
 * a total. Real distressed sales in Dubai bottom out around 35-40% below market.
 */
export const IMPLAUSIBLE_DELTA_BELOW = -0.45;
export const IMPLAUSIBLE_DELTA_ABOVE = 3;
