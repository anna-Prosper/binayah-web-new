/**
 * deal-check/engine.ts
 *
 * The deal maths. Pure functions only — no fetching, no model calls — so every
 * number the visitor sees is deterministic, auditable and unit-testable. The
 * LLM's role in Deal Check is confined to reading unstructured input into a
 * DealInput; it never computes money and never decides the verdict.
 *
 * Unit discipline: this module works exclusively in AED and sqft. DLD feeds
 * quote per-square-METRE under a `pricePerSqft` name — conversion happens at
 * the fetch boundary (see comps.ts), never here.
 */

import {
  AGENCY_COMMISSION,
  BANK_ARRANGEMENT_RATE,
  DEWA_CONNECTION_TYPICAL,
  DEVELOPER_OQOOD_ADMIN_MAX,
  DEVELOPER_OQOOD_ADMIN_MIN,
  DEVELOPER_OQOOD_ADMIN_TYPICAL,
  DLD_ADMIN_BUNDLE,
  DLD_TRANSFER,
  EJARI_REGISTRATION,
  LANDLORD_INSURANCE_TYPICAL,
  LTV_EXPAT_OVER_5M,
  LTV_EXPAT_UNDER_5M,
  LTV_OFF_PLAN,
  LTV_PRICE_THRESHOLD,
  MAINTENANCE_ALLOWANCE,
  MAINTENANCE_ALLOWANCE_VILLA_RATE,
  MANAGEMENT_FEE,
  MIN_COMPS_STRONG,
  MIN_COMPS_USABLE,
  MORTGAGE_REGISTRATION_ADMIN,
  MORTGAGE_REGISTRATION_RATE,
  MUNICIPALITY_HOUSING_FEE_RATE,
  NOC_FEE_MAX,
  NOC_FEE_MIN,
  NOC_FEE_TYPICAL,
  OQOOD_ADMIN,
  PRICE_BAND_ABOVE,
  PRICE_BAND_BELOW,
  PRICE_BAND_WELL_ABOVE,
  PRICE_BAND_WELL_BELOW,
  SERVICE_CHARGE_PSF,
  TRUSTEE_ABOVE,
  TRUSTEE_BELOW,
  TRUSTEE_THRESHOLD,
  VALUATION_FEE_TYPICAL,
  VAT,
  VILLA_RATE_COMMUNITIES,
  VILLA_SERVICE_CHARGE_MULTIPLIER,
} from "./constants";
import type {
  CashRequired,
  CashScheduleStage,
  CostLine,
  DealInput,
  DealQuestion,
  PriceAssessment,
  RentalEconomics,
} from "./types";

/** A comparable set resolved from DLD, already converted to AED/sqft. */
export interface CompSet {
  medianPrice: number | null;
  pricePsf: number | null;
  count: number;
  label: string;
  areaName: string | null;
  /** Area-wide figures, used when the exact type+bed combo is too thin. */
  areaSalePsf: number | null;
  areaRentPsf: number | null;
  areaGrossYieldPct: number | null;
  rentSampleSize: number | null;
  lowConfidence: boolean;
  periodLabel: string | null;
  coverageStart: string | null;
}

const money = (n: number) => Math.round(n);

// ── Price vs comparables ────────────────────────────────────────────────────

/**
 * Compare the asking price against DLD-registered sales of the same property
 * type and bedroom count in the same community.
 *
 * Preference order for the benchmark:
 *   1. PSF against the matched type+bed combo — the fairest like-for-like,
 *      because it neutralises size differences within the band.
 *   2. Total price against the combo median, when size is unknown.
 *   3. PSF against the area-wide median, when the combo is too thin.
 * Anything below MIN_COMPS_USABLE is reported but flagged `thin`, and the UI
 * renders it as context rather than a verdict.
 */
