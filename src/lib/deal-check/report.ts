/**
 * deal-check/report.ts — assembles the finished report from its parts.
 */

import { findAlternatives } from "./alternatives";
import { emptyComps, resolveComps } from "./comps";
import {
  assessPrice,
  buildQuestions,
  buildVerdict,
  computeCash,
  computeRental,
  serviceChargePsfFor,
} from "./engine";
import { findMissing } from "./parse";
import type { CostLine, DealCheckReport, DealInput } from "./types";
import { COSTS_CASH_RULE_NOTE, DLD_SERVICE_CHARGE_INDEX_URL } from "./constants";

export async function buildReport(input: DealInput): Promise<DealCheckReport> {
  // Comps first — the price assessment and the rental model both depend on it.
  const comps = input.community ? await resolveComps(input) : emptyComps();

  const price = assessPrice(input, comps);
  const cash = computeCash(input);
  const rental = computeRental(input, comps, cash);
  const missing = findMissing(input);
  const questions = buildQuestions(input, price, rental, missing);

  // Alternatives are non-critical: a failure here must not sink the report.
  const alternatives = await findAlternatives(input, price.subjectPsf).catch(() => []);

  return {
    input,
    missing,
    price,
    cash,
    rental,
    questions,
    alternatives,
    verdict: buildVerdict(input, price, rental, cash),
    assumptions: buildAssumptions(input, rental),
    dataAsOf: comps.coverageStart,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * The disclosure panel. Everything the report assumed, in one place, so a
 * visitor can check our working rather than take it on trust.
 */
function buildAssumptions(input: DealInput, rental: ReturnType<typeof computeRental>): CostLine[] {
  const out: CostLine[] = [];

  if (rental.serviceChargePsf) {
    out.push({
      label: "Service charge",
      amount: rental.serviceChargePsf,
      note: `AED ${rental.serviceChargePsf}/sqft a year, estimated for ${input.community ?? "this community"}. Dubai publishes service charges per building, not per community, so this is a planning figure — check your specific building on the DLD index at ${DLD_SERVICE_CHARGE_INDEX_URL}.`,
      convention: true,
    });
  }

  out.push({
    label: "Vacancy",
    amount: 5,
    note: "5% of gross rent, about two to three weeks a year empty. No official Dubai vacancy figure is published, so this is a convention.",
    convention: true,
  });

  out.push({
    label: "Management",
    amount: 5,
    note: "5% of collected rent. Self-managing saves this but costs you the time.",
    convention: true,
  });

  if (input.mortgage) {
    out.push({
      label: "Purchase costs are cash",
      amount: 0,
      note: COSTS_CASH_RULE_NOTE,
    });
  }

  return out;
}
