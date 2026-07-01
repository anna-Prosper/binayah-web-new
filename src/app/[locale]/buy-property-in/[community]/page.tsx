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
  const title = `Buy Property in ${c.name}, Dubai | ${c.priceRange} | Binayah`;
  const full = `${localizeCommunityText(c.shortIntro, locale)} Avg yield ${c.yield}. Browse listings for sale in ${c.name} with Binayah.`;
  // Clamp to ~158 chars on a word boundary so the meta description isn't truncated mid-word by Google.
  const description = full.length <= 158 ? full : full.slice(0, 157).replace(/\s+\S*$/, "") + "…";

  // Zero-inventory guard: a community page with no listings for sale can't
  // satisfy the query — keep it crawlable (follow) but noindex until it fills.
  let hasListings = true;
  try {
    const res = await serverFetch(serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(c.apiName ?? c.name)}&countOnly=1`));
    if (res.ok) hasListings = ((await res.json()).total ?? 0) > 0;
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
  const apiCommunity = c.apiName ?? c.name;

  try {
    const [listingsRes, countRes] = await Promise.all([
      serverFetch(
        serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(apiCommunity)}&limit=${BATCH_SIZE}`)
      ),
      serverFetch(
        serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(apiCommunity)}&countOnly=1`)
      ),
    ]);
    if (listingsRes.ok) initialListings = await listingsRes.json();
    if (countRes.ok) totalCount = (await countRes.json()).total ?? 0;
  } catch (err) {
    console.warn("[BuyInCommunityPage] API unavailable:", (err as Error).message);
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
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center text-primary-foreground" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{L.emptyTitle}</h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">{L.emptyBody}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`${localePrefix}/buy`} className="font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
          {L.browseAll}
        </a>
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
