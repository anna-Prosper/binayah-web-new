"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, HelpCircle, Home, Lock, TrendingUp } from "lucide-react";
import type { DealInput, DealQuestion, RentAssessment } from "@/lib/deal-check/types";

export interface RentTeaser {
  gated: true;
  input: DealInput;
  rent: Omit<RentAssessment, "questions">;
  lockedCounts: { questions: number };
  generatedAt: string;
}

const aed = (n: number | null | undefined) =>
  n == null ? "—" : `AED ${Math.round(n).toLocaleString()}`;

/**
 * The rent-side report. A tenant is answering a different question from a
 * buyer — "am I being overcharged?" — so this compares the asking rent against
 * median registered Ejari contracts rather than running any purchase maths.
 */
export default function RentCheckReport({
  teaser,
  questions,
  onUnlock,
}: {
  teaser: RentTeaser;
  questions: DealQuestion[] | null;
  onUnlock: () => void;
}) {
  const t = useTranslations("dealCheck");
  const { input, rent } = teaser;

  const STYLE: Record<string, { label: string; bg: string; fg: string }> = {
    // Below market is GOOD for a tenant — the inverse of the purchase report.
    "well-below": { label: t("vWellBelow"), bg: "bg-emerald-50", fg: "text-emerald-700" },
    below: { label: t("vBelow"), bg: "bg-emerald-50", fg: "text-emerald-700" },
    "in-line": { label: t("vInLine"), bg: "bg-slate-100", fg: "text-slate-700" },
    above: { label: t("vAbove"), bg: "bg-amber-50", fg: "text-amber-700" },
    "well-above": { label: t("vWellAbove"), bg: "bg-red-50", fg: "text-red-700" },
    unknown: { label: t("vUnknown"), bg: "bg-slate-100", fg: "text-slate-600" },
  };
  const v = STYLE[rent.verdict] ?? STYLE.unknown;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      {/* What we read */}
      <div className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3.5 sm:px-5 sm:py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-accent">{t("modeRent")}</span>
          <span className="text-foreground font-medium">
            {input.bedrooms === 0
              ? t("unitStudio")
              : input.bedrooms != null
                ? t("unitBed", { n: input.bedrooms })
                : t("unitProperty")}{" "}
            {input.propertyKind ?? ""}
          </span>
          {input.community && <span>{input.community}</span>}
          {input.areaSqft && <span>{t("unitSqft", { n: input.areaSqft.toLocaleString() })}</span>}
          {rent.askingRent && <span className="text-foreground font-medium">{t("rentPerYear", { value: aed(rent.askingRent) })}</span>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground/80">{t("readBack")}</p>
      </div>

      {/* Rent vs registered contracts */}
      <section className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-7">
        <header className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-[#0B3D2E]" aria-hidden />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{t("rentTitle")}</h3>
          <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ms-auto ${v.bg} ${v.fg}`}>
            {v.label}
          </span>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-4 sm:mb-5">
          <div className="rounded-xl bg-background/70 border border-border/50 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-0.5">{t("rentAsking")}</p>
            <p className="text-base sm:text-lg font-semibold tabular-nums text-foreground">
              {rent.askingRentPsf ? t("rentPerSqft", { value: aed(rent.askingRentPsf) }) : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-background/70 border border-border/50 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-0.5">{t("rentMarket")}</p>
            <p className="text-base sm:text-lg font-semibold tabular-nums text-foreground">
              {rent.marketRentPsf ? t("rentPerSqft", { value: aed(rent.marketRentPsf) }) : "—"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-xl bg-background/70 border border-border/50 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-0.5">{t("priceDifference")}</p>
            <p
              className={`text-base sm:text-lg font-semibold tabular-nums ${
                rent.deltaPct == null
                  ? "text-foreground"
                  : rent.deltaPct > 0.03
                    ? "text-amber-700"
                    : rent.deltaPct < -0.03
                      ? "text-emerald-700"
                      : "text-foreground"
              }`}
            >
              {rent.deltaPct != null ? `${rent.deltaPct > 0 ? "+" : ""}${(rent.deltaPct * 100).toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{rent.summary}</p>

        {rent.impliedMarketRent != null && (
          <div className="mt-4 rounded-xl bg-background/70 border border-border/60 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("rentImplied")}</span>
              <span className="text-sm font-medium text-foreground tabular-nums">{aed(rent.impliedMarketRent)}</span>
            </div>
          </div>
        )}
      </section>

      {/* Rent vs buy */}
      {rent.impliedPurchasePrice != null && (
        <section className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-7">
          <header className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-[#0B3D2E]" aria-hidden />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{t("rentBuyTitle")}</h3>
          </header>
          <div className="rounded-xl bg-background/70 border border-border/60 px-4 py-3.5 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("rentBuyPrice")}</span>
              <span className="text-base font-semibold text-foreground tabular-nums">{aed(rent.impliedPurchasePrice)}</span>
            </div>
            {rent.impliedGrossYieldPct != null && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-muted-foreground">{t("rentBuyYield")}</span>
                <span className="text-sm font-medium text-foreground tabular-nums">{rent.impliedGrossYieldPct}%</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("rentBuyNote")}</p>
        </section>
      )}

      {/* Questions — gated */}
      {questions ? (
        <section className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-7">
          <header className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-[#0B3D2E]" aria-hidden />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{t("rentQuestionsTitle")}</h3>
          </header>
          <ul className="space-y-4">
            {questions.map((q, i) => (
              <li key={i} className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  {q.priority ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground/50" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{q.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-accent/40 bg-accent/[0.03] p-4 sm:p-7">
          <header className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-accent" aria-hidden />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{t("rentQuestionsTitle")}</h3>
            <Lock className="w-4 h-4 text-accent/60 ms-auto shrink-0" aria-hidden />
          </header>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-accent/50 shrink-0 mt-0.5" aria-hidden />
              {t("lockQuestions", { count: teaser.lockedCounts.questions })}
            </li>
          </ul>
          <button
            onClick={onUnlock}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-md"
            style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}
          >
            <Lock className="w-3.5 h-3.5" aria-hidden />
            {t("unlockCta")}
          </button>
        </section>
      )}

      <div className="rounded-2xl border border-border/50 bg-background/40 px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{t("disclosureLead")}</span> {t("rentDisclosure")}
        </p>
      </div>
    </motion.div>
  );
}
