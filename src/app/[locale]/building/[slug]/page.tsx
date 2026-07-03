/* eslint-disable i18next/no-literal-string -- programmatic SEO template; values are data-driven */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Building2, LineChart, BadgeDollarSign, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { getDldBuilding, getDldBuildings } from "@/lib/api";
import { fmtAed } from "@/lib/market";
import { getNonce } from "@/lib/nonce";

export const revalidate = 86400;

const toSqft = (ppsfSqm: number | null | undefined) =>
  ppsfSqm && ppsfSqm > 0 ? Math.round(ppsfSqm / 10.764) : 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const b = await getDldBuilding(slug);
  if (!b) return { title: "Building Not Found" };
  const ppsf = toSqft(b.avgPpsf);
  const title = `${b.name} — Prices, Transactions & Units | ${b.area}, Dubai`;
  const description = `${b.name} in ${b.area}, Dubai: ${b.sales ? `${b.sales.toLocaleString("en-AE")} recorded DLD sales, ` : ""}${ppsf ? `avg AED ${ppsf.toLocaleString("en-AE")}/sqft, ` : ""}${b.avgPrice ? `avg price ${fmtAed(b.avgPrice)}. ` : ""}Explore real transaction data, unit mix and available listings with Binayah.`;
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

  // Sibling buildings in the same area → building↔building crawlable links.
  const siblings = (await getDldBuildings(`area=${encodeURIComponent(b.area)}&limit=13&sortBy=sales`)).results
    .filter((x: { slug?: string; name?: string }) => x.slug && x.name && x.slug !== slug)
    .slice(0, 12)
    .map((x: { slug: string; name: string }) => ({ slug: x.slug, name: x.name }));

  const ppsf = toSqft(b.avgPpsf);
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
    { icon: Building2, label: "Total Units", value: b.units ? b.units.toLocaleString("en-AE") : "-" },
  ];

  const faqs = [
    b.avgPrice && { question: `What is the average price in ${b.name}?`, answer: `The average recorded sale price in ${b.name}, ${b.area} is ${fmtAed(b.avgPrice)}${ppsf ? `, around AED ${ppsf.toLocaleString("en-AE")} per square foot` : ""}, based on Dubai Land Department transaction data.` },
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
          <p className="text-accent font-bold tracking-[0.3em] uppercase text-xs mb-3">Building · DLD Data</p>
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
        <p className="text-[11px] text-muted-foreground mb-8">Figures are from Dubai Land Department transaction records for {b.name}; individual units vary by floor, view and finish.</p>

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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Recent transactions in {b.name}</h2>
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
                      <td className="px-4 py-3 text-right tabular-nums">{t.size ? Math.round(t.size).toLocaleString("en-AE") : "-"}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{t.amount ? fmtAed(t.amount) : "-"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{t.pricePerSqft ? `AED ${Math.round(t.pricePerSqft).toLocaleString("en-AE")}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
