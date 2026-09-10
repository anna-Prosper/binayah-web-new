/**
 * scripts/verify-deal-check.ts
 *
 * Assertions over the Deal Check money maths. The engine is pure, so this
 * needs no server, no database and no network — run it with:
 *
 *   npx tsx --tsconfig tsconfig.json scripts/verify-deal-check.ts
 *
 * These cover the mistakes that actually bit during the build: a payment plan
 * silently zeroing out, off-plan being charged the DLD fee twice, villa
 * service charges being discounted twice, and the return-on-cash figure being
 * computed against the deposit rather than total capital.
 */

import {
  assessPrice,
  computeCash,
  computeRental,
  serviceChargePsfFor,
  type CompSet,
} from "../src/lib/deal-check/engine";
import type { DealInput } from "../src/lib/deal-check/types";

let failures = 0;
let checks = 0;

function check(name: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function near(actual: number, expected: number, tolerance = 1): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

const baseInput: DealInput = {
  price: 2_000_000,
  areaSqft: 1000,
  bedrooms: 2,
  community: "Business Bay",
  building: null,
  propertyKind: "apartment",
  purchaseType: "ready",
  statedRent: null,
  paymentPlan: null,
  handover: null,
  developer: null,
  mortgage: false,
  downPaymentPct: null,
  sourceUrl: null,
};

const comps: CompSet = {
  medianPrice: 2_000_000,
  pricePsf: 2000,
  count: 500,
  label: "2-bedroom apartments in Business Bay",
  areaName: "Business Bay",
  areaSalePsf: 2000,
  areaRentPsf: 120,
  areaGrossYieldPct: 6,
  rentSampleSize: 4000,
  lowConfidence: false,
  periodLabel: "12m",
  coverageStart: "2026-01-02",
};

console.log("\nPrice assessment");
{
  const at = assessPrice({ ...baseInput }, comps);
  check("price at the median reads in-line", at.verdict === "in-line", at.verdict);

  const high = assessPrice({ ...baseInput, price: 2_400_000 }, comps);
  check("20% over the median reads well-above", high.verdict === "well-above", high.verdict);

  const low = assessPrice({ ...baseInput, price: 1_700_000 }, comps);
  check("15% under the median reads well-below", low.verdict === "well-below", low.verdict);

  const thin = assessPrice({ ...baseInput }, { ...comps, count: 3 });
  check("a 3-sale sample is flagged thin", thin.confidence === "thin", thin.confidence);

  const none = assessPrice({ ...baseInput }, { ...comps, count: 0, pricePsf: null, medianPrice: null, areaSalePsf: null });
  check("no comparables yields an unknown verdict", none.verdict === "unknown", none.verdict);

  // A thin sample must not silently borrow the tight combo figure; it should
  // fall back to the area benchmark rather than overstate its confidence.
  const fallback = assessPrice({ ...baseInput, price: 2_400_000 }, { ...comps, count: 4 });
  check("a thin combo still produces a delta via the area figure", fallback.deltaPct != null);
}

console.log("\nCash required — ready purchase");
{
  const cash = computeCash({ ...baseInput });
  const dld = cash.lines.find((l) => l.label === "DLD transfer fee");
  check("DLD transfer fee is 4% of price", near(dld?.amount ?? 0, 80_000), String(dld?.amount));

  check(
    "purchase costs land near 7% of price",
    cash.total / 2_000_000 > 0.06 && cash.total / 2_000_000 < 0.085,
    `${((cash.total / 2_000_000) * 100).toFixed(2)}%`,
  );

  check(
    "cash buyer needs price plus costs",
    cash.totalWithPrice === 2_000_000 + cash.total,
    String(cash.totalWithPrice),
  );

  check("a ready purchase pays agency commission", cash.lines.some((l) => l.label === "Agency commission"));
  check("a ready purchase pays the trustee fee", cash.lines.some((l) => l.label === "Trustee office fee"));
  check("a cash buyer has no financing block", cash.financing === null);
}

console.log("\nCash required — off-plan");
{
  const offPlan = computeCash({
    ...baseInput,
    purchaseType: "off-plan",
    paymentPlan: [
      { label: "Booking", percentage: 20, amount: null, phase: "booking" },
      { label: "Construction", percentage: 50, amount: null, phase: "construction" },
      { label: "Handover", percentage: 30, amount: null, phase: "handover" },
    ],
  });

  const dldLines = offPlan.lines.filter((l) => l.label.includes("DLD transfer"));
  check("the 4% DLD fee is charged exactly once", dldLines.length === 1, `${dldLines.length} lines`);

  check(
    "off-plan costs less to transact than ready",
    offPlan.total < computeCash({ ...baseInput }).total,
    `${offPlan.total} vs ${computeCash({ ...baseInput }).total}`,
  );

  check("off-plan pays no agency commission", !offPlan.lines.some((l) => l.label === "Agency commission"));
  check("off-plan pays no trustee fee", !offPlan.lines.some((l) => l.label === "Trustee office fee"));

  // The bug that shipped zeros: percentages must drive real instalments.
  const sum = (offPlan.schedule ?? []).reduce((s, x) => s + x.amount, 0);
  check("instalments sum to the purchase price", near(sum, 2_000_000, 2), String(sum));

  const last = offPlan.schedule?.[offPlan.schedule.length - 1];
  check(
    "final cumulative equals price plus costs",
    near(last?.cumulative ?? 0, 2_000_000 + offPlan.total, 2),
    String(last?.cumulative),
  );

  // An extractor that returns `amount: 0` for "not stated" must not zero a stage.
  const zeroAmounts = computeCash({
    ...baseInput,
    purchaseType: "off-plan",
    paymentPlan: [
      { label: "Booking", percentage: 20, amount: 0, phase: "booking" },
      { label: "Handover", percentage: 80, amount: 0, phase: "handover" },
    ],
  });
  const zSum = (zeroAmounts.schedule ?? []).reduce((s, x) => s + x.amount, 0);
  check("a zero `amount` falls back to the percentage", near(zSum, 2_000_000, 2), String(zSum));
}

console.log("\nFinancing");
{
  const financed = computeCash({ ...baseInput, mortgage: true, downPaymentPct: 0.25 });
  check("LTV respects the 75% expat cap", financed.financing?.ltv === 0.75, String(financed.financing?.ltv));
  check("deposit is 25% of price", near(financed.financing?.downPayment ?? 0, 500_000), String(financed.financing?.downPayment));

  const greedy = computeCash({ ...baseInput, mortgage: true, downPaymentPct: 0.1 });
  check("a 10% deposit is capped up to the CBUAE limit", greedy.financing?.ltvCapped === true);
  check("capped LTV is 75%", greedy.financing?.ltv === 0.75, String(greedy.financing?.ltv));

  const luxury = computeCash({ ...baseInput, price: 6_000_000, mortgage: true, downPaymentPct: 0.2 });
  check("over AED 5M the cap drops to 65%", luxury.financing?.ltv === 0.65, String(luxury.financing?.ltv));

  const offPlanLoan = computeCash({ ...baseInput, purchaseType: "off-plan", mortgage: true, downPaymentPct: 0.2 });
  check("off-plan financing is capped at 50%", offPlanLoan.financing?.ltv === 0.5, String(offPlanLoan.financing?.ltv));

  // Post-Feb-2025 rule: costs are cash, never folded into the loan.
  check(
    "financed cash-to-complete is deposit plus costs, not net of the loan",
    financed.totalWithPrice === (financed.financing?.downPayment ?? 0) + financed.total,
    String(financed.totalWithPrice),
  );
}

console.log("\nService charges");
{
  check("Business Bay apartment", serviceChargePsfFor({ ...baseInput }) === 16);
  check(
    "Arabian Ranches villa is not discounted twice",
    serviceChargePsfFor({ ...baseInput, community: "Arabian Ranches", propertyKind: "villa" }) === 3.5,
    String(serviceChargePsfFor({ ...baseInput, community: "Arabian Ranches", propertyKind: "villa" })),
  );
  check(
    "a tower community villa does get the discount",
    serviceChargePsfFor({ ...baseInput, community: "Dubai Marina", propertyKind: "villa" }) === 10.2,
    String(serviceChargePsfFor({ ...baseInput, community: "Dubai Marina", propertyKind: "villa" })),
  );
  check(
    "an unmapped community falls back to the default",
    serviceChargePsfFor({ ...baseInput, community: "Nowhere At All" }) === 14,
  );
}

console.log("\nRental economics");
{
  const cash = computeCash({ ...baseInput });
  const rental = computeRental({ ...baseInput, statedRent: 120_000 }, comps, cash);

  check("stated rent is used verbatim", rental.grossRent === 120_000);
  check("gross yield is rent over price", rental.grossYieldPct === 6);
  check("net income is below gross rent", (rental.netIncome ?? 0) < 120_000);
  check("net yield is below gross yield", (rental.netYieldPct ?? 0) < (rental.grossYieldPct ?? 0));

  check(
    "the municipality housing fee is deducted",
    rental.deductions.some((d) => d.label === "Municipality housing fee"),
  );
  check(
    "the housing fee is 5% of rent",
    near(rental.deductions.find((d) => d.label === "Municipality housing fee")?.amount ?? 0, 6000),
  );
  check(
    "maintenance is a share of rent, not of property value",
    near(rental.deductions.find((d) => d.label === "Maintenance reserve")?.amount ?? 0, 6000),
    String(rental.deductions.find((d) => d.label === "Maintenance reserve")?.amount),
  );

  // Return on total invested must use price + costs as the denominator, so it
  // is always slightly below the net yield on price alone.
  check(
    "return on total invested sits just under net yield on price",
    (rental.netYieldOnCashPct ?? 0) < (rental.netYieldPct ?? 0),
    `${rental.netYieldOnCashPct} vs ${rental.netYieldPct}`,
  );

  const modelled = computeRental({ ...baseInput }, comps, cash);
  check("rent is modelled from DLD when not stated", modelled.grossRentSource === "dld-modelled");
  check("modelled rent is sqft times area rent psf", modelled.grossRent === 120_000, String(modelled.grossRent));

  const noSize = computeRental({ ...baseInput, areaSqft: null }, comps, cash);
  check("no size and no stated rent means no rental model", noSize.grossRent === null);
}

console.log(`\n${checks - failures}/${checks} checks passed\n`);
process.exit(failures > 0 ? 1 : 0);
