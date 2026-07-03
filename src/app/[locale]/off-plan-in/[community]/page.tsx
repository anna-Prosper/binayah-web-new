/* eslint-disable i18next/no-literal-string -- SEO landing page; community copy localized via localizeCommunityText, UI labels via the LABELS map */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { BUY_COMMUNITIES, findBuyCommunity, localizeCommunityText } from "@/lib/buy-communities";
import { getRelatedProjects, getDldBuildings } from "@/lib/api";
import { getCommunityStats, buildCommunityFaqs, dldAreaFor } from "@/lib/market";
import CommunityStatsBand from "@/components/CommunityStatsBand";
import { getNonce } from "@/lib/nonce";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  return locales.flatMap((locale) => BUY_COMMUNITIES.map((c) => ({ locale, community: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}): Promise<Metadata> {
  const { community, locale } = await params;
  const c = findBuyCommunity(community);
  if (!c) notFound();
  const title = `Off-Plan Projects in ${c.name}, Dubai | New Launches | Binayah`;
  const full = `${localizeCommunityText(c.shortIntro, locale)} Off-plan & new-launch projects in ${c.name} with flexible payment plans, Binayah.`;
  // Clamp to ~158 chars on a word boundary so the meta description isn't truncated mid-word by Google.
  const description = full.length <= 158 ? full : full.slice(0, 157).replace(/\s+\S*$/, "") + "…";
  return {
    title,
    description,
    alternates: {
      canonical: makeCanonical(locale, `/off-plan-in/${c.slug}`),
      languages: altLangs(`/off-plan-in/${c.slug}`),
    },
    openGraph: {
      title, description, type: "website",
      url: makeCanonical(locale, `/off-plan-in/${c.slug}`),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

const LABELS = {
  en: { home: "Home", offplan: "Off-Plan", offplanIn: "Off-Plan Projects in", dubai: "Dubai", eyebrow: "NEW LAUNCHES" },
  ru: { home: "Главная", offplan: "Новостройки", offplanIn: "Новостройки в", dubai: "Дубае", eyebrow: "НОВЫЕ ПРОЕКТЫ" },
  ar: { home: "الرئيسية", offplan: "على الخارطة", offplanIn: "مشاريع على الخارطة في", dubai: "دبي", eyebrow: "إطلاقات جديدة" },
  zh: { home: "首页", offplan: "期房", offplanIn: "期房项目, ", dubai: "迪拜", eyebrow: "新楼盘" },
  vi: { home: "Trang chủ", offplan: "Off-Plan", offplanIn: "Dự án Off-Plan tại", dubai: "Dubai", eyebrow: "DỰ ÁN MỚI" },
  he: { home: "בית", offplan: "על הנייר", offplanIn: "פרויקטים על הנייר ב", dubai: "דובאי", eyebrow: "השקות חדשות" },
} as const;

export default async function OffPlanInCommunityPage({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}) {
  const { locale, community } = await params;
  const c = findBuyCommunity(community);
  if (!c) notFound();
  const L = LABELS[(locale as keyof typeof LABELS)] ?? LABELS.en;
  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const apiCommunity = c.apiName ?? c.name;

  // Server-fetch the community's off-plan projects so the hub renders crawlable
  // links to each project (the SearchPageClient list below is client-only).
  // This is the high-authority hub → project edge of the internal-link graph.
  const communityProjects = await getRelatedProjects(apiCommunity, "", "", 24);

  // Real market depth: DLD + listings stats and data-driven FAQs (+ FAQPage
  // schema) so the page isn't thin and earns rich results / AI citations.
  const stats = await getCommunityStats(apiCommunity);
  const faqs = buildCommunityFaqs(c.name, stats);
  const nonce = await getNonce();

  // Real DLD buildings in this area → crawlable links to /building/[slug]
  // (passes hub equity to the building pages). Hidden when the area name
  // doesn't match DLD records.
  const areaBuildings = (await getDldBuildings(`area=${encodeURIComponent(dldAreaFor(apiCommunity))}&limit=12&sortBy=sales`)).results
    .filter((b: { slug?: string; name?: string }) => b.slug && b.name)
    .slice(0, 12)
    .map((b: { slug: string; name: string }) => ({ slug: b.slug, name: b.name }));

  const breadcrumbs = [
    { name: L.home, href: `${lp}/` },
    { name: L.offplan, href: `${lp}/off-plan` },
    { name: c.name, href: `${lp}/off-plan-in/${c.slug}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      <section
        className="relative overflow-hidden pt-28 pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3">{L.eyebrow}</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{L.offplanIn} {c.name}, {L.dubai}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{localizeCommunityText(c.shortIntro, locale)}</p>
        </div>
      </section>

      {/* Real market depth: DLD/listings stats snapshot + data-driven FAQs + schema */}
      <CommunityStatsBand name={c.name} stats={stats} faqs={faqs} buildings={areaBuildings} localePrefix={lp} nonce={nonce} />

      {/* Off-plan projects pre-filtered to this community — clean URL, no query params */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <SearchPageClient defaultStatus="Off-Plan" defaultIntent="off-plan" defaultLocations={[apiCommunity]} syncUrl={false} />
      </div>

      {/* SSR crawlable index of this community's off-plan projects — passes link
          equity from the hub to each project page (the list above is client-only). */}
      {communityProjects.length > 0 && (
        <nav aria-label={`${L.offplanIn} ${c.name}`} className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
          <h2 className="text-lg font-bold text-foreground mb-3">{L.offplanIn} {c.name}</h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {communityProjects.map((p: { slug: string; name: string }) => (
              <li key={p.slug}>
                <a href={`${lp}/project/${p.slug}`} className="hover:text-primary hover:underline transition-colors">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <Footer />
    </div>
  );
}