export function assessPrice(input: DealInput, comps: CompSet): PriceAssessment {
  const { price, areaSqft } = input;
  const subjectPsf = price && areaSqft && areaSqft > 0 ? price / areaSqft : null;

  const confidence: PriceAssessment["confidence"] =
    comps.count >= MIN_COMPS_STRONG
      ? "strong"
      : comps.count >= MIN_COMPS_USABLE
        ? "usable"
        : comps.count > 0
          ? "thin"
          : "none";

  // Choose the benchmark. PSF-on-combo is the primary; fall back down the chain.
  let deltaPct: number | null = null;
  let basis: "psf-combo" | "price-combo" | "psf-area" | null = null;

  if (subjectPsf && comps.pricePsf && comps.count >= MIN_COMPS_USABLE) {
    deltaPct = subjectPsf / comps.pricePsf - 1;
    basis = "psf-combo";
  } else if (price && comps.medianPrice && comps.count >= MIN_COMPS_USABLE) {
    deltaPct = price / comps.medianPrice - 1;
    basis = "price-combo";
  } else if (subjectPsf && comps.areaSalePsf) {
    deltaPct = subjectPsf / comps.areaSalePsf - 1;
    basis = "psf-area";
  }

  const verdict: PriceAssessment["verdict"] =
    deltaPct === null
      ? "unknown"
      : deltaPct <= PRICE_BAND_WELL_BELOW
        ? "well-below"
        : deltaPct <= PRICE_BAND_BELOW
          ? "below"
          : deltaPct < PRICE_BAND_ABOVE
            ? "in-line"
            : deltaPct < PRICE_BAND_WELL_ABOVE
              ? "above"
              : "well-above";

  return {
    verdict,
    subjectPsf: subjectPsf ? money(subjectPsf) : null,
    comparablePsf: comps.pricePsf ? money(comps.pricePsf) : null,
    deltaPct,
    comparableMedianPrice: comps.medianPrice ? money(comps.medianPrice) : null,
    sampleSize: comps.count || null,
    confidence,
    comparableLabel: comps.label || null,
    summary: priceSummary(verdict, deltaPct, comps, basis, confidence),
    source: comps.areaName ? `DLD registered sales, ${comps.areaName}` : null,
    periodLabel: comps.periodLabel,
  };
}

function priceSummary(
  verdict: PriceAssessment["verdict"],
  deltaPct: number | null,
  comps: CompSet,
  basis: string | null,
  confidence: PriceAssessment["confidence"],
): string {
  if (verdict === "unknown" || deltaPct === null) {
    return comps.count === 0
      ? "There aren't enough registered sales matching this property to benchmark the price. Treat any figure below as indicative only."
      : "We could not establish a like-for-like comparison — the asking price or the size is missing.";
  }

  const pct = Math.abs(deltaPct * 100);
  const rounded = pct < 1 ? pct.toFixed(1) : Math.round(pct).toString();
  const basisLabel =
    basis === "psf-area"
      ? `the wider ${comps.areaName ?? "community"} average`
      : `${comps.count} comparable registered ${comps.count === 1 ? "sale" : "sales"}`;

  const caveat =
    confidence === "thin"
      ? " That is a small sample, so treat it as a signal rather than a valuation."
      : "";

  switch (verdict) {
    case "well-below":
      return `The asking price is about ${rounded}% below ${basisLabel}. That is a genuine discount worth understanding — ask why. Common reasons are a distressed or fast sale, a short remaining lease on the land, a poor floor or view, an unrenovated unit, or an existing tenant on a below-market rent.${caveat}`;
    case "below":
      return `The asking price sits around ${rounded}% under ${basisLabel} — modestly keen, and broadly in the range where a deal gets done.${caveat}`;
    case "in-line":
      return `The asking price is within ${rounded}% of ${basisLabel}. It is priced at the market; any value has to come from negotiation, the specific unit, or the terms rather than the headline number.${caveat}`;
    case "above":
      return `The asking price is roughly ${rounded}% above ${basisLabel}. That premium is not unusual for a better floor, view or finish — but it should be something you can point at.${caveat}`;
    case "well-above":
      return `The asking price is about ${rounded}% above ${basisLabel}. That is a significant premium and needs a concrete justification — a high floor, a full renovation, a rare layout or an unobstructed view. Without one, there is room to negotiate.${caveat}`;
    default:
      return "";
  }
}

// ── Total cash required ─────────────────────────────────────────────────────

/**
 * Build the buyer's cash requirement. Ready and off-plan diverge sharply:
 * a ready purchase needs the whole price plus costs at transfer, while off-plan
 * front-loads a booking deposit and DLD fee, then spreads the rest.
 */
