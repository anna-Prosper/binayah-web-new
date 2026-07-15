/* eslint-disable i18next/no-literal-string -- SEO landing page; community copy is localized via localizeCommunityText, UI labels via the LABELS map */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ListingsPageClient from "@/app/_clients/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { BUY_COMMUNITIES, findBuyCommunity, localizeCommunityText } from "@/lib/buy-communities";
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
  const title = `Rent Property in ${c.name}, Dubai | Apartments & Villas | Binayah`;
  const full = `${localizeCommunityText(c.shortIntro, locale)} Browse apartments and villas for rent in ${c.name} with Binayah.`;
  // Clamp to ~158 chars on a word boundary so the meta description isn't truncated mid-word by Google.
  const description = full.length <= 158 ? full : full.slice(0, 157).replace(/\s+\S*$/, "") + "…";

  // Pages always have content (community copy + market stats + off-plan projects
  // or Dubai-wide rentals when community-specific inventory is empty). All 58
  // communities are real Dubai areas that deserve to be indexed.

  return {
    title,
    description,
    alternates: {
      canonical: makeCanonical(locale, `/rent-property-in/${c.slug}`),
      languages: altLangs(`/rent-property-in/${c.slug}`),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: makeCanonical(locale, `/rent-property-in/${c.slug}`),
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
  };
}

const BATCH_SIZE = 9;

const LABELS = {
  en: { home: "Home", rent: "Rent", rentIn: "Rent Property in", dubai: "Dubai", priceRange: "Price range", grossYield: "Gross yield", listings: "Listings", forRent: "Properties for Rent in", emptyTitle: "No active rentals here right now", emptyBody: "We add new rentals in this community regularly. Tell us what you're after and we'll alert you the moment one lists, or explore what's available across Dubai today.", browseAll: "Browse all rentals", getNotified: "Get notified" },
  ru: { home: "Главная", rent: "Аренда", rentIn: "Аренда недвижимости в", dubai: "Дубае", priceRange: "Диапазон цен", grossYield: "Доходность", listings: "Объектов", forRent: "Недвижимость в аренду в", emptyTitle: "Сейчас здесь нет активных объявлений", emptyBody: "Мы регулярно добавляем новые объекты в аренду в этом районе. Расскажите, что ищете, и мы сообщим, как только появится вариант, или посмотрите доступное по всему Дубаю.", browseAll: "Вся аренда", getNotified: "Уведомить меня" },
  ar: { home: "الرئيسية", rent: "إيجار", rentIn: "استئجار عقار في", dubai: "دبي", priceRange: "نطاق السعر", grossYield: "العائد الإجمالي", listings: "عقارات", forRent: "عقارات للإيجار في", emptyTitle: "لا توجد عقارات للإيجار هنا حاليًا", emptyBody: "نضيف عقارات إيجار جديدة في هذا المجتمع بانتظام. أخبرنا بما تبحث عنه وسننبهك فور توفّره, أو استكشف المتاح في جميع أنحاء دبي اليوم.", browseAll: "تصفّح كل عقارات الإيجار", getNotified: "نبّهني" },
  zh: { home: "首页", rent: "租赁", rentIn: "租赁房产, ", dubai: "迪拜", priceRange: "价格区间", grossYield: "租金回报", listings: "房源", forRent: "出租房产, ", emptyTitle: "该区域暂无在租房源", emptyBody: "我们会定期上架该社区的新租盘。告诉我们您的需求，一有合适房源即刻通知您, , 或浏览迪拜全城目前可租的房源。", browseAll: "浏览全部租盘", getNotified: "通知我" },
  vi: { home: "Trang chủ", rent: "Thuê", rentIn: "Thuê bất động sản tại", dubai: "Dubai", priceRange: "Khoảng giá", grossYield: "Lợi suất gộp", listings: "Tin đăng", forRent: "Bất động sản cho thuê tại", emptyTitle: "Hiện chưa có tin cho thuê tại khu vực này", emptyBody: "Chúng tôi thường xuyên bổ sung bất động sản cho thuê mới ở khu vực này. Hãy cho biết bạn đang tìm gì và chúng tôi sẽ báo ngay khi có, hoặc khám phá các lựa chọn hiện có trên khắp Dubai.", browseAll: "Xem tất cả cho thuê", getNotified: "Nhận thông báo" },
  he: { home: "בית", rent: "השכרה", rentIn: "השכרת נכס ב", dubai: "דובאי", priceRange: "טווח מחירים", grossYield: "תשואה ברוטו", listings: "מודעות", forRent: "נכסים להשכרה ב", emptyTitle: "אין כרגע נכסים להשכרה כאן", emptyBody: "אנו מוסיפים נכסים חדשים להשכרה בקהילה זו באופן קבוע. ספרו לנו מה אתם מחפשים ונעדכן אתכם ברגע שמתפרסם נכס, או גלו את ההיצע ברחבי דובאי היום.", browseAll: "עיון בכל הנכסים להשכרה", getNotified: "עדכנו אותי" },
} as const;

