/* eslint-disable i18next/no-literal-string -- SEO landing page; community copy is localized via localizeCommunityText, UI labels via the LABELS map */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommunityStatsBand from "@/components/CommunityStatsBand";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { CURATED_COMMUNITY_SLUGS, findBuyCommunity, localizeCommunityText } from "@/lib/buy-communities";
import { getCommunityStats, buildCommunityFaqs, dldAreaFor, fmtAed } from "@/lib/market";
import { getDldBuildings } from "@/lib/api";
import { getNonce } from "@/lib/nonce";
import { canonical as makeCanonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";

export const revalidate = 86400;

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  return locales.flatMap((locale) =>
    CURATED_COMMUNITY_SLUGS.map((community) => ({ locale, community }))
  );
}

const LABELS = {
  en: { kicker: "Free property valuation", worth: "How much is my property worth in", cta: "Value my property free", ctaSub: "Instant AI estimate · No sign-up", benchmark: "Sale price benchmark for", affects: "What affects your property's value in", guideLink: "Read the {name} area guide", buyLink: "Browse homes for sale in {name}", bottomTitle: "Get your free {name} valuation", bottomBody: "See what your apartment, villa or townhouse could sell for today — instantly, using real Dubai Land Department transaction data. No obligation, no sign-up." },
  ru: { kicker: "Бесплатная оценка недвижимости", worth: "Сколько стоит моя недвижимость в", cta: "Оценить бесплатно", ctaSub: "Мгновенно, на базе ИИ · Без регистрации", benchmark: "Ориентир цен продажи в", affects: "Что влияет на стоимость недвижимости в", guideLink: "Гид по району {name}", buyLink: "Объекты на продажу в {name}", bottomTitle: "Получите бесплатную оценку в {name}", bottomBody: "Узнайте, за сколько можно продать вашу квартиру, виллу или таунхаус сегодня — мгновенно, на основе реальных данных Земельного департамента Дубая. Без обязательств и регистрации." },
  ar: { kicker: "تقييم عقاري مجاني", worth: "كم تبلغ قيمة عقاري في", cta: "قيّم عقارك مجانًا", ctaSub: "تقدير فوري بالذكاء الاصطناعي · بدون تسجيل", benchmark: "مرجع أسعار البيع في", affects: "ما الذي يؤثر في قيمة عقارك في", guideLink: "دليل منطقة {name}", buyLink: "عقارات للبيع في {name}", bottomTitle: "احصل على تقييم مجاني في {name}", bottomBody: "اكتشف السعر الذي يمكن أن تُباع به شقتك أو فيلتك أو تاون هاوس اليوم — فورًا، باستخدام بيانات معاملات دائرة الأراضي والأملاك في دبي. دون التزام ودون تسجيل." },
  zh: { kicker: "免费房产估价", worth: "我的房产价值多少", benchmark: "的售价基准", affects: "影响您房产价值的因素", cta: "免费估价", ctaSub: "AI 即时估算 · 无需注册", guideLink: "{name}区域指南", buyLink: "{name}在售房产", bottomTitle: "获取{name}的免费估价", bottomBody: "立即了解您的公寓、别墅或联排别墅当前可售价格——基于迪拜土地局真实交易数据。无义务，无需注册。" },
  vi: { kicker: "Định giá bất động sản miễn phí", worth: "Bất động sản của tôi tại", benchmark: "Mốc giá bán tại", affects: "Điều gì ảnh hưởng đến giá trị bất động sản của bạn tại", cta: "Định giá miễn phí", ctaSub: "Ước tính AI tức thì · Không cần đăng ký", guideLink: "Cẩm nang khu vực {name}", buyLink: "Bất động sản bán tại {name}", bottomTitle: "Nhận định giá miễn phí tại {name}", bottomBody: "Xem căn hộ, biệt thự hay nhà phố của bạn có thể bán được bao nhiêu hôm nay — tức thì, dựa trên dữ liệu giao dịch thực của Sở Đất đai Dubai. Không ràng buộc, không cần đăng ký." },
  he: { kicker: "הערכת נכס חינם", worth: "כמה שווה הנכס שלי ב", benchmark: "מדד מחירי מכירה ב", affects: "מה משפיע על ערך הנכס שלכם ב", cta: "הערכת נכס חינם", ctaSub: "הערכת AI מיידית · ללא הרשמה", guideLink: "מדריך אזור {name}", buyLink: "נכסים למכירה ב{name}", bottomTitle: "קבלו הערכה חינם ב{name}", bottomBody: "גלו בכמה הדירה, הווילה או בית הטאון שלכם יכולים להימכר היום — מיידית, על בסיס נתוני עסקאות אמיתיים של רשות המקרקעין של דובאי. ללא התחייבות וללא הרשמה." },
  fr: { kicker: "Évaluation immobilière gratuite", worth: "Quelle est la valeur de mon bien à", benchmark: "Référence des prix de vente à", affects: "Ce qui influence la valeur de votre bien à", cta: "Évaluer mon bien gratuitement", ctaSub: "Estimation IA instantanée · Sans inscription", guideLink: "Guide du quartier {name}", buyLink: "Biens à vendre à {name}", bottomTitle: "Obtenez votre évaluation gratuite à {name}", bottomBody: "Découvrez le prix de vente possible de votre appartement, villa ou maison de ville aujourd'hui — instantanément, à partir des données réelles du Dubai Land Department. Sans engagement ni inscription." },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}): Promise<Metadata> {
  const { community, locale } = await params;
  if (!CURATED_COMMUNITY_SLUGS.includes(community)) return {};
  const c = findBuyCommunity(community);
  if (!c) return {};
  const stats = await getCommunityStats(c.apiName ?? c.name);
  const ppsf = stats?.avgPricePerSqft ? `AED ${stats.avgPricePerSqft.toLocaleString("en-AE")}/sqft` : c.priceRange;
  const title = `${c.name} Property Valuation | What Is My ${c.name} Property Worth? | Binayah`;
  const full = `Free instant valuation for property in ${c.name}, Dubai. See what your apartment or villa is worth from real DLD sale data${ppsf ? ` (avg ${ppsf})` : ""}. No sign-up.`;
  const description = full.length <= 158 ? full : full.slice(0, 157).replace(/\s+\S*$/, "") + "…";
  const path = `/property-valuation/${c.slug}`;
  // Index only when we have a real DLD price benchmark to show — otherwise the
  // page is a thin CTA. Crawlable (follow) but noindex until data is present.
  const hasData = !!stats?.avgPricePerSqft;
  return {
    title,
    description,
    ...(hasData ? {} : { robots: { index: false as const, follow: true } }),
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: {
      title,
      description,
      type: "website",
      url: makeCanonical(locale, path),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
  };
}

export default async function PropertyValuationCommunityPage({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}) {
  const { locale, community } = await params;
  if (!CURATED_COMMUNITY_SLUGS.includes(community)) notFound();
  const c = findBuyCommunity(community);
  if (!c) notFound();
  const L = LABELS[(locale as keyof typeof LABELS)] ?? LABELS.en;
  const lp = locale === "en" ? "" : `/${locale}`;
  const nonce = await getNonce();
  const apiName = c.apiName ?? c.name;

  const stats = await getCommunityStats(apiName);
  const buildings = (await getDldBuildings(`area=${encodeURIComponent(dldAreaFor(c.name))}&limit=12&sortBy=sales`)).results
    .filter((b: { slug?: string; name?: string }) => b.slug && b.name)
    .slice(0, 12)
    .map((b: { slug: string; name: string }) => ({ slug: b.slug, name: b.name }));

  // Seller-intent FAQs prepended to the generic price/yield FAQs.
  const sellerFaqs = [
    {
      question: `How much is my property worth in ${c.name}?`,
      answer: `${stats?.avgPricePerSqft ? `Homes in ${c.name} currently trade at around AED ${stats.avgPricePerSqft.toLocaleString("en-AE")} per square foot${stats.avgSalePrice ? `, with an average sale price near ${fmtAed(stats.avgSalePrice)}` : ""}. ` : ""}Your exact value depends on the building, floor, view, size and condition. Use Binayah's free AI valuation for an instant estimate based on the latest DLD-registered sales for your specific property.`,
    },
    {
      question: `How is a property in ${c.name} valued?`,
      answer: `Binayah's valuation compares your unit against recent Dubai Land Department (DLD) transactions in ${c.name} — same building or community, bedroom count and size — then adjusts for floor, view and condition. It takes under a minute and needs no registration.`,
    },
  ];
  const faqs = [...sellerFaqs, ...buildCommunityFaqs(c.name, stats)];

  const breadcrumbs = [
    { label: "Valuation", href: `${lp}/valuation` },
    { label: c.name, href: `${lp}/property-valuation/${c.slug}` },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Hero — seller intent + valuation CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-8 sm:pt-6 sm:pb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">{L.kicker}</p>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 max-w-3xl">
            {L.worth} {c.name}?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-3">
            {localizeCommunityText(c.shortIntro, locale)}
          </p>
          {stats?.avgPricePerSqft && (
            <p className="inline-flex items-center gap-2 text-sm sm:text-base text-foreground/90 font-medium mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              {c.name}: ~AED {stats.avgPricePerSqft.toLocaleString("en-AE")}/sqft
              {stats.avgSalePrice ? ` · avg ${fmtAed(stats.avgSalePrice)}` : ""}
              {stats.rentalYield ? ` · ${stats.rentalYield}% yield` : ""}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href={`${lp}/valuation`}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              <Sparkles className="h-4 w-4" /> {L.cta} <ArrowRight className="h-4 w-4" />
            </a>
            <span className="text-xs text-muted-foreground">{L.ctaSub}</span>
          </div>
        </section>

        {/* Real DLD price benchmark + top buildings + FAQ schema (reused band) */}
        <div className="border-y border-border bg-card/40">
          <div className="max-w-6xl mx-auto">
            <div className="px-4 sm:px-6 pt-8 sm:pt-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{L.benchmark} {c.name}</h2>
            </div>
            <CommunityStatsBand name={c.name} stats={stats} faqs={faqs} buildings={buildings} localePrefix={lp} nonce={nonce} />
          </div>
        </div>

        {/* What affects value + cross-links */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{L.affects} {c.name}</h2>
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-6">
            {localizeCommunityText(c.why, locale)}
          </p>
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">
            The biggest drivers of your specific value are the building, floor and view, unit size and layout,
            condition and upgrades, and how recent comparable sales in {c.name} have performed. Binayah's free
            valuation weighs all of these against live DLD data.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={`${lp}/communities/${c.slug}`} className="text-primary font-semibold hover:underline">
              {L.guideLink.replace("{name}", c.name)} →
            </a>
            <a href={`${lp}/buy-property-in/${c.slug}`} className="text-primary font-semibold hover:underline">
              {L.buyLink.replace("{name}", c.name)} →
            </a>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="rounded-3xl px-6 py-10 sm:px-12 sm:py-14 text-center" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{L.bottomTitle.replace("{name}", c.name)}</h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mx-auto mb-7">{L.bottomBody}</p>
            <a
              href={`${lp}/valuation`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-[#0B3D2E] hover:bg-white/90 transition-colors"
            >
              <Sparkles className="h-4 w-4" /> {L.cta} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <BreadcrumbJsonLd items={breadcrumbs.map((b) => ({ name: b.label, href: b.href }))} nonce={nonce} />
    </div>
  );
}