export function computeCash(input: DealInput): CashRequired {
  const price = input.price ?? 0;
  const offPlan = input.purchaseType === "off-plan";
  const lines: CostLine[] = [];

  if (price <= 0) {
    return { lines, total: 0, totalWithPrice: 0, schedule: null, financing: null };
  }

  // DLD transfer fee — 4%, and the same 4% either way. On off-plan this is
  // paid once at Oqood registration on the (lower) off-plan price, and there
  // is NO second 4% at handover: a genuine saving against buying ready.
  lines.push({
    label: DLD_TRANSFER.label,
    amount: money(price * DLD_TRANSFER.rate!),
    note: offPlan
      ? "4% of the purchase price, paid to Dubai Land Department when the sale is registered through Oqood. You pay it once, on the off-plan price — there is no second 4% at handover. Some developers run promotions covering part or all of it, so ask."
      : DLD_TRANSFER.note,
  });

  if (offPlan) {
    // Oqood is the registration route, not a separate 4% — its own admin
    // charge is trivial. The developer's admin fee is the real line item.
    lines.push({
      label: "Oqood registration admin",
      amount: OQOOD_ADMIN,
      note: "DLD's administrative charge for recording an off-plan sale on the Oqood system. The 4% above is the registration fee itself — there is no separate Oqood percentage.",
    });

    lines.push({
      label: "Developer admin fee",
      amount: DEVELOPER_OQOOD_ADMIN_TYPICAL,
      range: { min: DEVELOPER_OQOOD_ADMIN_MIN, max: DEVELOPER_OQOOD_ADMIN_MAX },
      note: `The developer's own processing charge for registering your purchase, typically AED ${DEVELOPER_OQOOD_ADMIN_MIN.toLocaleString()}–${DEVELOPER_OQOOD_ADMIN_MAX.toLocaleString()}. Set by the developer, not DLD, so confirm it before signing.`,
      convention: true,
    });
    // Trustee fee is normally waived on an initial off-plan sale, and the
    // developer pays the agency — so neither line appears here.
  } else {
    lines.push({
      label: "DLD admin & title deed",
      amount: DLD_ADMIN_BUNDLE,
      note: "DLD's bundled administrative charges — title deed issuance, property map, plus the knowledge and innovation levies.",
    });

    const trustee = price < TRUSTEE_THRESHOLD ? TRUSTEE_BELOW : TRUSTEE_ABOVE;
    lines.push({
      label: "Trustee office fee",
      amount: money(trustee * (1 + VAT)),
      note: `Paid to the registration trustee who processes the transfer — AED ${trustee.toLocaleString()} plus 5% VAT (AED ${TRUSTEE_BELOW.toLocaleString()} under AED ${TRUSTEE_THRESHOLD.toLocaleString()}, AED ${TRUSTEE_ABOVE.toLocaleString()} at or above).`,
    });

    lines.push({
      label: "Developer NOC",
      amount: NOC_FEE_TYPICAL,
      range: { min: NOC_FEE_MIN, max: NOC_FEE_MAX },
      note: `The developer's no-objection certificate confirming the seller has no outstanding service charges. AED ${NOC_FEE_MIN.toLocaleString()}–${NOC_FEE_MAX.toLocaleString()} depending on the developer, and by convention the seller pays it — worth agreeing in the MOU rather than assuming.`,
      convention: true,
    });

    // Agency commission applies on resale; off-plan direct from developer does not.
    lines.push({
      label: AGENCY_COMMISSION.label,
      amount: money(price * AGENCY_COMMISSION.rate! * (1 + VAT)),
      note: AGENCY_COMMISSION.note,
      convention: true,
    });
  }

  // ── Financing ─────────────────────────────────────────────────────────────
  let financing: CashRequired["financing"] = null;

  if (input.mortgage) {
    // Off-plan financing is capped far lower than ready property — 50% — which
    // catches out buyers who assume the standard expat LTV applies.
    const cap = offPlan
      ? LTV_OFF_PLAN
      : price >= LTV_PRICE_THRESHOLD
        ? LTV_EXPAT_OVER_5M
        : LTV_EXPAT_UNDER_5M;
    const requested = input.downPaymentPct != null ? 1 - input.downPaymentPct : cap;
    const ltv = Math.min(requested, cap);
    const ltvCapped = requested > cap;
    const loanAmount = money(price * ltv);

    financing = {
      loanAmount,
      downPayment: money(price - loanAmount),
      ltv,
      ltvCapped,
    };

    lines.push({
      label: "Mortgage registration",
      amount: money(loanAmount * MORTGAGE_REGISTRATION_RATE + MORTGAGE_REGISTRATION_ADMIN),
      note: `0.25% of the loan plus an AED ${MORTGAGE_REGISTRATION_ADMIN} admin charge, paid to DLD to register the bank's interest.`,
    });
    lines.push({
      label: "Bank arrangement fee",
      amount: money(loanAmount * BANK_ARRANGEMENT_RATE * (1 + VAT)),
      note: "Around 1% of the loan plus VAT. This is one of the more negotiable costs — banks routinely discount or waive it to win the business.",
      convention: true,
    });
    lines.push({
      label: "Bank valuation",
      amount: VALUATION_FEE_TYPICAL,
      note: "The lender's own valuation of the property, typically AED 2,500–3,500 plus VAT. If it comes in under the asking price, the bank lends against the lower figure and your deposit rises.",
      convention: true,
    });
  }

  const costs = lines.reduce((sum, l) => sum + l.amount, 0);

  // ── Off-plan schedule ─────────────────────────────────────────────────────
  const schedule = offPlan ? buildSchedule(input, price, lines) : null;

  // Cash to complete: financed buyers put in the deposit plus costs; cash
  // buyers put in the full price plus costs.
  const cashToComplete = financing ? financing.downPayment + costs : price + costs;

  return {
    lines,
    total: money(costs),
    totalWithPrice: money(cashToComplete),
    schedule,
    financing,
  };
}

