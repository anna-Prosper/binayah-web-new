/* eslint-disable i18next/no-literal-string -- market-report copy is English */
// Server component — renders the weekly market report's structured data as
// branded KPI tiles, a ranked movers table and project cards. Purely
// presentational (no hooks), so it ships zero JS. Falls back to prose content
// (rendered by the page) when reportData is absent.
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Building2, Award, ArrowRight, Landmark } from "lucide-react";

interface Kpis {
  deals: number; volume: number;
  offPlanCount: number; offPlanPct: number;
  readyCount: number; readyPct: number;
  medianPpsf: number | null;
  highestDeal: number | null; highestDealBuilding: string; highestDealArea: string;
}
interface Macro { yoyGrowth?: number | null; transactionsAnnual?: number | null; transactionsYear?: number | null; newSupplyUnits?: number | null; newSupplyYear?: number | null; }
interface Mover { name: string; slug: string; ppsf: number; changePct: number; trend: "up" | "down" | "flat"; }
interface Launch { name: string; slug: string; community: string; communitySlug: string; startingPrice: number; }
export interface ReportData {
  rangeLabel?: string;
  narrative?: string;          // lead paragraph (also used for the meta description)
  narrativeParas?: string[];   // full multi-paragraph analysis (SEO body copy)
  outlook?: string;            // "what this means for buyers & investors"
  kpis?: Kpis | null; macro?: Macro | null;
  movers?: Mover[]; launches?: Launch[];
}

