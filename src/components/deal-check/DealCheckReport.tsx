/* eslint-disable i18next/no-literal-string -- English-only tool copy, matching the valuation page pattern */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Info,
  Wallet,
  TrendingUp,
  Scale,
} from "lucide-react";
import { Link } from "@/navigation";
import type { DealCheckReport as Report, CostLine } from "@/lib/deal-check/types";

const aed = (n: number | null | undefined) =>
  n == null ? "—" : `AED ${Math.round(n).toLocaleString()}`;

const VERDICT_STYLE: Record<string, { label: string; bg: string; fg: string }> = {
  "well-below": { label: "Below market", bg: "bg-emerald-50", fg: "text-emerald-700" },
  below: { label: "Slightly below market", bg: "bg-emerald-50", fg: "text-emerald-700" },
  "in-line": { label: "At market", bg: "bg-slate-100", fg: "text-slate-700" },
  above: { label: "Above market", bg: "bg-amber-50", fg: "text-amber-700" },
  "well-above": { label: "Well above market", bg: "bg-red-50", fg: "text-red-700" },
  unknown: { label: "Not enough data", bg: "bg-slate-100", fg: "text-slate-600" },
};

const CONFIDENCE_COPY: Record<string, string> = {
  strong: "Based on a large sample of registered sales.",
  usable: "Based on a reasonable sample of registered sales.",
  thin: "Based on a small sample — treat as a signal, not a valuation.",
  none: "No matching registered sales found.",
};

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
    <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-7">
      <header className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#0B3D2E]" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {aside && <div className="ml-auto">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/** A money row with its assumption available on demand rather than in a wall of text. */
function LineRow({ line }: { line: CostLine }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-border/40 last:border-0">
      <div className="flex items-baseline justify-between gap-4 py-2.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-expanded={open}
        >
          {line.label}
          {line.convention && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 border border-border/60 rounded px-1 py-px">
              typical
            </span>
          )}
          <Info className="w-3 h-3 opacity-40" aria-hidden />
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
              Range: {aed(line.range.min)} – {aed(line.range.max)}
            </span>
          )}
        </p>
      )}
    </li>
  );
}

