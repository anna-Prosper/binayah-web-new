/* eslint-disable i18next/no-literal-string -- SEO landing page; community copy is localized via localizeCommunityText, UI labels via the LABELS map */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ListingsPageClient from "@/app/_clients/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { BUY_COMMUNITIES, findBuyCommunity, localizeCommunityText } from "@/lib/buy-communities";
import { getCommunityStats, buildMarketNote } from "@/lib/market";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";

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
  const META: Record<string, { title: (n: string) => string; suffix: (n: string) => string }> = {
    fr: { title: (n) => `Louer un bien à ${n}, Dubaï | Appartements & Villas | Binayah`, suffix: (n) => ` Consultez les appartements et villas à louer à ${n} avec Binayah.` },
    ru: { title: (n) => `Аренда недвижимости в ${n}, Дубай | Квартиры и виллы | Binayah`, suffix: (n) => ` Квартиры и виллы в аренду в ${n} на Binayah.` },
    ar: { title: (n) => `استئجار عقار في ${n}، دبي | شقق وفيلات | Binayah`, suffix: (n) => ` تصفّح الشقق والفيلات للإيجار في ${n} مع بناية.` },
    zh: { title: (n) => `迪拜${n}租房 | 公寓和别墅 | Binayah`, suffix: (n) => ` 在 Binayah 浏览${n}出租公寓和别墅。` },
    vi: { title: (n) => `Thuê bất động sản tại ${n}, Dubai | Căn hộ & Biệt thự | Binayah`, suffix: (n) => ` Xem căn hộ và biệt thự cho thuê tại ${n} với Binayah.` },
    he: { title: (n) => `השכרת נכס ב-${n}, דובאי | דירות ווילות | Binayah`, suffix: (n) => ` דירות ווילות להשכרה ב-${n} עם Binayah.` },
  };
  const tmpl = META[locale];
  const title = tmpl ? tmpl.title(c.name) : `Rent Property in ${c.name}, Dubai | Apartments & Villas | Binayah`;
  const suffix = tmpl ? tmpl.suffix(c.name) : ` Browse apartments and villas for rent in ${c.name} with Binayah.`;
  const full = `${localizeCommunityText(c.shortIntro, locale)}${suffix}`;
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
      locale: OG_LOCALE[locale] ?? "en_AE",
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
  fr: { home: "Accueil", rent: "Location", rentIn: "Louer un bien à", dubai: "Dubaï", priceRange: "Fourchette de prix", grossYield: "Rendement brut", listings: "Annonces", forRent: "Biens à louer à", emptyTitle: "Aucune location disponible pour le moment", emptyBody: "Nous ajoutons régulièrement de nouvelles locations dans ce quartier. Dites-nous ce que vous cherchez et nous vous alerterons dès qu'un bien sera disponible, ou explorez les locations à Dubaï.", browseAll: "Voir toutes les locations", getNotified: "Être alerté" },
} as const;

