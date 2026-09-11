"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Info,
  Lock,
  Wallet,
  TrendingUp,
  Scale,
} from "lucide-react";
import { Link } from "@/navigation";
import type { CostLine, DealAlternative, DealQuestion, RentalEconomics, CashRequired, PriceAssessment, DealInput } from "@/lib/deal-check/types";

/** Server-side teaser shape — the locked half arrives separately on unlock. */
export interface Teaser {
  gated: true;
  input: DealInput;
  verdict: string;
  price: PriceAssessment;
  cashTotal: number;
  cashCostsTotal: number;
  cashPctOfPrice: number | null;
  lockedCounts: {
    costLines: number;
    questions: number;
    alternatives: number;
    hasRental: boolean;
    hasSchedule: boolean;
  };
  dataAsOf: string | null;
  generatedAt: string;
}

export interface Unlocked {
  cash: CashRequired;
  rental: RentalEconomics;
  questions: DealQuestion[];
  alternatives: DealAlternative[];
  assumptions: CostLine[];
  missing: string[];
}

const aed = (n: number | null | undefined) =>
  n == null ? "—" : `AED ${Math.round(n).toLocaleString()}`;

/* ── Shared chrome ─────────────────────────────────────────────────────── */

function Card({
  title,
  icon: Icon,
  children,
  aside,
}: {
  title: string;
  icon: typeof Wallet;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-7">
      <header className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#0B3D2E]" aria-hidden />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
        {aside && <div className="ms-auto">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const color =
    tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-foreground";
  return (
    <div className="rounded-xl bg-background/70 border border-border/50 px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="text-xs sm:text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className={`text-base sm:text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={`text-sm ${strong ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span
        className={`tabular-nums shrink-0 ${strong ? "text-base sm:text-lg font-semibold text-foreground" : "text-sm text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function LineRow({ line, typicalLabel, rangeLabel }: { line: CostLine; typicalLabel: string; rangeLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-border/40 last:border-0">
      <div className="flex items-baseline justify-between gap-3 py-2.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-start text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0"
          aria-expanded={open}
        >
          <span className="truncate">{line.label}</span>
          {line.convention && (
            <span className="hidden sm:inline text-[10px] uppercase tracking-wide text-muted-foreground/60 border border-border/60 rounded px-1 py-px shrink-0">
              {typicalLabel}
            </span>
          )}
          <Info className="w-3 h-3 opacity-40 shrink-0" aria-hidden />
        </button>
        <span className="text-sm font-medium text-foreground tabular-nums shrink-0">
          {aed(line.amount)}
        </span>
      </div>
      {open && (
        <p className="pb-3 text-xs leading-relaxed text-muted-foreground">
          {line.note}
          {line.range && (
            <span className="block mt-1 text-muted-foreground/80">
              {rangeLabel}: {aed(line.range.min)} – {aed(line.range.max)}
            </span>
          )}
        </p>
      )}
    </li>
  );
}

/* ── The report ────────────────────────────────────────────────────────── */

export default function DealCheckReportView({
  teaser,
  unlocked,
  marketingClaims,
  onUnlock,
}: {
  teaser: Teaser;
  unlocked: Unlocked | null;
  marketingClaims: string[];
  onUnlock: () => void;
}) {
  const t = useTranslations("dealCheck");
  const { input, price } = teaser;

  const VERDICT_STYLE: Record<string, { label: string; bg: string; fg: string }> = {
    "well-below": { label: t("vWellBelow"), bg: "bg-emerald-50", fg: "text-emerald-700" },
    below: { label: t("vBelow"), bg: "bg-emerald-50", fg: "text-emerald-700" },
    "in-line": { label: t("vInLine"), bg: "bg-slate-100", fg: "text-slate-700" },
    above: { label: t("vAbove"), bg: "bg-amber-50", fg: "text-amber-700" },
    "well-above": { label: t("vWellAbove"), bg: "bg-red-50", fg: "text-red-700" },
    unknown: { label: t("vUnknown"), bg: "bg-slate-100", fg: "text-slate-600" },
  };
  const CONFIDENCE_COPY: Record<string, string> = {
    strong: t("confStrong"),
    usable: t("confUsable"),
    thin: t("confThin"),
    none: t("confNone"),
  };

  const v = VERDICT_STYLE[price.verdict] ?? VERDICT_STYLE.unknown;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      {/* What we read */}
      <div className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3.5 sm:px-5 sm:py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
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
          {input.price && <span className="text-foreground font-medium">{aed(input.price)}</span>}
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground/80 sm:text-xs">{t("readBack")}</p>
      </div>

      {/* Verdict */}
      <section className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-7">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 text-[#0B3D2E]" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t("verdictTitle")}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{teaser.verdict}</p>
          </div>
        </div>
      </section>

      {/* Price — always free, this is the proof */}
      <Card
        title={t("priceTitle")}
        icon={TrendingUp}
        aside={
          <span className={`text-xs font-semibold px-2.5 py-1.5 sm:py-1 rounded-full whitespace-nowrap ${v.bg} ${v.fg}`}>
            {v.label}
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-4 sm:mb-5">
          <Stat label={t("priceThis")} value={price.subjectPsf ? t("rentPerSqft", { value: aed(price.subjectPsf) }) : "—"} />
          <Stat label={t("priceComparable")} value={price.comparablePsf ? t("rentPerSqft", { value: aed(price.comparablePsf) }) : "—"} />
          <div className="col-span-2 sm:col-span-1">
            <Stat
              label={t("priceDifference")}
              value={price.deltaPct != null ? `${price.deltaPct > 0 ? "+" : ""}${(price.deltaPct * 100).toFixed(1)}%` : "—"}
              tone={price.deltaPct == null ? "neutral" : price.deltaPct > 0.03 ? "warn" : price.deltaPct < -0.03 ? "good" : "neutral"}
            />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{price.summary}</p>

        <footer className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground space-y-1">
          {price.comparableLabel && (
            <p>
              {t("priceComparedAgainst")} <span className="text-foreground">{price.comparableLabel}</span>
              {price.sampleSize ? ` — ${t("priceTransactions", { count: price.sampleSize.toLocaleString() })}` : ""}.
            </p>
          )}
          <p>
            {CONFIDENCE_COPY[price.confidence]} {price.source}
            {price.periodLabel ? `, ${price.periodLabel}` : ""}.
          </p>
        </footer>
      </Card>

      {/* Cash — headline free, breakdown gated */}
      <Card title={t("cashTitle")} icon={Wallet}>
        <div className="rounded-xl bg-background/70 border border-border/60 px-4 py-3.5 space-y-2">
          <Row label={t("cashPurchaseCosts")} value={aed(teaser.cashCostsTotal)} />
          <div className="pt-2 border-t border-border/60">
            <Row label={t("cashTotal")} value={aed(teaser.cashTotal)} strong />
          </div>
          {teaser.cashPctOfPrice != null && (
            <p className="text-xs text-muted-foreground pt-1">
              {t("cashPctOfPrice", { pct: teaser.cashPctOfPrice })}
            </p>
          )}
        </div>

        {unlocked ? (
          <>
            {unlocked.cash.financing && (
              <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-4">
                <Stat label={t("cashDeposit")} value={aed(unlocked.cash.financing.downPayment)} />
                <Stat label={t("cashMortgage")} value={aed(unlocked.cash.financing.loanAmount)} />
                <Stat label={t("cashLtv")} value={`${Math.round(unlocked.cash.financing.ltv * 100)}%`} />
              </div>
            )}
            {unlocked.cash.financing?.ltvCapped && (
              <p className="mt-4 flex gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden />
                {t("cashLtvCapped")}
              </p>
            )}
            <ul className="mt-4">
              {unlocked.cash.lines.map((l) => (
                <LineRow key={l.label} line={l} typicalLabel={t("typical")} rangeLabel={t("rangeLabel")} />
              ))}
            </ul>

            {unlocked.cash.schedule && (
              <div className="mt-5">
                <h4 className="text-sm font-medium text-foreground mb-3">{t("cashScheduleTitle")}</h4>
                <ul className="space-y-2">
                  {unlocked.cash.schedule.map((s, i) => (
                    <li
                      key={`${s.label}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 sm:px-4 sm:py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{s.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.timing}
                          {s.extras.length > 0 && ` · ${t("cashIncludesFees")}`}
                        </p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-sm font-medium text-foreground tabular-nums">
                          {aed(s.amount + s.extras.reduce((a, e) => a + e.amount, 0))}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {t("cashRunning")}: {aed(s.cumulative)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <LockedStrip
            onUnlock={onUnlock}
            items={[
              t("lockCostBreakdown", { count: teaser.lockedCounts.costLines }),
              ...(teaser.lockedCounts.hasSchedule ? [t("lockSchedule")] : []),
            ]}
          />
        )}
      </Card>

      {/* Rental — fully gated */}
      {unlocked ? (
        <Card title={t("rentalTitle")} icon={Building2}>
          {unlocked.rental.grossRent == null ? (
            <p className="text-sm text-muted-foreground">{t("rentalNoData")}</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-4 sm:mb-5">
                <Stat label={t("rentalGross")} value={aed(unlocked.rental.grossRent)} />
                <Stat label={t("rentalNet")} value={aed(unlocked.rental.netIncome)} />
                <Stat
                  label={t("rentalNetYield")}
                  value={unlocked.rental.netYieldPct != null ? `${unlocked.rental.netYieldPct}%` : "—"}
                  tone={unlocked.rental.netYieldPct != null && unlocked.rental.netYieldPct >= 5 ? "good" : "neutral"}
                />
              </div>

              <ul className="mb-4">
                {unlocked.rental.deductions.map((d) => (
                  <LineRow key={d.label} line={d} typicalLabel={t("typical")} rangeLabel={t("rangeLabel")} />
                ))}
              </ul>

              <div className="rounded-xl bg-background/70 border border-border/60 px-4 py-3.5 space-y-2">
                <Row label={t("rentalGrossYield")} value={unlocked.rental.grossYieldPct != null ? `${unlocked.rental.grossYieldPct}%` : "—"} />
                <Row label={t("rentalNetOnPrice")} value={unlocked.rental.netYieldPct != null ? `${unlocked.rental.netYieldPct}%` : "—"} />
                <Row
                  label={t("rentalReturnTotal")}
                  value={unlocked.rental.netYieldOnCashPct != null ? `${unlocked.rental.netYieldOnCashPct}%` : "—"}
                  strong
                />
                {unlocked.rental.areaGrossYieldPct != null && (
                  <p className="text-xs text-muted-foreground pt-1">
                    {t("rentalDldCompare", { pct: unlocked.rental.areaGrossYieldPct })}
                  </p>
                )}
              </div>

              <details className="mt-4 group">
                <summary className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none">
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" aria-hidden />
                  {t("rentalAssumptions")}
                </summary>
                <ul className="mt-3 space-y-2">
                  {unlocked.rental.assumptions.map((a, i) => (
                    <li key={i} className="text-xs leading-relaxed text-muted-foreground">· {a}</li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </Card>
      ) : (
        teaser.lockedCounts.hasRental && (
          <LockedCard
            title={t("rentalTitle")}
            icon={Building2}
            onUnlock={onUnlock}
            items={[t("lockRentalYield"), t("lockRentalCosts"), t("lockRentalAssumptions")]}
          />
        )
      )}

      {/* Claims — free. A visitor should see what they're being told, unprompted. */}
      {marketingClaims.length > 0 && (
        <Card title={t("claimsTitle")} icon={AlertTriangle}>
          <p className="text-sm text-muted-foreground mb-4">{t("claimsIntro")}</p>
          <ul className="space-y-2">
            {marketingClaims.map((c, i) => (
              <li key={i} className="text-sm text-foreground bg-amber-50/60 border border-amber-200/60 rounded-xl px-4 py-3">
                &ldquo;{c}&rdquo;
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Questions — gated */}
      {unlocked ? (
        <Card title={t("questionsTitle")} icon={HelpCircle}>
          <ul className="space-y-4">
            {unlocked.questions.map((q, i) => (
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
        </Card>
      ) : (
        <LockedCard
          title={t("questionsTitle")}
          icon={HelpCircle}
          onUnlock={onUnlock}
          items={[t("lockQuestions", { count: teaser.lockedCounts.questions })]}
        />
      )}

      {/* Alternatives — gated */}
      {unlocked && unlocked.alternatives.length > 0 && (
        <Card title={t("alternativesTitle")} icon={ArrowRight}>
          <ul className="space-y-3">
            {unlocked.alternatives.map((a) => (
              <li key={`${a.kind}-${a.slug}`}>
                <Link
                  href={a.url ?? "#"}
                  className="flex gap-3 sm:gap-4 rounded-xl border border-border/50 bg-background/60 p-3 hover:border-accent/40 transition-colors group"
                >
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image} alt="" loading="lazy" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">{a.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[a.price ? aed(a.price) : null, a.pricePsf ? t("rentPerSqft", { value: aed(a.pricePsf) }) : null, a.handover]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-xs text-muted-foreground/90 mt-1.5 leading-relaxed line-clamp-2 sm:line-clamp-none">{a.rationale}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">{t("alternativesFooter")}</p>
        </Card>
      )}
      {!unlocked && teaser.lockedCounts.alternatives > 0 && (
        <LockedCard
          title={t("alternativesTitle")}
          icon={ArrowRight}
          onUnlock={onUnlock}
          items={[t("lockAlternatives", { count: teaser.lockedCounts.alternatives })]}
        />
      )}

      {/* Disclosure */}
      <div className="rounded-2xl border border-border/50 bg-background/40 px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-xs">
          <span className="font-medium text-foreground">{t("disclosureLead")}</span> {t("disclosureBody")}{" "}
          <a
            href="https://dubailand.gov.ae/en/eservices/service-charge-index-overview/service-charge-index"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            {t("disclosureLink")}
          </a>
          {t("disclosureTail")}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Lock affordances ──────────────────────────────────────────────────── */

/**
 * A locked section. Deliberately shows WHAT is behind the gate and how much of
 * it, rather than a blurred smear of fake numbers — the visitor can make an
 * informed decision about whether it's worth their phone number, and we never
 * render placeholder figures that could be mistaken for real ones.
 */
function LockedCard({
  title,
  icon: Icon,
  items,
  onUnlock,
}: {
  title: string;
  icon: typeof Wallet;
  items: string[];
  onUnlock: () => void;
}) {
  const t = useTranslations("dealCheck");
  return (
    <section className="rounded-2xl border border-dashed border-accent/40 bg-accent/[0.03] p-4 sm:p-7">
      <header className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent" aria-hidden />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
        <Lock className="w-4 h-4 text-accent/60 ms-auto shrink-0" aria-hidden />
      </header>
      <ul className="space-y-2 mb-4">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent/50 shrink-0 mt-0.5" aria-hidden />
            {it}
          </li>
        ))}
      </ul>
      <button
        onClick={onUnlock}
        className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-md"
        style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}
      >
        <Lock className="w-3.5 h-3.5" aria-hidden />
        {t("unlockCta")}
      </button>
    </section>
  );
}

/** Inline lock, used inside an otherwise-visible card. */
function LockedStrip({ items, onUnlock }: { items: string[]; onUnlock: () => void }) {
  const t = useTranslations("dealCheck");
  return (
    <div className="mt-4 rounded-xl border border-dashed border-accent/40 bg-accent/[0.03] p-4">
      <ul className="space-y-2 mb-3.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-accent/50 shrink-0 mt-0.5" aria-hidden />
            {it}
          </li>
        ))}
      </ul>
      <button
        onClick={onUnlock}
        className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-md"
        style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}
      >
        {t("unlockCta")}
      </button>
    </div>
  );
}
