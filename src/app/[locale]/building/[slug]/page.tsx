/* eslint-disable i18next/no-literal-string -- programmatic SEO template; values are data-driven */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Building2, LineChart, BadgeDollarSign, MapPin, ArrowRight, Percent, Bed, Bath, Maximize } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageWithFallback from "@/components/ImageWithFallback";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { getDldBuilding, getDldBuildings, serverApiUrl, serverFetch } from "@/lib/api";
import { fmtAed } from "@/lib/market";
import { getNonce } from "@/lib/nonce";

export const revalidate = 86400;

// Opt into ISR. Without generateStaticParams a [slug] route is fully dynamic
// (private, no-store) regardless of `revalidate`. Returning [] prerenders
// nothing at build (light build) while making every slug ISR-cached on-demand.
export function generateStaticParams() {
  return [];
}

// DLD stores pricePerSqft as AED per SQUARE METRE despite the name.
const toSqft = (ppsfSqm: number | null | undefined) =>
  ppsfSqm && ppsfSqm > 0 ? Math.round(ppsfSqm / 10.764) : 0;

interface TrendPoint { month: string; avgPpsf: number; avgPrice: number; count: number }
interface BedRow { bedrooms: number; count: number; avgPrice: number; avgPpsf: number | null }
interface BuildingListing { slug: string; title?: string; name?: string; price?: number; currency?: string; bedrooms?: number; bathrooms?: number; size?: number; sizeUnit?: string; featuredImage?: string; listingType?: string; _src?: string }

// Single-sale months make the trend line jumpy and the 12-month % misleading.
// Keep months with ≥2 sales when enough of them exist; otherwise use all months.
function smoothTrend(trend: TrendPoint[]): { points: TrendPoint[]; smoothed: boolean } {
  const solid = trend.filter((t) => t.count >= 2);
  if (solid.length >= 4) return { points: solid, smoothed: solid.length !== trend.length };
  return { points: trend, smoothed: false };
}