export default function DealCheckReportView({
  report,
  marketingClaims,
  onRequestReview,
}: {
  report: Report;
  marketingClaims: string[];
  onRequestReview: () => void;
}) {
  const { input, price, cash, rental, questions, alternatives } = report;
  const v = VERDICT_STYLE[price.verdict] ?? VERDICT_STYLE.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* ── What we read ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-background/60 px-5 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-muted-foreground">
          <span className="text-foreground font-medium">
            {input.bedrooms === 0
              ? "Studio"
              : input.bedrooms != null
                ? `${input.bedrooms}-bed`
                : "Property"}{" "}
            {input.propertyKind ?? ""}
          </span>
          {input.community && <span>{input.community}</span>}
          {input.areaSqft && <span>{input.areaSqft.toLocaleString()} sqft</span>}
          {input.price && <span className="text-foreground font-medium">{aed(input.price)}</span>}
          {input.purchaseType && (
            <span className="capitalize">{input.purchaseType.replace("-", " ")}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground/80">
          This is what we read from what you sent. If anything is wrong, the numbers below will be
          too — correct it and run the check again.
        </p>
      </div>

      {/* ── The verdict ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 text-[#0B3D2E]" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2">The short version</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{report.verdict}</p>
          </div>
        </div>
      </section>

      {/* ── Price vs comparables ─────────────────────────────────────────── */}
      <Card
        title="Price against comparable sales"
        icon={TrendingUp}
        aside={
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.bg} ${v.fg}`}>
            {v.label}
          </span>
        }
      >
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <Stat label="This property" value={price.subjectPsf ? `${aed(price.subjectPsf)}/sqft` : "—"} />
          <Stat
            label="Comparable sales"
            value={price.comparablePsf ? `${aed(price.comparablePsf)}/sqft` : "—"}
          />
          <Stat
            label="Difference"
            value={price.deltaPct != null ? `${price.deltaPct > 0 ? "+" : ""}${(price.deltaPct * 100).toFixed(1)}%` : "—"}
            tone={price.deltaPct == null ? "neutral" : price.deltaPct > 0.03 ? "warn" : price.deltaPct < -0.03 ? "good" : "neutral"}
          />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{price.summary}</p>

        <footer className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground space-y-1">
          {price.comparableLabel && (
            <p>
              Compared against <span className="text-foreground">{price.comparableLabel}</span>
              {price.sampleSize ? ` — ${price.sampleSize.toLocaleString()} transactions` : ""}.
            </p>
          )}
          <p>
            {CONFIDENCE_COPY[price.confidence]}{" "}
            {price.source && <>Source: {price.source}</>}
            {price.periodLabel && <>, {price.periodLabel}</>}.
          </p>
        </footer>
      </Card>

      {/* ── Cash required ────────────────────────────────────────────────── */}
      <Card title="What you actually need in cash" icon={Wallet}>
        {cash.financing && (
          <div className="mb-5 grid sm:grid-cols-3 gap-4">
            <Stat label="Deposit" value={aed(cash.financing.downPayment)} />
            <Stat label="Mortgage" value={aed(cash.financing.loanAmount)} />
            <Stat label={`Loan-to-value`} value={`${Math.round(cash.financing.ltv * 100)}%`} />
          </div>
        )}

        {cash.financing?.ltvCapped && (
          <p className="mb-4 flex gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden />
            We&apos;ve capped the loan at the Central Bank limit for this purchase, so your deposit is
            higher than the figure you chose.
          </p>
        )}

        <ul className="mb-4">
          {cash.lines.map((l) => (
            <LineRow key={l.label} line={l} />
          ))}
        </ul>

        <div className="rounded-xl bg-background/70 border border-border/60 px-4 py-3.5 space-y-2">
          <Row label="Purchase costs" value={aed(cash.total)} />
          {input.price && (
            <Row
              label={cash.financing ? "Deposit" : "Purchase price"}
              value={aed(cash.financing ? cash.financing.downPayment : input.price)}
            />
          )}
          <div className="pt-2 border-t border-border/60">
            <Row label="Total cash needed" value={aed(cash.totalWithPrice)} strong />
          </div>
          {input.price && (
            <p className="text-xs text-muted-foreground pt-1">
              Purchase costs are {((cash.total / input.price) * 100).toFixed(1)}% of the price.
            </p>
          )}
        </div>

        {/* Off-plan schedule */}
        {cash.schedule && (
          <div className="mt-5">
            <h4 className="text-sm font-medium text-foreground mb-3">When the money is due</h4>
            <ul className="space-y-2">
              {cash.schedule.map((s, i) => (
                <li
                  key={`${s.label}-${i}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.timing}
                      {s.extras.length > 0 && " · includes registration fees"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground tabular-nums">{aed(s.amount + s.extras.reduce((a, e) => a + e.amount, 0))}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      running: {aed(s.cumulative)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* ── Rental economics ─────────────────────────────────────────────── */}
      <Card title="What it earns as a rental" icon={Building2}>
        {rental.grossRent == null ? (
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t model the rental side without a size or a stated rent. Add the size and
            run the check again for the income picture.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <Stat label="Gross rent (annual)" value={aed(rental.grossRent)} />
              <Stat label="Net income" value={aed(rental.netIncome)} />
              <Stat
                label="Net yield"
                value={rental.netYieldPct != null ? `${rental.netYieldPct}%` : "—"}
                tone={rental.netYieldPct != null && rental.netYieldPct >= 5 ? "good" : "neutral"}
              />
            </div>

            <ul className="mb-4">
              {rental.deductions.map((d) => (
                <LineRow key={d.label} line={d} />
              ))}
            </ul>

            <div className="rounded-xl bg-background/70 border border-border/60 px-4 py-3.5 space-y-2">
              <Row label="Gross yield" value={rental.grossYieldPct != null ? `${rental.grossYieldPct}%` : "—"} />
              <Row label="Net yield on price" value={rental.netYieldPct != null ? `${rental.netYieldPct}%` : "—"} />
              <Row
                label="Return on total invested"
                value={rental.netYieldOnCashPct != null ? `${rental.netYieldOnCashPct}%` : "—"}
                strong
              />
              {rental.areaGrossYieldPct != null && (
                <p className="text-xs text-muted-foreground pt-1">
                  For comparison, DLD&apos;s registered figures put the gross yield across this area at{" "}
                  {rental.areaGrossYieldPct}%.
                </p>
              )}
            </div>

            <details className="mt-4 group">
              <summary className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none">
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" aria-hidden />
                What we assumed
              </summary>
              <ul className="mt-3 space-y-2">
                {rental.assumptions.map((a, i) => (
                  <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                    · {a}
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
      </Card>

      {/* ── Marketing claims, if any ─────────────────────────────────────── */}
      {marketingClaims.length > 0 && (
        <Card title="Claims worth checking" icon={AlertTriangle}>
          <p className="text-sm text-muted-foreground mb-4">
            The listing makes these claims. None of them are verified by us, and projected returns in
            particular are marketing rather than fact — ask for the evidence behind each one.
          </p>
          <ul className="space-y-2">
            {marketingClaims.map((c, i) => (
              <li
                key={i}
                className="text-sm text-foreground bg-amber-50/60 border border-amber-200/60 rounded-xl px-4 py-3"
              >
                &ldquo;{c}&rdquo;
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ── Questions ────────────────────────────────────────────────────── */}
      <Card title="Questions to ask before you commit" icon={HelpCircle}>
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
      </Card>

      {/* ── Alternatives ─────────────────────────────────────────────────── */}
      {alternatives.length > 0 && (
        <Card title="Worth comparing against" icon={ArrowRight}>
          <ul className="space-y-3">
            {alternatives.map((a) => (
              <li key={`${a.kind}-${a.slug}`}>
                <Link
                  href={a.url ?? "#"}
                  className="flex gap-4 rounded-xl border border-border/50 bg-background/60 p-3 hover:border-accent/40 transition-colors group"
                >
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image}
                      alt=""
                      loading="lazy"
                      className="w-20 h-20 rounded-lg object-cover shrink-0 bg-muted"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[
                        a.price ? aed(a.price) : null,
                        a.pricePsf ? `${aed(a.pricePsf)}/sqft` : null,
                        a.handover ? `handover ${a.handover}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-xs text-muted-foreground/90 mt-1.5 leading-relaxed">
                      {a.rationale}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            These are Binayah listings, so treat them as what they are — our own stock, shown because
            they are genuinely comparable, not because they are the only options in the market.
          </p>
        </Card>
      )}

      {/* ── Second opinion ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border/50 bg-[#0B3D2E] p-6 sm:p-8 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Want someone to look at it with you?</h3>
        <p className="text-sm text-white/70 max-w-md mx-auto mb-5">
          You already have the full assessment above. If you want a person to go through it — including
          the parts we couldn&apos;t verify — one of our agents will call you back.
        </p>
        <button
          onClick={onRequestReview}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#0B3D2E] bg-white hover:bg-white/90 transition-colors"
        >
          Ask for a second opinion
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </section>

      {/* ── Disclosure ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-background/40 px-5 py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">How to read this.</span> Price comparisons use
          sale transactions registered with the Dubai Land Department. Service charges are estimated at
          community level because Dubai publishes them per building — check yours on the{" "}
          <a
            href="https://dubailand.gov.ae/en/eservices/service-charge-index-overview/service-charge-index"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            DLD service charge index
          </a>
          . Rent, vacancy and management figures are modelled, not quoted. This is market information
          to help you ask better questions — it is not a valuation, and it is not financial advice. For
          a mortgage or any legal purpose you need a RICS-certified valuation.
        </p>
      </div>
    </motion.div>
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
    <div className="rounded-xl bg-background/70 border border-border/50 px-4 py-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className={`text-sm ${strong ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span
        className={`tabular-nums shrink-0 ${strong ? "text-lg font-semibold text-foreground" : "text-sm text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
