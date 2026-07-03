/* eslint-disable i18next/no-literal-string -- programmatic SEO template; data-driven English */
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Percent } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { getMarketStats, fmtAed, type CommunityStat } from "@/lib/market";
import { BUY_COMMUNITIES } from "@/lib/buy-communities";
import { getNonce } from "@/lib/nonce";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";

// Two fixed ranking pages.
export function parseAreaRanking(slug: string): { mode: "yield" | "price" } | null {
  const s = slug.toLowerCase();
  if (s === "highest-yield-areas-in-dubai") return { mode: "yield" };
  if (s === "most-affordable-areas-in-dubai") return { mode: "price" };
  return null;
}

const norm = (s: string) => (s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

async function ranked(mode: "yield" | "price") {
  const data = await getMarketStats();
  const rows = (data?.communityMatrix || []) as CommunityStat[];
  // Map to known buy-communities so every row links somewhere real.
  const nameToSlug = new Map<string, { slug: string; name: string }>();
  for (const c of BUY_COMMUNITIES) {
    nameToSlug.set(norm(c.name), { slug: c.slug, name: c.name });
    const apiName = (c as { apiName?: string }).apiName;
    if (apiName) nameToSlug.set(norm(apiName), { slug: c.slug, name: c.name });
  }
  const items = rows
    .map((r) => ({ stat: r, link: nameToSlug.get(norm(r.area)) }))
    .filter((x) => x.link && (mode === "yield" ? x.stat.rentalYield > 0 : x.stat.avgPricePerSqft > 0));
  items.sort((a, b) =>
    mode === "yield" ? b.stat.rentalYield - a.stat.rentalYield : a.stat.avgPricePerSqft - b.stat.avgPricePerSqft,
  );
  return items.slice(0, 25);
}

export async function buildAreaRankingMeta(mode: "yield" | "price", locale: string, searchSlug: string): Promise<Metadata> {
  const title = mode === "yield"
    ? "Highest Rental Yield Areas in Dubai (DLD Data) | Binayah"
    : "Most Affordable Areas in Dubai by Price/sqft | Binayah";
  const description = mode === "yield"
    ? "Dubai communities ranked by average gross rental yield, using DLD and listings data — find the highest-ROI areas to invest in. Live data from Binayah."
    : "Dubai communities ranked from most affordable by average price per square foot, using DLD and listings data. Find where to buy on budget with Binayah.";
  const path = `/${searchSlug}`;
  return {
    title, description,
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: { title, description, type: "website", url: makeCanonical(locale, path), images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }] },
  };
}

export default async function AreaRankingView({ mode, locale, searchSlug }: { mode: "yield" | "price"; locale: string; searchSlug: string }) {
  const lp = locale === "en" ? "" : `/${locale}`;
  const nonce = await getNonce();
  const items = await ranked(mode);

  const h1 = mode === "yield" ? "Highest Rental Yield Areas in Dubai" : "Most Affordable Areas in Dubai";
  const intro = mode === "yield"
    ? "Dubai communities ranked by average gross rental yield, from DLD transaction and listings data. Higher yield means stronger rental ROI relative to purchase price."
    : "Dubai communities ranked from most affordable, by average price per square foot. A starting point for budget-conscious buyers and investors.";
  const faqs = mode === "yield"
    ? [
        { question: "Which area in Dubai has the highest rental yield?", answer: items[0]?.link ? `Based on current DLD and listings data, ${items[0].link.name} leads with an average gross yield of about ${items[0].stat.rentalYield}%. Yields shift with supply and demand — see the full ranking above.` : "See the ranked list above for the latest figures." },
        { question: "What is a good rental yield in Dubai?", answer: "Gross yields in Dubai typically range from roughly 5% to 9% depending on the community and unit type — generally higher than most mature global markets. Net yield is lower after service charges and management." },
      ]
    : [
        { question: "What is the cheapest area to buy property in Dubai?", answer: items[0]?.link ? `By average price per square foot, ${items[0].link.name} is among the most affordable communities (around AED ${items[0].stat.avgPricePerSqft.toLocaleString("en-AE")}/sqft). See the full ranking above.` : "See the ranked list above for the latest figures." },
        { question: "Is it cheaper to buy off-plan or ready in Dubai?", answer: "Off-plan is often 10–30% cheaper than comparable ready units and comes with payment plans, while ready property offers immediate use and rental income. The right choice depends on your timeline and goals." },
      ];

  const breadcrumbs = [
    { name: "Home", href: `${lp}/` },
    { name: "Pulse", href: `${lp}/pulse` },
    { name: h1, href: `${lp}/${searchSlug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <FAQJsonLd faqs={faqs} nonce={nonce} />
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-12 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.3em] uppercase text-xs mb-3">Dubai · DLD + Listings Data</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-3">{h1}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{intro}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        <ol className="rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/50">
          {items.map((x, i) => (
            <li key={x.link!.slug}>
              <Link href={`${lp}/off-plan-in/${x.link!.slug}`} className="flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-accent/5 transition-colors">
                <span className="text-sm font-bold text-muted-foreground w-6 tabular-nums">{i + 1}</span>
                <span className="flex-1 font-semibold text-foreground">{x.link!.name}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: "#1A7A5A" }}>
                  {mode === "yield" ? <Percent className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  {mode === "yield" ? `${x.stat.rentalYield}%` : `AED ${x.stat.avgPricePerSqft.toLocaleString("en-AE")}/sqft`}
                </span>
                {mode === "price" && x.stat.avgSalePrice ? (
                  <span className="hidden sm:inline text-xs text-muted-foreground">avg {fmtAed(x.stat.avgSalePrice)}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-muted-foreground mt-3">Figures are indicative averages from Dubai Land Department transactions and current listings; individual properties vary.</p>

        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          <div className="divide-y divide-border/60 rounded-2xl border border-border/50 overflow-hidden">
            {faqs.map((f) => (
              <details key={f.question} className="group bg-background">
                <summary className="cursor-pointer list-none px-4 sm:px-5 py-4 flex items-center justify-between gap-3 font-semibold text-sm text-foreground hover:bg-accent/5">{f.question}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span></summary>
                <div className="px-4 sm:px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