export default async function RentInCommunityPage({
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
    const namesToTry = [apiCommunity, ...(c.synonyms ?? []).filter(s => s !== apiCommunity)];
    for (const name of namesToTry) {
      const [listingsRes, countRes] = await Promise.all([
        serverFetch(serverApiUrl(`/api/listings?listingType=Rent&community=${encodeURIComponent(name)}&limit=${BATCH_SIZE}`)),
        serverFetch(serverApiUrl(`/api/listings?listingType=Rent&community=${encodeURIComponent(name)}&countOnly=1`)),
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
    console.warn("[RentInCommunityPage] API unavailable:", (err as Error).message);
  }

  // When no rentals exist, load off-plan projects and a cross-community rental sample.
  let offPlanProjects: any[] = [];
  let similarListings: any[] = [];
  if (totalCount === 0) {
    try {
      const [projRes, similarRes] = await Promise.all([
        serverFetch(serverApiUrl(`/api/projects?community=${encodeURIComponent(c.name)}&limit=6`)),
        serverFetch(serverApiUrl(`/api/listings?listingType=Rent&limit=6`)),
      ]);
      if (projRes.ok) offPlanProjects = await projRes.json();
      if (similarRes.ok) {
        const data = await similarRes.json();
        similarListings = Array.isArray(data) ? data : (data.results ?? []);
      }
    } catch { /* best-effort */ }
  }

  // Rent-side DLD market note — diverges this page from its /buy-property-in twin.
  const marketNote = buildMarketNote(c.name, await getCommunityStats(apiCommunity), "rent");

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: L.home, href: `${localePrefix}/` },
    { name: L.rent, href: `${localePrefix}/rent` },
    { name: c.name, href: `${localePrefix}/rent-property-in/${c.slug}` },
  ];

  const seoBlock = (
    <section className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">{localizeCommunityText(c.vibe, locale)}</p>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
          {L.rentIn} {c.name}, {L.dubai}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">{localizeCommunityText(c.shortIntro, locale)}</p>
        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{localizeCommunityText(c.why, locale)}</p>
        {marketNote && <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{marketNote}</p>}
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
      {offPlanProjects.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Off-Plan Projects in {c.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">No rentals right now — but these new launches in {c.name} are open for purchase with flexible payment plans.</p>
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

      {similarListings.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Rentals Available in Dubai Right Now</h2>
          <p className="text-sm text-muted-foreground mb-6">No rentals in {c.name} at the moment — explore similar options across Dubai.</p>
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
                    <p className="text-sm font-semibold text-foreground">AED {Number(l.price).toLocaleString()} / yr</p>
                  )}
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6">
            <a href={`${localePrefix}/rent`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {L.browseAll} →
            </a>
          </div>
        </section>
      )}

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
        listingType="Rent"
        title={`${L.forRent} ${c.name}`}
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
