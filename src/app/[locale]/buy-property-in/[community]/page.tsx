/* eslint-disable i18next/no-literal-string -- SEO landing page; community copy is localized via localizeCommunityText, UI labels via the LABELS map */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ListingsPageClient from "@/app/_clients/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { BUY_COMMUNITIES, findBuyCommunity, localizeCommunityText, CURATED_COMMUNITY_SLUGS } from "@/lib/buy-communities";
import { getCommunityStats, buildMarketNote } from "@/lib/market";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";

export const revalidate = 1800;

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  return locales.flatMap((locale) =>
    BUY_COMMUNITIES.map((c) => ({ locale, community: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}): Promise<Metadata> {
  const { community, locale } = await params;
  const c = findBuyCommunity(community);
  if (!c) return {};
  const title = `Buy Property in ${c.name}, Dubai | ${c.priceRange} | Binayah`;
  const full = `${localizeCommunityText(c.shortIntro, locale)} Avg yield ${c.yield}. Browse listings for sale in ${c.name} with Binayah.`;
  // Clamp to ~158 chars on a word boundary so the meta description isn't truncated mid-word by Google.
  const description = full.length <= 158 ? full : full.slice(0, 157).replace(/\s+\S*$/, "") + "…";

  // Zero-inventory guard: try apiName first, then each synonym, so a name
  // mismatch doesn't falsely noindex a page that actually has listings.
  let hasListings = true;
  try {
    const namesToTry = [c.apiName ?? c.name, ...(c.synonyms ?? []).filter(s => s !== (c.apiName ?? c.name))];
    for (const name of namesToTry) {
      const res = await serverFetch(serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(name)}&countOnly=1`));
      if (res.ok && ((await res.json()).total ?? 0) > 0) { hasListings = true; break; }
      hasListings = false;
    }
  } catch { /* API down → treat as indexable; don't noindex on transient errors */ }

  return {
    title,
    description,
    ...(hasListings ? {} : { robots: { index: false as const, follow: true } }),
    alternates: {
      canonical: makeCanonical(locale, `/buy-property-in/${c.slug}`),
      languages: altLangs(`/buy-property-in/${c.slug}`),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: makeCanonical(locale, `/buy-property-in/${c.slug}`),
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
  };
}

const BATCH_SIZE = 9;

const LABELS = {
  en: { home: "Home", buy: "Buy", buyIn: "Buy Property in", dubai: "Dubai", priceRange: "Price range", grossYield: "Gross yield", listings: "Listings", forSale: "Properties for Sale in", secondary: "SECONDARY MARKET", emptyTitle: "No active listings here right now", emptyBody: "We add new homes in this community regularly. Tell us what you're after and we'll alert you the moment one lists, or explore what's available across Dubai today.", browseAll: "Browse all properties", getNotified: "Get notified" },
  ru: { home: "Главная", buy: "Купить", buyIn: "Купить недвижимость в", dubai: "Дубае", priceRange: "Диапазон цен", grossYield: "Доходность", listings: "Объектов", forSale: "Недвижимость на продажу в", secondary: "ВТОРИЧНЫЙ РЫНОК", emptyTitle: "Сейчас здесь нет активных объявлений", emptyBody: "Мы регулярно добавляем новые объекты в этом районе. Расскажите, что ищете, и мы сообщим, как только появится подходящий вариант, или посмотрите доступное по всему Дубаю прямо сейчас.", browseAll: "Все объекты", getNotified: "Уведомить меня" },
  ar: { home: "الرئيسية", buy: "شراء", buyIn: "شراء عقار في", dubai: "دبي", priceRange: "نطاق السعر", grossYield: "العائد الإجمالي", listings: "عقارات", forSale: "عقارات للبيع في", secondary: "السوق الثانوي", emptyTitle: "لا توجد إعلانات نشطة هنا حاليًا", emptyBody: "نضيف عقارات جديدة في هذا المجتمع بانتظام. أخبرنا بما تبحث عنه وسننبهك فور توفّره, أو استكشف المتاح في جميع أنحاء دبي اليوم.", browseAll: "تصفّح كل العقارات", getNotified: "نبّهني" },
  zh: { home: "首页", buy: "购买", buyIn: "购买房产, ", dubai: "迪拜", priceRange: "价格区间", grossYield: "租金回报", listings: "房源", forSale: "在售房产, ", secondary: "二手市场", emptyTitle: "该区域暂无在售房源", emptyBody: "我们会定期上架该社区的新房源。告诉我们您的需求，一有合适房源即刻通知您, , 或浏览迪拜全城目前可选的房源。", browseAll: "浏览全部房源", getNotified: "通知我" },
  vi: { home: "Trang chủ", buy: "Mua", buyIn: "Mua bất động sản tại", dubai: "Dubai", priceRange: "Khoảng giá", grossYield: "Lợi suất gộp", listings: "Tin đăng", forSale: "Bất động sản bán tại", secondary: "THỊ TRƯỜNG THỨ CẤP", emptyTitle: "Hiện chưa có tin đăng tại khu vực này", emptyBody: "Chúng tôi thường xuyên bổ sung bất động sản mới ở khu vực này. Hãy cho biết bạn đang tìm gì và chúng tôi sẽ báo ngay khi có, hoặc khám phá các lựa chọn hiện có trên khắp Dubai.", browseAll: "Xem tất cả bất động sản", getNotified: "Nhận thông báo" },
  he: { home: "בית", buy: "קנייה", buyIn: "קניית נכס ב", dubai: "דובאי", priceRange: "טווח מחירים", grossYield: "תשואה ברוטו", listings: "מודעות", forSale: "נכסים למכירה ב", secondary: "שוק משני", emptyTitle: "אין כרגע מודעות פעילות כאן", emptyBody: "אנו מוסיפים נכסים חדשים בקהילה זו באופן קבוע. ספרו לנו מה אתם מחפשים ונעדכן אתכם ברגע שיתפרסם נכס מתאים, או גלו את ההיצע ברחבי דובאי היום.", browseAll: "עיון בכל הנכסים", getNotified: "עדכנו אותי" },
} as const;

export default async function BuyInCommunityPage({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}) {
  const { locale, community } = await params;
  const c = findBuyCommunity(community);
  if (!c) notFound();
  const L = LABELS[(locale as keyof typeof LABELS)] ?? LABELS.en;

  let initialListings: any[] = [];
  let totalCount = 0;
  let apiCommunity = c.apiName ?? c.name;

  try {
    // Try primary name first, then synonyms — pick the first that returns listings.
    const namesToTry = [apiCommunity, ...(c.synonyms ?? []).filter(s => s !== apiCommunity)];
    for (const name of namesToTry) {
      const [listingsRes, countRes] = await Promise.all([
        serverFetch(serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(name)}&limit=${BATCH_SIZE}`)),
        serverFetch(serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(name)}&countOnly=1`)),
      ]);
      const count = countRes.ok ? ((await countRes.json()).total ?? 0) : 0;
      if (count > 0) {
        apiCommunity = name;
        totalCount = count;
        if (listingsRes.ok) initialListings = await listingsRes.json();
        break;
      }
    }
  } catch (err) {
    console.warn("[BuyInCommunityPage] API unavailable:", (err as Error).message);
  }

  // When no secondary listings exist, load off-plan projects and a cross-community sample.
  let offPlanProjects: any[] = [];
  let similarListings: any[] = [];
  if (totalCount === 0) {
    try {
      const [projRes, similarRes] = await Promise.all([
        serverFetch(serverApiUrl(`/api/projects?community=${encodeURIComponent(c.name)}&limit=6`)),
        serverFetch(serverApiUrl(`/api/listings?listingType=Sale&limit=6`)),
      ]);
      if (projRes.ok) offPlanProjects = await projRes.json();
      if (similarRes.ok) {
        const data = await similarRes.json();
        similarListings = Array.isArray(data) ? data : (data.results ?? []);
      }
    } catch { /* best-effort */ }
  }

  // Sale-side DLD market note — diverges this page from its /rent-property-in twin.
  const marketNote = buildMarketNote(c.name, await getCommunityStats(apiCommunity), "buy");

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: L.home, href: `${localePrefix}/` },
    { name: L.buy, href: `${localePrefix}/buy` },
    { name: c.name, href: `${localePrefix}/buy-property-in/${c.slug}` },
  ];

  const seoBlock = (
    <section className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">{localizeCommunityText(c.vibe, locale)}</p>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
          {L.buyIn} {c.name}, {L.dubai}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">{localizeCommunityText(c.shortIntro, locale)}</p>
        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{localizeCommunityText(c.why, locale)}</p>
        {marketNote && <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{marketNote}</p>}
        {/* Cross-link to the informational area guide — different intent (this
            page = homes for sale; the guide = schools, transport, lifestyle) so
            the two don't compete for the same query. */}
        <p className="text-sm text-muted-foreground max-w-3xl mb-4">
          For schools, transport and the full area overview, read the{" "}
          <a href={`${localePrefix}/communities/${c.communitySlug ?? c.slug}`} className="text-primary font-semibold hover:underline">{c.name} community guide →</a>
        </p>
        {/* Seller funnel: owners in this community → free valuation (curated 20 only). */}
        {CURATED_COMMUNITY_SLUGS.includes(c.slug) && (
          <p className="text-sm text-muted-foreground max-w-3xl mb-8">
            Own here already?{" "}
            <a href={`${localePrefix}/property-valuation/${c.slug}`} className="text-primary font-semibold hover:underline">Get a free {c.name} property valuation →</a>
          </p>
        )}
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{L.priceRange}</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{c.priceRange}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{L.grossYield}</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{c.yield}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{L.listings}</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{totalCount > 0 ? `${totalCount}+` : totalCount}</p>
          </div>
        </div>
      </div>
    </section>
  );

  const emptyState = (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Off-plan projects in this community */}
      {offPlanProjects.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Off-Plan Projects in {c.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">No secondary market listings right now — but these off-plan launches are open for purchase in {c.name}.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offPlanProjects.map((p: any) => (
              <a key={p._id} href={`${localePrefix}/project/${p.slug}`} className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
                {p.featuredImage && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.featuredImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">{p.status || "Off-Plan"}</p>
                  <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug mb-1 line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{p.developerName}</p>
                  {p.startingPrice && (
                    <p className="text-sm font-semibold text-foreground">From AED {Number(p.startingPrice).toLocaleString()}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6">
            <a href={`${localePrefix}/off-plan-in/${c.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              View all off-plan in {c.name} →
            </a>
          </div>
        </section>
      )}

      {/* Similar listings from other Dubai communities */}
      {similarListings.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Properties Available in Dubai Right Now</h2>
          <p className="text-sm text-muted-foreground mb-6">No resale listings in {c.name} at the moment — explore similar homes across Dubai.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarListings.map((l: any) => (
              <a key={l._id} href={`${localePrefix}/listing/${l.slug}`} className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
                {l.featuredImage && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={l.featuredImage} alt={l.title || l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{l.community}</p>
                  <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug mb-2 line-clamp-2">{l.title || l.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    {l.bedrooms != null && <span>{l.bedrooms === 0 ? "Studio" : `${l.bedrooms} BR`}</span>}
                    {l.size && <span>{Number(l.size).toLocaleString()} sqft</span>}
                  </div>
                  {l.price && (
                    <p className="text-sm font-semibold text-foreground">AED {Number(l.price).toLocaleString()}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6">
            <a href={`${localePrefix}/buy`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {L.browseAll} →
            </a>
          </div>
        </section>
      )}

      {/* Fallback CTA */}
      <div className="text-center py-8 border-t border-border">
        <h3 className="text-lg font-bold text-foreground mb-2">{L.emptyTitle}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{L.emptyBody}</p>
        <a href={`${localePrefix}/contact`} className="border-2 border-border text-foreground font-bold px-6 py-3 rounded-xl text-sm hover:bg-muted transition-all">
          {L.getNotified}
        </a>
      </div>
    </div>
  );

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ListingsPageClient
        initialListings={initialListings}
        totalCount={totalCount}
        listingType="Sale"
        title={`${L.forSale} ${c.name}`}
        subtitle={localizeCommunityText(c.shortIntro, locale)}
        initialPage={1}
        batchSize={BATCH_SIZE}
        community={apiCommunity}
        headerSlot={seoBlock}
        emptyState={emptyState}
      />
    </>
  );
}
