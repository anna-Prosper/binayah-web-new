/* eslint-disable i18next/no-literal-string -- SEO landing page, English-only by design (targets English search queries) */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { FOREIGN_BUYERS, findForeignBuyer } from "@/lib/foreign-buyers";

export const revalidate = 86400;

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru"];
  return locales.flatMap((locale) =>
    FOREIGN_BUYERS.map((b) => ({ locale, citizen: b.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; citizen: string }>;
}): Promise<Metadata> {
  const { citizen, locale } = await params;
  const b = findForeignBuyer(citizen);
  if (!b) return {};
  const title = `Buying Property in Dubai as a ${b.citizen} Citizen | Binayah`;
  const description = `Complete guide for ${b.citizen} citizens buying property in Dubai: legal status, financing options, tax implications, repatriation, and preferred areas.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/buying-property-in-dubai-as/${b.slug}` },
    openGraph: { title, description, type: "article", url: `/${locale}/buying-property-in-dubai-as/${b.slug}` },
  };
}

export default async function ForeignBuyerPage({
  params,
}: {
  params: Promise<{ locale: string; citizen: string }>;
}) {
  const { locale, citizen } = await params;
  const b = findForeignBuyer(citizen);
  if (!b) notFound();

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: "Home", href: `${localePrefix}/` },
    { name: "Guides", href: `${localePrefix}/pulse/guides` },
    { name: `${b.citizen} Citizens`, href: `${localePrefix}/buying-property-in-dubai-as/${b.slug}` },
  ];

  const sections: { title: string; body: string }[] = [
    { title: `Why ${b.citizen} Buyers Choose Dubai`, body: b.whyDubai },
    { title: "Legal Status and Ownership Rights", body: b.legalStatus },
    { title: `Financing for ${b.citizen} Non-Residents`, body: b.financing },
    { title: "Tax Implications", body: b.taxImplications },
    { title: "Repatriating Funds", body: b.repatriation },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
            <span className="mr-2">{b.flag}</span> Guide for {b.country} Buyers
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Buying Property in Dubai as a{" "}
            <span className="italic font-light">{b.citizen} Citizen</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-3xl">{b.intro}</p>
        </div>
      </section>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {sections.map((s) => (
          <section key={s.title} className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{s.title}</h2>
            <p className="text-base text-foreground/80 leading-relaxed">{s.body}</p>
          </section>
        ))}

        <section className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Preferred Areas for {b.citizen} Buyers
          </h2>
          <p className="text-base text-foreground/80 leading-relaxed mb-4">
            Based on Binayah&apos;s transaction data, the communities most commonly chosen by {b.citizen} buyers are:
          </p>
          <ul className="space-y-2">
            {b.preferredAreas.map((area) => {
              const slug = area.toLowerCase().replace(/\s+/g, "-");
              return (
                <li key={area}>
                  <a
                    href={`${localePrefix}/buy-property-in/${slug}`}
                    className="text-primary hover:text-primary/80 font-semibold underline"
                  >
                    Buy property in {area} →
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 mt-12">
          <h3 className="text-xl font-bold text-foreground mb-3">
            Ready to explore Dubai property?
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Binayah&apos;s team works with {b.citizen} buyers daily. We&apos;ll handle search, viewings, legal coordination,
            and post-purchase property management.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${localePrefix}/contact`}
              className="px-5 py-2.5 rounded-lg font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
            >
              Contact our team
            </a>
            <a
              href={`${localePrefix}/buy`}
              className="px-5 py-2.5 rounded-lg font-bold text-sm border border-border hover:bg-muted transition-colors"
            >
              Browse properties
            </a>
          </div>
        </section>
      </article>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
