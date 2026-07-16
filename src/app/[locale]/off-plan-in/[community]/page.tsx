/* eslint-disable i18next/no-literal-string -- SEO landing page; community copy localized via localizeCommunityText, UI labels via the LABELS map */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { BUY_COMMUNITIES, findBuyCommunity, localizeCommunityText } from "@/lib/buy-communities";
import { getRelatedProjects, getDldBuildings, serverApiUrl, serverFetch } from "@/lib/api";
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
  const META: Record<string, { title: (n: string) => string; suffix: (n: string) => string }> = {
    fr: { title: (n) => `Projets sur plan à ${n}, Dubaï | Nouveaux Lancements | Binayah`, suffix: (n) => ` Projets sur plan à ${n} avec plans de paiement flexibles, Binayah.` },
    ru: { title: (n) => `Новостройки в ${n}, Дубай | Новые проекты | Binayah`, suffix: (n) => ` Новостройки и новые проекты в ${n} с гибкими условиями оплаты, Binayah.` },
    ar: { title: (n) => `مشاريع على الخارطة في ${n}، دبي | إطلاقات جديدة | Binayah`, suffix: (n) => ` مشاريع على الخارطة في ${n} بخطط سداد مرنة، بناية للعقارات.` },
    zh: { title: (n) => `迪拜${n}期房项目 | 新楼盘 | Binayah`, suffix: (n) => ` ${n}期房及新楼盘项目，灵活付款计划，Binayah。` },
    vi: { title: (n) => `Dự án off-plan tại ${n}, Dubai | Mở bán mới | Binayah`, suffix: (n) => ` Dự án off-plan tại ${n} với kế hoạch thanh toán linh hoạt, Binayah.` },
    he: { title: (n) => `פרויקטים על הנייר ב-${n}, דובאי | השקות חדשות | Binayah`, suffix: (n) => ` פרויקטים על הנייר ב-${n} עם תוכניות תשלום גמישות, Binayah.` },
  };
  const tmpl = META[locale];
  const title = tmpl ? tmpl.title(c.name) : `Off-Plan Projects in ${c.name}, Dubai | New Launches | Binayah`;
  const suffix = tmpl ? tmpl.suffix(c.name) : ` Off-plan & new-launch projects in ${c.name} with flexible payment plans, Binayah.`;
  const full = `${localizeCommunityText(c.shortIntro, locale)}${suffix}`;
  // Clamp to ~158 chars on a word boundary so the meta description isn't truncated mid-word by Google.
  const description = full.length <= 158 ? full : full.slice(0, 157).replace(/\s+\S*$/, "") + "…";
  // Pages with no community-specific projects now show Dubai-wide new launches
  // as fallback content, so all 58 off-plan hubs have substantive content and
  // deserve to be indexed.
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
  fr: { home: "Accueil", offplan: "Sur Plan", offplanIn: "Projets sur plan à", dubai: "Dubaï", eyebrow: "NOUVEAUX LANCEMENTS" },
} as const;