/**
 * Turn a developer payment plan into a dated cash schedule. Upfront costs
 * (DLD 4%, Oqood) attach to the booking stage because that is when DLD
 * registration actually happens on an off-plan purchase.
 */
function buildSchedule(input: DealInput, price: number, lines: CostLine[]): CashScheduleStage[] | null {
  const plan = input.paymentPlan;
  if (!plan || plan.length === 0) return null;

  const stages: CashScheduleStage[] = [];
  let cumulative = 0;

  plan.forEach((step, i) => {
    // Prefer a stated amount, but only a MEANINGFUL one. Extractors routinely
    // return `amount: 0` rather than null for "not stated", and `??` would
    // treat that zero as authoritative and silently zero out the schedule.
    const stated = step.amount != null && step.amount > 0 ? step.amount : null;
    const fromPct =
      step.percentage != null && step.percentage > 0
        ? money(price * (step.percentage / 100))
        : null;
    const amount = stated ?? fromPct ?? 0;

    // All registration costs fall at booking.
    const extras = i === 0 ? lines : [];
    const extrasTotal = extras.reduce((s, l) => s + l.amount, 0);
    cumulative += amount + extrasTotal;

    stages.push({
      label: step.label,
      amount,
      extras,
      cumulative: money(cumulative),
      timing: timingFor(step.phase, input.handover),
    });
  });

  return stages;
}

function timingFor(phase: string, handover: string | null): string {
  switch (phase) {
    case "booking":
      return "On signing";
    case "construction":
      return "Staged during construction";
    case "handover":
      return handover ? `At handover (${handover})` : "At handover";
    case "post-handover":
      return "After handover";
    default:
      return "";
  }
}

// ── Rental economics ────────────────────────────────────────────────────────

/**
 * Model the income side. Gross rent is taken from the listing when it states
 * one, otherwise modelled from the DLD area rent-per-sqft — which is a median
 * of registered Ejari contracts, so it reflects what tenants actually pay
 * rather than what landlords ask.
 */