// Localized cross-link + empty-state copy (numbers/brand names stay verbatim).
type CxStr = {
  offTitle: (n: string) => string; offBody: (n: string) => string;
  offBadge: string; from: string; viewAllOff: (n: string) => string;
  similarTitle: string; similarBody: (n: string) => string;
  studio: string; br: string; sqft: string; perYr: string;
};
const CX: Record<string, CxStr> = {
  en: { offTitle: (n) => `Off-Plan Projects in ${n}`, offBody: (n) => `No rentals right now — but these new launches in ${n} are open for purchase with flexible payment plans.`, offBadge: "Off-Plan", from: "From", viewAllOff: (n) => `View all off-plan in ${n} →`, similarTitle: "Rentals Available in Dubai Right Now", similarBody: (n) => `No rentals in ${n} at the moment — explore similar options across Dubai.`, studio: "Studio", br: "BR", sqft: "sqft", perYr: "/ yr" },
  fr: { offTitle: (n) => `Projets sur plan à ${n}`, offBody: (n) => `Aucune location pour le moment — mais ces nouveaux lancements à ${n} sont ouverts à l'achat avec des plans de paiement flexibles.`, offBadge: "Sur Plan", from: "À partir de", viewAllOff: (n) => `Voir tout le sur plan à ${n} →`, similarTitle: "Locations disponibles à Dubaï en ce moment", similarBody: (n) => `Aucune location à ${n} pour le moment — explorez des options similaires à Dubaï.`, studio: "Studio", br: "ch.", sqft: "pi²", perYr: "/ an" },
  ar: { offTitle: (n) => `مشاريع على الخارطة في ${n}`, offBody: (n) => `لا توجد عقارات للإيجار حالياً — لكن هذه الإطلاقات الجديدة في ${n} متاحة للشراء بخطط سداد مرنة.`, offBadge: "على الخارطة", from: "ابتداءً من", viewAllOff: (n) => `عرض كل المشاريع على الخارطة في ${n} →`, similarTitle: "عقارات للإيجار متاحة في دبي الآن", similarBody: (n) => `لا توجد عقارات للإيجار في ${n} حالياً — استكشف خيارات مماثلة في جميع أنحاء دبي.`, studio: "استوديو", br: "غرفة", sqft: "قدم²", perYr: "/ سنة" },
  zh: { offTitle: (n) => `${n}期房项目`, offBody: (n) => `目前暂无租盘——但${n}的这些新楼盘正在开放购买，并提供灵活付款计划。`, offBadge: "期房", from: "起价", viewAllOff: (n) => `查看${n}全部期房 →`, similarTitle: "迪拜当前可租房源", similarBody: (n) => `${n}目前暂无租盘——探索迪拜各地的类似选择。`, studio: "开间", br: "室", sqft: "平方英尺", perYr: "/年" },
  vi: { offTitle: (n) => `Dự án off-plan tại ${n}`, offBody: (n) => `Hiện chưa có bất động sản cho thuê — nhưng các dự án mới tại ${n} đang mở bán với kế hoạch thanh toán linh hoạt.`, offBadge: "Off-Plan", from: "Từ", viewAllOff: (n) => `Xem tất cả off-plan tại ${n} →`, similarTitle: "Bất động sản cho thuê có sẵn tại Dubai ngay bây giờ", similarBody: (n) => `Hiện chưa có bất động sản cho thuê tại ${n} — khám phá các lựa chọn tương tự trên khắp Dubai.`, studio: "Studio", br: "PN", sqft: "foot²", perYr: "/ năm" },
  he: { offTitle: (n) => `פרויקטים על הנייר ב-${n}`, offBody: (n) => `אין כרגע נכסים להשכרה — אך השקות חדשות אלו ב-${n} פתוחות לרכישה עם תוכניות תשלום גמישות.`, offBadge: "על הנייר", from: "החל מ-", viewAllOff: (n) => `צפו בכל הפרויקטים על הנייר ב-${n} →`, similarTitle: "נכסים להשכרה זמינים בדובאי כעת", similarBody: (n) => `אין כרגע נכסים להשכרה ב-${n} — גלו אפשרויות דומות ברחבי דובאי.`, studio: "סטודיו", br: 'חד״ש', sqft: "רגל²", perYr: "/ שנה" },
  ru: { offTitle: (n) => `Новостройки в ${n}`, offBody: (n) => `Сейчас нет объектов в аренду — но эти новые проекты в ${n} открыты для покупки с гибкими планами оплаты.`, offBadge: "Новостройка", from: "от", viewAllOff: (n) => `Все новостройки в ${n} →`, similarTitle: "Доступная аренда в Дубае сейчас", similarBody: (n) => `Сейчас нет объектов в аренду в ${n} — посмотрите похожие варианты по Дубаю.`, studio: "Студия", br: "спальни", sqft: "кв. фут", perYr: "/ год" },
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
  const X = CX[locale] ?? CX.en;

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
  const marketNote = buildMarketNote(c.name, await getCommunityStats(apiCommunity), "rent", locale);

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
        {/* h2, not h1 — the listings hero above already carries the page's single h1. */}
        <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
          {L.rentIn} {c.name}, {L.dubai}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">{localizeCommunityText(c.shortIntro, locale)}</p>
        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{localizeCommunityText(c.why, locale)}</p>
        {marketNote && <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{marketNote}</p>}
        {/* Only render stats that actually have a value — a blank "Price range"
            or a "Listings 0" reads as broken rather than informative. */}
        {(() => {
          const stats = [
            c.priceRange ? { l: L.priceRange, v: c.priceRange } : null,
            c.yield ? { l: L.grossYield, v: c.yield } : null,
            totalCount > 0 ? { l: L.listings, v: `${totalCount}+` } : null,
          ].filter(Boolean) as { l: string; v: string }[];
          if (!stats.length) return null;
          const cols = stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1";
          return (
            <div className={`grid ${cols} gap-4 max-w-xl`}>
              {stats.map((s) => (
                <div key={s.l}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.l}</p>
                  <p className="text-sm sm:text-base font-bold text-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </section>
  );

  const emptyState = (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {offPlanProjects.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{X.offTitle(c.name)}</h2>
          <p className="text-sm text-muted-foreground mb-6">{X.offBody(c.name)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offPlanProjects.map((p: any) => (
              <a key={p._id} href={`${localePrefix}/project/${p.slug}`} className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
                {p.featuredImage && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.featuredImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">{p.status || X.offBadge}</p>
                  <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug mb-1 line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{p.developerName}</p>
                  {p.startingPrice && (
                    <p className="text-sm font-semibold text-foreground">{X.from} AED {Number(p.startingPrice).toLocaleString()}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6">
            <a href={`${localePrefix}/off-plan-in/${c.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {X.viewAllOff(c.name)}
            </a>
          </div>
        </section>
      )}

      {similarListings.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{X.similarTitle}</h2>
          <p className="text-sm text-muted-foreground mb-6">{X.similarBody(c.name)}</p>
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
                    {l.bedrooms != null && <span>{l.bedrooms === 0 ? X.studio : `${l.bedrooms} ${X.br}`}</span>}
                    {l.size && <span>{Number(l.size).toLocaleString()} {X.sqft}</span>}
                  </div>
                  {l.price && (
                    <p className="text-sm font-semibold text-foreground">AED {Number(l.price).toLocaleString()} {X.perYr}</p>
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

      {/* Fallback CTA */}
      <div className="mt-6 rounded-3xl border border-border bg-gradient-to-b from-muted/40 to-card px-6 py-12 sm:py-14 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" /></svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{L.emptyTitle}</h3>
        <p className="text-sm text-muted-foreground mb-7 max-w-md mx-auto leading-relaxed">{L.emptyBody}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href={`${localePrefix}/contact`} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-accent-foreground transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}>
            {L.getNotified}
          </a>
          <a href={`${localePrefix}/rent`} className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-muted transition-all">
            {L.browseAll} →
          </a>
        </div>
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