// Live inventory in this tower — precise structured match via the search API's
// `building` param. Empty array (and a hidden section) on any failure.
async function getBuildingListings(name: string): Promise<BuildingListing[]> {
  try {
    const res = await serverFetch(serverApiUrl(`/api/search?building=${encodeURIComponent(name)}&limit=6`), 12_000);
    if (!res.ok) return [];
    const data = await res.json();
    const rows: BuildingListing[] = Array.isArray(data?.listings) ? data.listings : [];
    return rows.filter((l) => l.slug).slice(0, 6);
  } catch {
    return [];
  }
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTH_SHORT[(m || 1) - 1]} ${String(y).slice(2)}`;
};
const bedLabel = (b: number) => (b === 0 ? "Studio" : `${b} Bed`);

// ── Server-rendered price-trend chart (zero client JS) ───────────────────────
// Single series → one brand hue, 2px line, recessive grid, no legend (the title
// names the series). Native SVG <title> gives a hover tooltip per point.
function TrendChart({ points }: { points: { label: string; value: number; count: number }[] }) {
  const W = 660, H = 230, PAD_L = 56, PAD_R = 14, PAD_T = 14, PAD_B = 30;
  const iw = W - PAD_L - PAD_R, ih = H - PAD_T - PAD_B;
  const vals = points.map((p) => p.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = Math.max(hi - lo, Math.round(hi * 0.06) || 1); // avoid a flat-line collapse
  const yMin = Math.max(0, lo - span * 0.25), yMax = hi + span * 0.25;
  const x = (i: number) => PAD_L + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD_T + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const areaPath = `${path} L${x(points.length - 1).toFixed(1)},${(PAD_T + ih).toFixed(1)} L${x(0).toFixed(1)},${(PAD_T + ih).toFixed(1)} Z`;
  const gridVals = [0.25, 0.5, 0.75].map((f) => yMin + f * (yMax - yMin));
  const labelEvery = points.length > 8 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Average sale price per square foot by month" className="w-full h-auto">
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke="currentColor" className="text-border" strokeWidth="1" strokeDasharray="2 4" />
          <text x={PAD_L - 8} y={y(v) + 3.5} textAnchor="end" fontSize="10" className="fill-muted-foreground">{Math.round(v).toLocaleString("en-AE")}</text>
        </g>
      ))}
      <path d={areaPath} fill="#1A7A5A" opacity="0.09" />
      <path d={path} fill="none" stroke="#1A7A5A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          {/* ≥8px hit target with a native tooltip; visible dot stays small */}
          <circle cx={x(i)} cy={y(p.value)} r="9" fill="transparent">
            <title>{`${p.label}: AED ${p.value.toLocaleString("en-AE")}/sqft · ${p.count} sale${p.count === 1 ? "" : "s"}`}</title>
          </circle>
          <circle cx={x(i)} cy={y(p.value)} r="3" fill="#1A7A5A" stroke="#fff" strokeWidth="1.5" />
          {i % labelEvery === 0 && (
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" className="fill-muted-foreground">{p.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const b = await getDldBuilding(slug);
  if (!b) return { title: "Building Not Found" };
  const ppsf = toSqft(b.avgPpsf);
  const { points: trend } = smoothTrend(((Array.isArray(b.trend) ? b.trend : []) as TrendPoint[]).filter((t) => t.avgPpsf > 0));
  const first = trend[0], last = trend[trend.length - 1];
  const changePct = first && last && first.avgPpsf > 0 && trend.length > 1
    ? Math.round(((last.avgPpsf - first.avgPpsf) / first.avgPpsf) * 1000) / 10
    : null;
  const title = `${b.name} — Sold Prices & Transactions | ${b.area}, Dubai`;
  const description = `${b.name}, ${b.area}: ${b.sales ? `${b.sales.toLocaleString("en-AE")} DLD sales` : "DLD sold-price data"}${ppsf ? `, avg AED ${ppsf.toLocaleString("en-AE")}/sqft` : ""}${changePct != null ? ` (${changePct > 0 ? "+" : ""}${changePct}% over 12 months)` : ""}${b.areaYield?.grossYieldPct ? `, ~${b.areaYield.grossYieldPct}% gross yield` : ""}. Real transactions, price trend & unit mix.`;
  const path = `/building/${slug}`;
  return {
    title: `${title} | Binayah`,
    description,
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: { title, description, type: "website", url: makeCanonical(locale, path) },
  };
}

export default async function BuildingPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const b = await getDldBuilding(slug);
  if (!b) return notFound();
  const nonce = await getNonce();
  const lp = locale === "en" ? "" : `/${locale}`;

  // Sibling buildings + live inventory in parallel.
  const [siblingsRes, listings] = await Promise.all([
    getDldBuildings(`area=${encodeURIComponent(b.area)}&limit=13&sortBy=sales`),
    getBuildingListings(b.name),
  ]);
  const siblings = siblingsRes.results
    .filter((x: { slug?: string; name?: string }) => x.slug && x.name && x.slug !== slug)
    .slice(0, 12)
    .map((x: { slug: string; name: string }) => ({ slug: x.slug, name: x.name }));

  const ppsf = toSqft(b.avgPpsf);
  const { points: trend, smoothed } = smoothTrend(((Array.isArray(b.trend) ? b.trend : []) as TrendPoint[]).filter((t) => t.avgPpsf > 0));
  const trendPts = trend.map((t) => ({ label: fmtMonth(t.month), value: toSqft(t.avgPpsf), count: t.count }));
  const first = trend[0], last = trend[trend.length - 1];
  const changePct = first && last && first.avgPpsf > 0 && trend.length > 1
    ? Math.round(((last.avgPpsf - first.avgPpsf) / first.avgPpsf) * 1000) / 10
    : null;
  const trendSales = trend.reduce((s, t) => s + t.count, 0);
  const byBedrooms: BedRow[] = (Array.isArray(b.byBedrooms) ? b.byBedrooms : []).filter((r: BedRow) => r.count > 0);
  const yieldPct: number | null = b.areaYield?.grossYieldPct ?? null;

  const rb = b.roomTypeBreakdown || {};
  const roomMix = [
    { label: "Studio", n: rb.studio },
    { label: "1 Bed", n: rb.oneBr },
    { label: "2 Bed", n: rb.twoBr },
    { label: "3 Bed", n: rb.threeBr },
    { label: "4 Bed", n: rb.fourBr },
    { label: "5+ Bed", n: rb.fivePlus },
  ].filter((r) => r.n && r.n > 0);
  const txns: any[] = Array.isArray(b.recentTransactions) ? b.recentTransactions : [];

  const stats = [
    { icon: TrendingUp, label: "Avg Price / sqft", value: ppsf ? `AED ${ppsf.toLocaleString("en-AE")}` : "-" },
    { icon: BadgeDollarSign, label: "Avg Sale Price", value: fmtAed(b.avgPrice) },
    { icon: LineChart, label: "DLD Sales Recorded", value: b.sales ? b.sales.toLocaleString("en-AE") : "-" },
    ...(yieldPct
      ? [{ icon: Percent, label: "Est. Gross Yield", value: `${yieldPct}%` }]
      : [{ icon: Building2, label: "Total Units", value: b.units ? b.units.toLocaleString("en-AE") : "-" }]),
  ];

  // ── Data-driven narrative (unique per building — the SEO body copy) ──
  const paras: string[] = [];
  paras.push(
    `${b.name} is a residential ${b.propertyTypes?.length ? b.propertyTypes.join("/").toLowerCase() : "building"} in ${b.area}, Dubai${b.units ? ` with approximately ${b.units.toLocaleString("en-AE")} units` : ""}. Dubai Land Department records show ${b.sales ? `${b.sales.toLocaleString("en-AE")} sales` : "recorded sales"} in the building${b.avgPrice ? `, at an average price of ${fmtAed(b.avgPrice)}${ppsf ? ` — around AED ${ppsf.toLocaleString("en-AE")} per square foot` : ""}` : ""}.`
  );
  if (trend.length > 1 && changePct != null) {
    paras.push(
      `Over the last 12 months, ${trendSales.toLocaleString("en-AE")} sale${trendSales === 1 ? "" : "s"} completed in ${b.name}, with the average price per square foot moving from AED ${toSqft(first!.avgPpsf).toLocaleString("en-AE")} to AED ${toSqft(last!.avgPpsf).toLocaleString("en-AE")} (${changePct > 0 ? "+" : ""}${changePct}%). ${changePct > 3 ? "That upward drift suggests sellers currently hold pricing power here." : changePct < -3 ? "That softening can open negotiating room for buyers." : "Prices have held broadly steady, a sign of a balanced market in the tower."}`
    );
  }
  if (yieldPct) {
    paras.push(
      `Benchmarked against average residential rents in ${b.area}, a typical unit in ${b.name} returns an estimated ${yieldPct}% gross rental yield before service charges — a useful starting point for investors comparing towers across ${b.area}.`
    );
  }

  const faqs = [
    b.avgPrice && { question: `What is the average price in ${b.name}?`, answer: `The average recorded sale price in ${b.name}, ${b.area} is ${fmtAed(b.avgPrice)}${ppsf ? `, around AED ${ppsf.toLocaleString("en-AE")} per square foot` : ""}, based on Dubai Land Department transaction data.` },
    changePct != null && { question: `Are prices in ${b.name} going up or down?`, answer: `Average sale prices in ${b.name} have ${changePct > 0.5 ? "risen" : changePct < -0.5 ? "eased" : "held steady"} ${changePct > 0 ? "+" : ""}${changePct}% per square foot over the last 12 months, across ${trendSales.toLocaleString("en-AE")} DLD-recorded sales.` },
    yieldPct && { question: `What rental yield can I expect in ${b.name}?`, answer: `Based on average ${b.area} residential rents against sale prices in the building, a typical unit in ${b.name} yields roughly ${yieldPct}% gross per year, before service charges and fees.` },
    b.sales && { question: `How many properties have sold in ${b.name}?`, answer: `${b.sales.toLocaleString("en-AE")} sales have been recorded in ${b.name} according to DLD data${b.units ? `, across approximately ${b.units.toLocaleString("en-AE")} units` : ""}.` },
    roomMix.length > 0 && { question: `What unit types are available in ${b.name}?`, answer: `${b.name} offers ${roomMix.map((r) => r.label.toLowerCase()).join(", ")} units. Contact Binayah for current availability and pricing.` },
  ].filter(Boolean) as { question: string; answer: string }[];

  const breadcrumbs = [
    { name: "Home", href: `${lp}/` },
    { name: b.area, href: `${lp}/search?q=${encodeURIComponent(b.area)}` },
    { name: b.name, href: `${lp}/building/${slug}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: b.name,
    address: { "@type": "PostalAddress", addressLocality: b.area, addressRegion: "Dubai", addressCountry: "AE" },
    ...(b.units ? { numberOfAccommodationUnits: b.units } : {}),
    url: makeCanonical(locale, `/building/${slug}`),
  };

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} nonce={nonce} />}
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-12 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.3em] uppercase text-xs mb-3">Sold Prices · DLD Data</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-3">{b.name}</h1>
          <p className="flex items-center gap-2 text-primary-foreground/80 text-lg">
            <MapPin className="h-4 w-4" style={{ color: "#D4A847" }} /> {b.area}, Dubai
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border/50 bg-border/40 mb-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-background px-4 py-5 sm:py-6 text-center">
              <s.icon className="h-4 w-4 mx-auto mb-2" style={{ color: "#D4A847" }} />
              <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 tracking-[0.1em] uppercase leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mb-8">Figures are from Dubai Land Department transaction records for {b.name}; individual units vary by floor, view and finish.{yieldPct ? ` Gross yield is estimated against average ${b.area} residential rents, before service charges.` : ""}</p>

        {/* Narrative — data-driven SEO copy */}
        <div className="mb-10 max-w-3xl space-y-4">
          {paras.map((p, i) => (
            <p key={i} className="text-base sm:text-lg text-foreground/85 leading-relaxed">{p}</p>
          ))}
        </div>

        {/* Price trend */}
        {trendPts.length > 1 && (
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5">Price trend in {b.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Average sale price per sqft by month, last 12 months{smoothed ? " (single-sale months excluded)" : ""}{changePct != null && (
                <span className="ml-2 inline-flex items-center gap-1 font-bold" style={{ color: changePct > 0.5 ? "#1A7A5A" : changePct < -0.5 ? "#E53E3E" : "#6B7782" }}>
                  {changePct > 0 ? "+" : ""}{changePct}%
                </span>
              )}
            </p>
            <div className="rounded-2xl border border-border/50 bg-background p-4 sm:p-6">
              <TrendChart points={trendPts} />
            </div>
          </div>
        )}

        {/* Price by bedroom */}
        {byBedrooms.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Prices by unit type <span className="text-sm font-normal text-muted-foreground">(last 12 months)</span></h2>
            <div className="overflow-x-auto rounded-2xl border border-border/50">
              <table className="w-full text-sm">
                <thead className="bg-accent/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Unit type</th>
                    <th className="px-4 py-3 text-right">Sales</th>
                    <th className="px-4 py-3 text-right">Avg price</th>
                    <th className="px-4 py-3 text-right">Avg AED/sqft</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {byBedrooms.map((r) => (
                    <tr key={r.bedrooms} className="hover:bg-accent/[0.03]">
                      <td className="px-4 py-3 font-semibold text-foreground">{bedLabel(r.bedrooms)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.count.toLocaleString("en-AE")}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{fmtAed(r.avgPrice)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.avgPpsf ? `AED ${toSqft(r.avgPpsf).toLocaleString("en-AE")}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Unit mix */}
        {roomMix.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Unit mix in {b.name}</h2>
            <div className="flex flex-wrap gap-2">
              {roomMix.map((r) => (
                <span key={r.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-background text-sm">
                  <span className="font-semibold text-foreground">{r.label}</span>
                  <span className="text-muted-foreground">{r.n!.toLocaleString("en-AE")}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {txns.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Recent sold prices in {b.name}</h2>
            <div className="overflow-x-auto rounded-2xl border border-border/50">
              <table className="w-full text-sm">
                <thead className="bg-accent/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Beds</th>
                    <th className="px-4 py-3 text-right">Size (sqft)</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">AED/sqft</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {txns.map((t, i) => (
                    <tr key={i} className="hover:bg-accent/[0.03]">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{t.transactionDate ? new Date(t.transactionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                      <td className="px-4 py-3">{t.transactionType || t.propertyType || "-"}</td>
                      <td className="px-4 py-3">{t.bedrooms ?? "-"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{t.size ? Math.round(t.size * 10.764).toLocaleString("en-AE") : "-"}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{t.amount ? fmtAed(t.amount) : "-"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{t.pricePerSqft ? `AED ${toSqft(t.pricePerSqft).toLocaleString("en-AE")}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live inventory in this tower — listing preview cards */}
        {listings.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5">Available now in {b.name}</h2>
            <p className="text-sm text-muted-foreground mb-5">Current Binayah listings in this building.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((l) => (
                <Link key={l.slug} href={`${lp}/property/${l.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-border/50 hover:border-primary/20">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <ImageWithFallback src={l.featuredImage || "/assets/property-placeholder-v2.webp"} alt={l.title || l.name || b.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    {(l.listingType || l._src) && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                        {l.listingType === "Rent" || l._src === "rent" ? "For Rent" : "For Sale"}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{l.title || l.name}</h3>
                    <p className="text-sm font-bold text-primary mb-3">{l.price ? `AED ${l.price.toLocaleString("en-AE")}` : "Price on request"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
                      {l.bedrooms != null && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{l.bedrooms || "Studio"}</span>}
                      {l.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{l.bathrooms}</span>}
                      {l.size ? <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{l.size.toLocaleString("en-AE")} {l.sizeUnit || "sqft"}</span> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Internal links / CTAs */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href={`${lp}/search?q=${encodeURIComponent(b.name)}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
            View listings in {b.name} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`${lp}/search?q=${encodeURIComponent(b.area)}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border-2" style={{ borderColor: "#D4A847", color: "#B8922F" }}>
            Explore {b.area} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Sibling buildings — building↔building internal links */}
        {siblings.length > 0 && (
          <nav aria-label={`Other buildings in ${b.area}`} className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Other buildings in {b.area}</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link href={`${lp}/building/${s.slug}`} className="hover:text-primary hover:underline transition-colors">{s.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{b.name}: frequently asked questions</h2>
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
      </div>

      <Footer />
    </div>
  );
}