export function computeRental(input: DealInput, comps: CompSet, cash: CashRequired): RentalEconomics {
  const { areaSqft, price } = input;
  const assumptions: string[] = [];

  // Gross rent.
  let grossRent: number | null = null;
  let grossRentSource: RentalEconomics["grossRentSource"] = "none";

  if (input.statedRent && input.statedRent > 0) {
    grossRent = input.statedRent;
    grossRentSource = "stated";
    assumptions.push("Gross rent is the figure stated in the listing you submitted.");
  } else if (areaSqft && comps.areaRentPsf) {
    grossRent = money(areaSqft * comps.areaRentPsf);
    grossRentSource = "dld-modelled";
    assumptions.push(
      `Gross rent is modelled at AED ${money(comps.areaRentPsf).toLocaleString()}/sqft a year — the median of registered Ejari contracts in ${comps.areaName ?? "this area"}${comps.rentSampleSize ? ` across ${comps.rentSampleSize.toLocaleString()} contracts` : ""}.`,
    );
  }

  // Service charge.
  const scPsf = serviceChargePsfFor(input);
  const serviceCharge = areaSqft && scPsf ? money(areaSqft * scPsf) : null;
  if (scPsf) {
    assumptions.push(
      `Service charge is estimated at AED ${scPsf}/sqft a year. Dubai has no single public service-charge feed, so this is a community-level planning figure — the actual charge is set per building and appears on the DLD Mollak statement.`,
    );
  }

  const deductions: CostLine[] = [];

  if (serviceCharge) {
    deductions.push({
      label: "Service charge",
      amount: serviceCharge,
      note: `${areaSqft?.toLocaleString()} sqft at AED ${scPsf}/sqft. Covers building maintenance, shared cooling, security and the reserve fund.`,
    });
  }

  if (grossRent) {
    deductions.push({
      label: "Vacancy allowance",
      amount: money(grossRent * 0.05),
      note: "Assumed at 5% — roughly two to three weeks a year empty between tenancies. There is no published Dubai vacancy statistic, so this is a planning convention rather than a measured figure: a unit that re-lets immediately loses nothing, a slow re-let costs considerably more.",
      convention: true,
    });
    deductions.push({
      label: "Property management",
      amount: money(grossRent * MANAGEMENT_FEE.rate!),
      note: MANAGEMENT_FEE.note,
      convention: true,
    });
    // The most commonly omitted Dubai running cost. Billed monthly via DEWA.
    deductions.push({
      label: "Municipality housing fee",
      amount: money(grossRent * MUNICIPALITY_HOUSING_FEE_RATE),
      note: "Dubai Municipality charges 5% of the annual rental value, collected monthly through the DEWA bill. Most rental-yield calculators leave this out entirely, which quietly overstates the net return.",
    });
  }

  if (grossRent) {
    const isVilla = input.propertyKind === "villa" || input.propertyKind === "townhouse";
    const rate = isVilla ? MAINTENANCE_ALLOWANCE_VILLA_RATE : MAINTENANCE_ALLOWANCE.rate!;
    deductions.push({
      label: "Maintenance reserve",
      amount: money(grossRent * rate),
      note: isVilla
        ? "8% of rent. A villa owner carries the roof, garden, pool and their own AC plant on top of in-unit items, so the reserve runs higher than for an apartment."
        : MAINTENANCE_ALLOWANCE.note,
      convention: true,
    });
  }

  deductions.push({
    label: "Insurance, Ejari & utilities",
    amount: LANDLORD_INSURANCE_TYPICAL + EJARI_REGISTRATION + money(DEWA_CONNECTION_TYPICAL * 0.25),
    note: "Landlord building insurance, annual Ejari registration, and the DEWA connection costs that fall between tenancies.",
    convention: true,
  });

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const netIncome = grossRent != null ? money(grossRent - totalDeductions) : null;

  const grossYieldPct = grossRent && price ? (grossRent / price) * 100 : null;
  const netYieldPct = netIncome != null && price ? (netIncome / price) * 100 : null;

  /**
   * Return on total capital invested — price plus every purchase cost. For a
   * financed purchase this is deliberately NOT the cash-on-cash return on the
   * deposit: leverage would flatter it while the mortgage interest, which we
   * do not model, sits unaccounted on the other side of the ledger. Comparing
   * an unlevered numerator against a levered denominator produces a number
   * that looks like a return but isn't one.
   */
  const totalInvested = price ? price + cash.total : 0;
  const netYieldOnCashPct =
    netIncome != null && totalInvested > 0 ? (netIncome / totalInvested) * 100 : null;

  assumptions.push(
    "Return on total invested divides net income by the price plus every purchase cost — a truer figure than the headline gross yield, which ignores the 4% DLD fee and the rest.",
  );

  if (input.mortgage) {
    assumptions.push(
      "These returns are before mortgage interest. A financed purchase has a smaller cash outlay but pays interest out of the same rent, so the cash-on-cash return depends entirely on your rate — model it against a live quote rather than assuming.",
    );
  }

  const confidence: RentalEconomics["confidence"] =
    grossRentSource === "stated"
      ? "usable"
      : grossRentSource === "none"
        ? "none"
        : comps.rentSampleSize && comps.rentSampleSize >= 100
          ? "strong"
          : comps.rentSampleSize && comps.rentSampleSize >= 20
            ? "usable"
            : "thin";

  return {
    grossRent,
    grossRentSource,
    serviceCharge,
    serviceChargePsf: scPsf,
    deductions,
    netIncome,
    grossYieldPct: grossYieldPct != null ? round1(grossYieldPct) : null,
    netYieldPct: netYieldPct != null ? round1(netYieldPct) : null,
    netYieldOnCashPct: netYieldOnCashPct != null ? round1(netYieldOnCashPct) : null,
    areaGrossYieldPct: comps.areaGrossYieldPct,
    confidence,
    assumptions,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Community service charge per sqft, adjusted down for villas and townhouses —
 * no lifts, no shared cooling plant, no tower lobby to fund.
 *
 * Villa-community figures in the table are ALREADY villa rates, so applying
 * the multiplier to those would understate the charge a second time.
 */
export function serviceChargePsfFor(input: DealInput): number | null {
  const key = (input.community ?? "").toLowerCase().trim();
  const base = SERVICE_CHARGE_PSF[key] ?? SERVICE_CHARGE_PSF.DEFAULT;
  const isLowRise = input.propertyKind === "villa" || input.propertyKind === "townhouse";
  const alreadyVillaRate = VILLA_RATE_COMMUNITIES.has(key);
  const adjusted = isLowRise && !alreadyVillaRate ? base * VILLA_SERVICE_CHARGE_MULTIPLIER : base;
  // Villa rates run as low as 3.5, so round to one decimal rather than to a
  // whole dirham — rounding 3.5 to 4 would be a 14% error.
  return Math.round(adjusted * 10) / 10;
}

// ── Questions to ask ────────────────────────────────────────────────────────

/**
 * Generate the diligence list. These are derived from what the numbers and the
 * gaps actually show — a question only appears when this specific deal earns
 * it, so the list stays short and none of it is boilerplate.
 */
export function buildQuestions(
  input: DealInput,
  price: PriceAssessment,
  rental: RentalEconomics,
  missing: string[],
): DealQuestion[] {
  const q: DealQuestion[] = [];
  const offPlan = input.purchaseType === "off-plan";

  // Missing information first — you cannot assess what you have not been told.
  if (missing.includes("areaSqft")) {
    q.push({
      question: "What is the exact internal size in square feet, and does that include the balcony?",
      why: "Without a verified size you cannot compare price per square foot, which is the only way to judge one Dubai unit against another. Advertised sizes sometimes include balconies or terraces that the title deed does not.",
      category: "condition",
      priority: true,
    });
  }

  if (missing.includes("serviceCharge")) {
    q.push({
      question: "What is the actual service charge per square foot on the Mollak statement?",
      why: "Service charges vary widely between towers in the same community and are the single biggest drag on net yield. Ask for the current DLD Mollak statement rather than an estimate.",
      category: "costs",
      priority: true,
    });
  }

  // Price-driven.
  if (price.verdict === "well-above") {
    q.push({
      question: `Comparable registered sales here are around AED ${price.comparablePsf?.toLocaleString()}/sqft. What justifies the premium on this unit?`,
      why: "A high floor, unobstructed view, corner layout or recent full renovation can each justify a premium. If none applies, the asking price is negotiable.",
      category: "market",
      priority: true,
    });
  }

  if (price.verdict === "well-below") {
    q.push({
      question: "Why is this priced below the market — is there a tenant in place, a service-charge arrear, or a structural issue?",
      why: "Genuine bargains exist, but a large discount usually has a cause. The common ones are a sitting tenant on a low rent, unpaid service charges that transfer with the property, or a unit needing significant work.",
      category: "market",
      priority: true,
    });
  }

  // Off-plan specifics.
  if (offPlan) {
    q.push({
      question: "Is the project registered with DLD and are payments going into the escrow account?",
      why: "Dubai law requires off-plan payments to go into a project-specific escrow account regulated by RERA. Verify the escrow account number on the DLD website before transferring anything.",
      category: "legal",
      priority: true,
    });
    q.push({
      question: "What is the contractual handover date, and what compensation applies if the developer is late?",
      why: "Handover dates slip. The SPA should state a date and the remedy for delay — without one you have limited recourse and your rental income is deferred indefinitely.",
      category: "payment",
      priority: true,
    });
    q.push({
      question: "Can I resell before handover, and what does the developer charge to assign the contract?",
      why: "Most developers restrict resale until a percentage of the price is paid, then charge an NOC fee to transfer. If your plan is to exit before completion this determines whether that is possible.",
      category: "payment",
      priority: false,
    });
    if (!input.paymentPlan) {
      q.push({
        question: "What is the full payment schedule — and how much falls due at handover?",
        why: "Post-handover plans look attractive because the deposit is small, but a large balloon payment at handover has caught out plenty of buyers who assumed they would refinance or flip first.",
        category: "payment",
        priority: true,
      });
    }
  } else {
    q.push({
      question: "Is the unit vacant on transfer, or is there a tenant with an existing contract?",
      why: "A tenant in place means you inherit their rent and their contract. Dubai's rent-increase rules limit how fast you can move a below-market rent up, and eviction requires 12 months' notice for personal use or sale.",
      category: "rental",
      priority: true,
    });
    q.push({
      question: "Are there any outstanding service charges on the unit?",
      why: "Unpaid service charges attach to the property, not the seller. The developer's NOC confirms the account is clear — do not complete without it.",
      category: "legal",
      priority: true,
    });
    q.push({
      question: "How old is the building, and when were the chillers, lifts and façade last serviced?",
      why: "Major plant replacement is funded from the reserve fund. An underfunded reserve in an ageing tower means a special levy later, charged to owners.",
      category: "condition",
      priority: false,
    });
  }

  // Rental-driven.
  if (rental.grossRentSource === "dld-modelled") {
    q.push({
      question: "What rent is this unit actually achieving, and can I see the current Ejari contract?",
      why: "Our income figure is modelled from registered contracts across the area. The specific unit's floor, view and condition can move the achievable rent meaningfully either way.",
      category: "rental",
      priority: false,
    });
  }

  if (rental.netYieldPct != null && rental.grossYieldPct != null && rental.netYieldPct < rental.grossYieldPct * 0.6) {
    q.push({
      question: "Given the service charge, is the net return still what you were expecting?",
      why: `The gross yield here is ${rental.grossYieldPct}% but the net is ${rental.netYieldPct}% once the service charge and running costs come out. That gap is larger than typical and is driven by the service charge.`,
      category: "costs",
      priority: true,
    });
  }

  if (input.mortgage) {
    q.push({
      question: "Has the bank valued the property, and does the valuation match the asking price?",
      why: "Banks lend against their own valuation, not the price you agreed. A valuation below the asking price increases your cash deposit by the difference.",
      category: "payment",
      priority: true,
    });
  }

  return q;
}

/** Overall read of the deal, assembled from the parts. Deliberately measured. */
export function buildVerdict(
  input: DealInput,
  price: PriceAssessment,
  rental: RentalEconomics,
  cash: CashRequired,
): string {
  const parts: string[] = [];
  const offPlan = input.purchaseType === "off-plan";

  if (price.verdict !== "unknown") {
    parts.push(price.summary);
  }

  if (rental.netYieldPct != null) {
    const q = rental.netYieldPct >= 6 ? "strong for Dubai" : rental.netYieldPct >= 4.5 ? "around the Dubai average" : "below the Dubai average";
    parts.push(
      `After the service charge and running costs, the net yield works out at about ${rental.netYieldPct}% on the purchase price — ${q}. On the total cash you actually put in, including the 4% DLD fee and the other purchase costs, it is ${rental.netYieldOnCashPct}%.`,
    );
  } else if (rental.grossRentSource === "none") {
    parts.push(
      "We could not model the rental side without a size or a stated rent, so treat the income question as open.",
    );
  }

  if (cash.totalWithPrice > 0) {
    parts.push(
      offPlan
        ? `Expect to need about AED ${cash.total.toLocaleString()} in fees on top of the instalments, most of it due at booking.`
        : `Budget roughly AED ${cash.total.toLocaleString()} in purchase costs on top of the price — that is the number most buyers underestimate.`,
    );
  }

  return parts.join(" ");
}