// Localized fallback + cross-link copy (numbers/brand names stay verbatim).
type CxStr = {
  newLaunches: string; noProjects: (n: string) => string;
  offBadge: string; from: string; viewAllDubai: string;
  guidePre: string; guideLink: (n: string) => string;
};
const CX: Record<string, CxStr> = {
  en: { newLaunches: "New Launches in Dubai", noProjects: (n) => `No off-plan projects in ${n} right now — explore new launches across Dubai.`, offBadge: "Off-Plan", from: "From", viewAllDubai: "View all off-plan in Dubai →", guidePre: "For schools, transport and the full area overview, read the", guideLink: (n) => `${n} community guide →` },
  fr: { newLaunches: "Nouveaux lancements à Dubaï", noProjects: (n) => `Aucun projet sur plan à ${n} pour le moment — explorez les nouveaux lancements à Dubaï.`, offBadge: "Sur Plan", from: "À partir de", viewAllDubai: "Voir tout le sur plan à Dubaï →", guidePre: "Pour les écoles, les transports et l'aperçu complet du quartier, consultez le", guideLink: (n) => `guide du quartier ${n} →` },
  ar: { newLaunches: "إطلاقات جديدة في دبي", noProjects: (n) => `لا توجد مشاريع على الخارطة في ${n} حالياً — استكشف الإطلاقات الجديدة في جميع أنحاء دبي.`, offBadge: "على الخارطة", from: "ابتداءً من", viewAllDubai: "عرض كل المشاريع على الخارطة في دبي →", guidePre: "للمدارس والمواصلات ونظرة كاملة على المنطقة، اطّلع على", guideLink: (n) => `دليل منطقة ${n} →` },
  zh: { newLaunches: "迪拜新楼盘", noProjects: (n) => `${n}目前暂无期房项目——探索迪拜各地的新楼盘。`, offBadge: "期房", from: "起价", viewAllDubai: "查看迪拜全部期房 →", guidePre: "了解学校、交通和完整的区域概览，请阅读", guideLink: (n) => `${n}社区指南 →` },
  vi: { newLaunches: "Dự án mới tại Dubai", noProjects: (n) => `Hiện chưa có dự án off-plan tại ${n} — khám phá các dự án mới trên khắp Dubai.`, offBadge: "Off-Plan", from: "Từ", viewAllDubai: "Xem tất cả off-plan tại Dubai →", guidePre: "Về trường học, giao thông và tổng quan khu vực, hãy đọc", guideLink: (n) => `hướng dẫn khu vực ${n} →` },
  he: { newLaunches: "השקות חדשות בדובאי", noProjects: (n) => `אין כרגע פרויקטים על הנייר ב-${n} — גלו השקות חדשות ברחבי דובאי.`, offBadge: "על הנייר", from: "החל מ-", viewAllDubai: "צפו בכל הפרויקטים על הנייר בדובאי →", guidePre: "לבתי ספר, תחבורה וסקירת האזור המלאה, קראו את", guideLink: (n) => `מדריך האזור ${n} →` },
  ru: { newLaunches: "Новые проекты в Дубае", noProjects: (n) => `Сейчас нет проектов на стадии строительства в ${n} — посмотрите новые проекты по Дубаю.`, offBadge: "Новостройка", from: "от", viewAllDubai: "Все новостройки в Дубае →", guidePre: "Школы, транспорт и полный обзор района — читайте", guideLink: (n) => `гид по району ${n} →` },
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
  const X = CX[locale] ?? CX.en;
  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const apiCommunity = c.apiName ?? c.name;

  // Server-fetch the community's off-plan projects so the hub renders crawlable
  // links to each project (the SearchPageClient list below is client-only).
  // This is the high-authority hub → project edge of the internal-link graph.
  const communityProjects = await getRelatedProjects(apiCommunity, "", "", 24);

  // When no projects exist for this community, load a sample from the wider
  // Dubai off-plan market so the page still has substantive content.
  let similarProjects: any[] = [];
  if (communityProjects.length === 0) {
    try {
      const r = await serverFetch(serverApiUrl(`/api/projects?limit=6`));
      if (r.ok) similarProjects = await r.json();
    } catch { /* best-effort */ }
  }

  // Real market depth: DLD + listings stats and data-driven FAQs (+ FAQPage
  // schema) so the page isn't thin and earns rich results / AI citations.
  const stats = await getCommunityStats(apiCommunity);
  const faqs = buildCommunityFaqs(c.name, stats, locale);
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

      {/* When no community-specific projects exist, show Dubai-wide off-plan launches */}
      {communityProjects.length === 0 && similarProjects.length > 0 && (
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-14">
          <h2 className="text-xl font-bold text-foreground mb-2">{X.newLaunches}</h2>
          <p className="text-sm text-muted-foreground mb-6">{X.noProjects(c.name)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarProjects.map((p: any) => (
              <a key={p._id} href={`${lp}/project/${p.slug}`} className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
                {p.featuredImage && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.featuredImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">{p.status || X.offBadge}</p>
                  <h3 className="font-bold text-foreground text-sm leading-snug mb-1 line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{p.community} · {p.developerName}</p>
                  {p.startingPrice && <p className="text-sm font-semibold text-foreground">{X.from} AED {Number(p.startingPrice).toLocaleString()}</p>}
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6">
            <a href={`${lp}/off-plan`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{X.viewAllDubai}</a>
          </div>
        </section>
      )}

      {/* Cross-link to the area guide — different intent (this page = buy off-plan; guide = lifestyle/transport) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-8 text-sm text-muted-foreground">
        {X.guidePre}{" "}
        <a href={`${lp}/communities/${c.communitySlug ?? c.slug}`} className="text-primary font-semibold hover:underline">{X.guideLink(c.name)}</a>
      </div>

      <Footer />
    </div>
  );
}