function fmtAed(n: number): string {
  if (n >= 1e9) return `AED ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `AED ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `AED ${Math.round(n / 1e3)}K`;
  return `AED ${Math.round(n).toLocaleString()}`;
}
const lp = (locale: string, path: string) => (locale === "en" ? path : `/${locale}${path}`);

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-5 py-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground leading-none">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function WeeklyReportView({ data, locale }: { data: ReportData; locale: string }) {
  const k = data.kpis;
  const movers = data.movers || [];
  const launches = data.launches || [];
  const maxPpsf = movers.reduce((m, x) => Math.max(m, x.ppsf), 0) || 1;

  return (
    <div className="mt-8 space-y-12">
      {/* KPI tiles */}
      {k && (
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Weekly deals" value={k.deals.toLocaleString()} sub="residential sales" />
            <Stat label="Sales volume" value={fmtAed(k.volume)} sub="total value" />
            <Stat label="Off-plan share" value={`${k.offPlanPct}%`} sub={`${k.readyPct}% ready`} />
            <Stat label="Median price" value={k.medianPpsf ? `AED ${k.medianPpsf.toLocaleString()}` : "—"} sub="per sqft" />
          </div>
          {/* Highest deal — gold gradient callout band */}
          {k.highestDeal && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-4 shadow-sm" style={{ background: "linear-gradient(135deg, #EAC873 0%, #D4A847 45%, #B8922F 100%)", color: "#0B3D2E" }}>
              <Award className="h-6 w-6 shrink-0" style={{ color: "#0B3D2E" }} />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(11,61,46,0.72)" }}>Highest deal this week</div>
                <div className="text-xl font-extrabold" style={{ color: "#0B3D2E" }}>
                  {fmtAed(k.highestDeal)}
                  {(k.highestDealBuilding || k.highestDealArea) && (
                    <span className="ml-2 text-base font-medium" style={{ color: "rgba(11,61,46,0.82)" }}>
                      — {[k.highestDealBuilding, k.highestDealArea].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Narrative — full analysis (falls back to the single lead paragraph) */}
      {(data.narrativeParas?.length ? data.narrativeParas : data.narrative ? [data.narrative] : []).length > 0 && (
        <section className="max-w-3xl space-y-4">
          {(data.narrativeParas?.length ? data.narrativeParas : [data.narrative!]).map((para, i) => (
            <p key={i} className="text-lg leading-relaxed text-foreground/90">{para}</p>
          ))}
        </section>
      )}

      {/* Macro at a glance */}
      {data.macro && (data.macro.yoyGrowth != null || data.macro.transactionsAnnual != null || data.macro.newSupplyUnits != null) && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">The market at a glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.macro.yoyGrowth != null && <Stat label="YoY price growth" value={`${data.macro.yoyGrowth > 0 ? "+" : ""}${data.macro.yoyGrowth}%`} />}
            {data.macro.transactionsAnnual != null && <Stat label="Annual transactions" value={Number(data.macro.transactionsAnnual).toLocaleString()} sub={data.macro.transactionsYear ? String(data.macro.transactionsYear) : undefined} />}
            {data.macro.newSupplyUnits != null && <Stat label="New units expected" value={Number(data.macro.newSupplyUnits).toLocaleString()} sub={data.macro.newSupplyYear ? String(data.macro.newSupplyYear) : undefined} />}
          </div>
        </section>
      )}

      {/* Top movers — ranked rows */}
      {movers.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-1.5">Top-moving communities</h2>
          <p className="text-sm text-muted-foreground mb-5">Average sale price per sqft over the last 30 days, with month-on-month change (DLD data).</p>
          <div className="space-y-2.5">
            {movers.map((m, i) => {
              const Icon = m.trend === "up" ? TrendingUp : m.trend === "down" ? TrendingDown : Minus;
              const badgeColor = m.trend === "up" ? "#1A7A5A" : m.trend === "down" ? "#E53E3E" : "#6B7782";
              return (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>{i + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground truncate">
                      {m.slug ? <Link href={lp(locale, `/communities/${m.slug}`)} className="hover:text-primary transition-colors">{m.name}</Link> : m.name}
                    </div>
                    <div className="mt-1.5 h-1.5 w-full max-w-[220px] rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(8, Math.round((m.ppsf / maxPpsf) * 100))}%`, background: "linear-gradient(90deg, #1A7A5A, #0B3D2E)" }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-foreground tabular-nums">AED {m.ppsf.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/sqft</span></div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold" style={{ color: badgeColor }}>
                      <Icon className="h-3.5 w-3.5" />{m.changePct > 0 ? "+" : ""}{m.changePct}% MoM
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* New launches — project cards */}
      {launches.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-5">New project launches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {launches.map((l, i) => {
              const inner = (
                <>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-accent" style={{ color: "#B8922F" }}>
                    <Building2 className="h-3.5 w-3.5" /> New launch
                  </div>
                  <h3 className="mt-2 font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{l.name}</h3>
                  {l.community && <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><Landmark className="h-3 w-3" />{l.community}</p>}
                  <div className="mt-3 border-t border-border pt-3 text-sm font-bold text-primary">
                    {l.startingPrice > 0 ? `From ${fmtAed(l.startingPrice)}` : "Price on request"}
                  </div>
                </>
              );
              return l.slug ? (
                <Link key={i} href={lp(locale, `/project/${l.slug}`)} className="group block rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all">{inner}</Link>
              ) : (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">{inner}</div>
              );
            })}
          </div>
        </section>
      )}

      {/* What this means — buyer/investor takeaway (SEO body copy) */}
      {data.outlook && (
        <section className="max-w-3xl">
          <h2 className="text-xl font-bold text-foreground mb-4">What this means for buyers &amp; investors</h2>
          <p className="text-lg leading-relaxed text-foreground/90">{data.outlook}</p>
        </section>
      )}

      {/* CTA band */}
      <section className="rounded-2xl px-6 py-8 text-center text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <h2 className="text-2xl font-bold mb-2">Want tailored advice?</h2>
        <p className="text-white/75 max-w-xl mx-auto mb-5">Our advisors can brief you on any community or project in this report — pricing, yields and the right time to move.</p>
        <Link href={lp(locale, "/contact")} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
          Talk to our team <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
