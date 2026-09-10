/**
 * deal-check/gate.ts
 *
 * Splits a finished report into the free teaser and the gated remainder.
 *
 * SECURITY: the locked half must never reach the browser. Blurring it in CSS
 * or hiding it behind `display:none` leaves the numbers sitting in the page
 * payload, readable by anyone who opens DevTools — which is both trivially
 * bypassed and worse than not gating at all, because it looks like a gate.
 * So the server sends the teaser only, stores the full report, and hands over
 * the rest on a separate authenticated request after the lead is captured.
 */

import type { DealCheckReport, RentAssessment } from "./types";

/** What an ungated visitor receives. */
export interface TeaserReport {
  gated: true;
  input: DealCheckReport["input"];
  /** The headline read — enough to prove the tool works. */
  verdict: string;
  /** Price comparison, in full: this is the hook. */
  price: DealCheckReport["price"];
  /** Headline cash total only — not the line-by-line breakdown. */
  cashTotal: number;
  cashCostsTotal: number;
  cashPctOfPrice: number | null;
  /** Counts so the visitor knows the size of what is behind the gate. */
  lockedCounts: {
    costLines: number;
    questions: number;
    alternatives: number;
    hasRental: boolean;
    hasSchedule: boolean;
  };
  /** Headline net yield is withheld; we only say whether we could model it. */
  dataAsOf: string | null;
  generatedAt: string;
}

/** Everything held back until a lead is captured. */
export interface GatedRemainder {
  cash: DealCheckReport["cash"];
  rental: DealCheckReport["rental"];
  questions: DealCheckReport["questions"];
  alternatives: DealCheckReport["alternatives"];
  assumptions: DealCheckReport["assumptions"];
  missing: string[];
}

export function splitReport(report: DealCheckReport): {
  teaser: TeaserReport;
  locked: GatedRemainder;
} {
  const price = report.input.price ?? 0;

  return {
    teaser: {
      gated: true,
      input: report.input,
      verdict: teaserVerdict(report),
      price: report.price,
      cashTotal: report.cash.totalWithPrice,
      cashCostsTotal: report.cash.total,
      cashPctOfPrice: price > 0 ? Math.round((report.cash.total / price) * 1000) / 10 : null,
      lockedCounts: {
        costLines: report.cash.lines.length,
        questions: report.questions.length,
        alternatives: report.alternatives.length,
        hasRental: report.rental.netYieldPct != null,
        hasSchedule: (report.cash.schedule?.length ?? 0) > 0,
      },
      dataAsOf: report.dataAsOf,
      generatedAt: report.generatedAt,
    },
    locked: {
      cash: report.cash,
      rental: report.rental,
      questions: report.questions,
      alternatives: report.alternatives,
      assumptions: report.assumptions,
      missing: report.missing,
    },
  };
}

/**
 * The teaser verdict keeps the price read (already shown in full) and the
 * cash headline, but strips the yield sentence — that figure is the single
 * most valuable thing in the report and sits behind the gate.
 */
function teaserVerdict(report: DealCheckReport): string {
  const parts: string[] = [];

  if (report.price.verdict !== "unknown") {
    parts.push(report.price.summary);
  }

  if (report.cash.total > 0) {
    parts.push(
      report.input.purchaseType === "off-plan"
        ? `Expect about AED ${report.cash.total.toLocaleString()} in fees on top of the instalments, most of it due at booking.`
        : `Budget roughly AED ${report.cash.total.toLocaleString()} in purchase costs on top of the price — that is the number most buyers underestimate.`,
    );
  }

  return parts.join(" ");
}

/** Rent reports gate the same way: comparison free, diligence behind the form. */
export interface RentTeaser {
  gated: true;
  input: DealCheckReport["input"];
  rent: Omit<RentAssessment, "questions">;
  lockedCounts: { questions: number };
  generatedAt: string;
}

export function splitRent(
  input: DealCheckReport["input"],
  rent: RentAssessment,
): { teaser: RentTeaser; locked: { questions: RentAssessment["questions"] } } {
  const { questions, ...rest } = rent;
  return {
    teaser: {
      gated: true,
      input,
      rent: rest,
      lockedCounts: { questions: questions.length },
      generatedAt: new Date().toISOString(),
    },
    locked: { questions },
  };
}
