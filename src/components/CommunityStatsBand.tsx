/* eslint-disable i18next/no-literal-string -- programmatic SEO component; data-driven English copy, like the other area/landing templates */
// Server component (no "use client") so the stats + FAQs render in SSR HTML —
// real, crawlable depth for community/area/off-plan-in templates, plus FAQPage
// schema for rich results / AI answers. Renders nothing when there's no data.
import Link from "next/link";
import { TrendingUp, Percent, Building2, LineChart } from "lucide-react";
import { FAQJsonLd } from "@/components/JsonLd";
import type { CommunityStat } from "@/lib/market";
import { fmtAed } from "@/lib/market";

interface Props {
  name: string;
  stats: CommunityStat | null;
  faqs: { question: string; answer: string }[];
  // Real DLD buildings in this area — crawlable links that pass equity to the
  // /building/[slug] pages. localePrefix keeps the link locale-correct.
  buildings?: { slug: string; name: string }[];
  localePrefix?: string;
  nonce?: string;
}

export default function CommunityStatsBand({ name, stats, faqs, buildings = [], localePrefix = "", nonce }: Props) {
  const hasStats = !!(stats && (stats.avgPricePerSqft || stats.rentalYield || stats.totalListings));
  if (!hasStats && faqs.length === 0 && buildings.length === 0) return null;

  const cards = stats
    ? [
        { icon: TrendingUp, label: "Avg Price / sqft", value: stats.avgPricePerSqft ? `AED ${stats.avgPricePerSqft.toLocaleString("en-AE")}` : "-" },
        { icon: Percent, label: "Avg Gross Yield", value: stats.rentalYield ? `${stats.rentalYield}%` : "-" },
        { icon: Building2, label: "Listings Available", value: stats.totalListings ? stats.totalListings.toLocaleString("en-AE") : "-" },
        { icon: LineChart, label: "Avg Sale Price", value: fmtAed(stats.avgSalePrice) },
      ]
    : [];

  return (
    <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} nonce={nonce} />}

      {hasStats && (
        <>
          <div className="flex items-end justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{name} market snapshot</h2>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">DLD + listings data</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border/50 bg-border/40 mb-3">
            {cards.map((c) => (
              <div key={c.label} className="bg-background px-4 py-5 sm:py-6 text-center">
                <c.icon className="h-4 w-4 mx-auto mb-2" style={{ color: "#D4A847" }} />
                <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">{c.value}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 tracking-[0.1em] uppercase leading-tight">{c.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Figures are indicative averages across current listings and Dubai Land Department transaction data for {name}; individual units vary.
          </p>
        </>
      )}

      {buildings.length > 0 && (
        <nav aria-label={`Buildings in ${name}`} className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Top buildings in {name}</h2>
          <p className="text-sm text-muted-foreground mb-4">Explore transaction history, prices and unit mix for individual buildings.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {buildings.map((b) => (
              <li key={b.slug}>
                <Link href={`${localePrefix}/building/${b.slug}`} className="hover:text-primary hover:underline transition-colors">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {faqs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{name}: frequently asked questions</h2>
          <div className="divide-y divide-border/60 rounded-2xl border border-border/50 overflow-hidden">
            {faqs.map((f) => (
              <details key={f.question} className="group bg-background">
                <summary className="cursor-pointer list-none px-4 sm:px-5 py-4 flex items-center justify-between gap-3 font-semibold text-sm text-foreground hover:bg-accent/5">
                  {f.question}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-4 sm:px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
