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
import { getCommunityStats, dldAreaFor, fmtAed } from "@/lib/market";
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

const FAQ_T: Record<string, Record<string, string>> = {
  en: { q1: "How much is my property worth in {name}?", a1pre: "Homes in {name} currently sell for around AED {ppsf} per square foot{priceClause}. ", a1: "Your exact value depends on the building, floor, view, size and condition. Get an instant, free estimate with Binayah's AI valuation, based on the latest DLD-registered sales for your property.", priceClause: ", with an average sale price near {price}", q2: "How is a property in {name} valued?", a2: "Binayah compares your unit against recent Dubai Land Department (DLD) transactions in {name} — same building or community, bedrooms and size — then adjusts for floor, view and condition. It takes under a minute and needs no registration.", q3: "Is the {name} valuation free?", a3: "Yes — it's completely free, needs no sign-up, and returns an estimate in under a minute. There's no obligation to sell or list with Binayah.", factors: "The biggest drivers of your specific value are the building, floor and view, unit size and layout, condition and upgrades, and how recent comparable sales in {name} have performed. Binayah's free valuation weighs all of these against live DLD data." },
  ru: { q1: "Сколько стоит моя недвижимость в районе {name}?", a1pre: "Жильё в районе {name} сейчас продаётся примерно по AED {ppsf} за квадратный фут{priceClause}. ", a1: "Точная стоимость зависит от здания, этажа, вида, площади и состояния. Получите мгновенную бесплатную оценку с помощью ИИ-оценки Binayah на основе последних зарегистрированных в DLD сделок по вашей недвижимости.", priceClause: ", при средней цене продажи около {price}", q2: "Как оценивается недвижимость в районе {name}?", a2: "Binayah сравнивает вашу квартиру с недавними сделками Земельного департамента Дубая (DLD) в районе {name} — то же здание или комплекс, количество спален и площадь — а затем корректирует оценку с учётом этажа, вида и состояния. Это занимает меньше минуты и не требует регистрации.", q3: "Оценка в районе {name} бесплатна?", a3: "Да — это полностью бесплатно, не требует регистрации и выдаёт оценку менее чем за минуту. Никаких обязательств продавать или выставлять объект через Binayah нет.", factors: "Главные факторы, влияющие на стоимость именно вашего объекта, — это здание, этаж и вид, площадь и планировка квартиры, состояние и улучшения, а также динамика недавних сопоставимых сделок в районе {name}. Бесплатная оценка Binayah учитывает всё это на основе актуальных данных DLD." },
  ar: { q1: "كم تبلغ قيمة عقاري في {name}؟", a1pre: "تُباع العقارات في {name} حاليًا بنحو AED {ppsf} للقدم المربعة{priceClause}. ", a1: "تعتمد القيمة الدقيقة على المبنى والطابق والإطلالة والمساحة والحالة. احصل على تقدير فوري ومجاني عبر التقييم بالذكاء الاصطناعي من Binayah، استنادًا إلى أحدث المبيعات المسجلة لدى دائرة الأراضي والأملاك (DLD) لعقارك.", priceClause: "، بمتوسط سعر بيع يقارب {price}", q2: "كيف يتم تقييم عقار في {name}؟", a2: "تقارن Binayah وحدتك بأحدث معاملات دائرة الأراضي والأملاك (DLD) في {name} — نفس المبنى أو المجتمع وعدد غرف النوم والمساحة — ثم تُعدّل النتيجة وفقًا للطابق والإطلالة والحالة. تستغرق العملية أقل من دقيقة ولا تتطلب أي تسجيل.", q3: "هل تقييم {name} مجاني؟", a3: "نعم — إنه مجاني تمامًا ولا يتطلب أي تسجيل ويقدّم تقديرًا في أقل من دقيقة. ولا يوجد أي التزام بالبيع أو بإدراج العقار مع Binayah.", factors: "أهم العوامل المؤثرة في قيمة عقارك تحديدًا هي المبنى والطابق والإطلالة، ومساحة الوحدة وتصميمها، والحالة والتحسينات، وأداء المبيعات المماثلة الأخيرة في {name}. يقيّم تقييم Binayah المجاني كل هذه العوامل مقابل بيانات DLD الحية." },
  zh: { q1: "我在 {name} 的房产值多少钱？", a1pre: "{name} 的房产目前售价约为每平方英尺 AED {ppsf}{priceClause}。", a1: "您的确切价值取决于楼栋、楼层、景观、面积和房况。通过 Binayah 的 AI 估价，根据您房产最新的迪拜土地局（DLD）登记成交记录，即可获得即时的免费估价。", priceClause: "，平均成交价约为 {price}", q2: "{name} 的房产是如何估价的？", a2: "Binayah 将您的房源与 {name} 近期在迪拜土地局（DLD）登记的成交记录进行比对——相同楼栋或社区、卧室数量和面积——然后根据楼层、景观和房况进行调整。整个过程不到一分钟，且无需注册。", q3: "{name} 的估价免费吗？", a3: "是的——完全免费，无需注册，一分钟内即可返回估价。您没有义务通过 Binayah 出售或挂牌房产。", factors: "决定您房产具体价值的最主要因素是楼栋、楼层和景观，房源面积和户型，房况和翻新情况，以及 {name} 近期可比成交的表现。Binayah 的免费估价会结合实时 DLD 数据对所有这些因素进行权衡。" },
  vi: { q1: "Bất động sản của tôi ở {name} trị giá bao nhiêu?", a1pre: "Nhà ở tại {name} hiện được bán với giá khoảng AED {ppsf} mỗi foot vuông{priceClause}. ", a1: "Giá trị chính xác của bạn phụ thuộc vào tòa nhà, tầng, hướng nhìn, diện tích và tình trạng. Nhận ước tính miễn phí tức thì bằng định giá AI của Binayah, dựa trên các giao dịch mới nhất đã đăng ký với DLD cho bất động sản của bạn.", priceClause: ", với giá bán trung bình gần {price}", q2: "Bất động sản ở {name} được định giá như thế nào?", a2: "Binayah so sánh căn hộ của bạn với các giao dịch gần đây của Sở Đất đai Dubai (DLD) tại {name} — cùng tòa nhà hoặc khu dân cư, số phòng ngủ và diện tích — rồi điều chỉnh theo tầng, hướng nhìn và tình trạng. Quá trình mất chưa đến một phút và không cần đăng ký.", q3: "Định giá tại {name} có miễn phí không?", a3: "Có — hoàn toàn miễn phí, không cần đăng ký và trả về ước tính trong chưa đầy một phút. Bạn không có nghĩa vụ phải bán hoặc đăng bán qua Binayah.", factors: "Những yếu tố lớn nhất quyết định giá trị cụ thể của bạn là tòa nhà, tầng và hướng nhìn, diện tích và bố cục căn hộ, tình trạng và nâng cấp, cùng với hiệu suất của các giao dịch tương đương gần đây tại {name}. Định giá miễn phí của Binayah cân nhắc tất cả những yếu tố này dựa trên dữ liệu DLD trực tiếp." },
  he: { q1: "כמה שווה הנכס שלי ב{name}?", a1pre: "דירות ב{name} נמכרות כיום בכ-AED {ppsf} לרגל רבועה{priceClause}. ", a1: "השווי המדויק שלך תלוי בבניין, בקומה, בנוף, בשטח ובמצב. קבלו הערכת שווי מיידית וחינמית באמצעות הערכת ה-AI של Binayah, המבוססת על העסקאות האחרונות הרשומות ב-DLD עבור הנכס שלכם.", priceClause: ", עם מחיר מכירה ממוצע של כ-{price}", q2: "כיצד מוערך נכס ב{name}?", a2: "Binayah משווה את הנכס שלכם לעסקאות האחרונות של רשות המקרקעין של דובאי (DLD) ב{name} — אותו בניין או מתחם, מספר חדרי שינה ושטח — ולאחר מכן מבצעת התאמה לפי קומה, נוף ומצב. התהליך אורך פחות מדקה ואינו דורש הרשמה.", q3: "האם הערכת השווי ב{name} חינמית?", a3: "כן — היא חינמית לחלוטין, אינה דורשת הרשמה ומחזירה הערכה בפחות מדקה. אין כל התחייבות למכור או לפרסם את הנכס דרך Binayah.", factors: "הגורמים המשמעותיים ביותר לשווי הספציפי שלכם הם הבניין, הקומה והנוף, שטח הנכס והתכנון, המצב והשדרוגים, וכיצד ביצעו עסקאות דומות אחרונות ב{name}. הערכת השווי החינמית של Binayah שוקללת את כל אלה מול נתוני DLD בזמן אמת." },
  fr: { q1: "Quelle est la valeur de mon bien à {name} ?", a1pre: "Les biens à {name} se vendent actuellement autour de AED {ppsf} le pied carré{priceClause}. ", a1: "Votre valeur exacte dépend de l'immeuble, de l'étage, de la vue, de la surface et de l'état. Obtenez une estimation instantanée et gratuite grâce à l'évaluation par IA de Binayah, basée sur les dernières ventes enregistrées au DLD pour votre bien.", priceClause: ", avec un prix de vente moyen proche de {price}", q2: "Comment un bien à {name} est-il évalué ?", a2: "Binayah compare votre bien aux transactions récentes du Département foncier de Dubaï (DLD) à {name} — même immeuble ou communauté, nombre de chambres et surface — puis ajuste selon l'étage, la vue et l'état. Cela prend moins d'une minute et ne nécessite aucune inscription.", q3: "L'évaluation à {name} est-elle gratuite ?", a3: "Oui — elle est entièrement gratuite, ne nécessite aucune inscription et fournit une estimation en moins d'une minute. Vous n'avez aucune obligation de vendre ou de mettre en vente avec Binayah.", factors: "Les principaux facteurs déterminant la valeur spécifique de votre bien sont l'immeuble, l'étage et la vue, la surface et l'agencement du bien, l'état et les rénovations, ainsi que la performance des ventes comparables récentes à {name}. L'évaluation gratuite de Binayah pondère tous ces éléments par rapport aux données DLD en temps réel." },
};

const META_T: Record<string, { title: string; desc: string; avg: string }> = {
  en: { title: "{name} Property Valuation | What Is My {name} Property Worth? | Binayah", desc: "Free instant valuation for property in {name}, Dubai. See what your apartment or villa is worth from real DLD sale data{ppsfClause}. No sign-up.", avg: "avg" },
  ru: { title: "Оценка недвижимости в {name} | Сколько стоит моя недвижимость? | Binayah", desc: "Бесплатная мгновенная оценка недвижимости в {name}, Дубай. Узнайте стоимость вашей квартиры или виллы по реальным данным DLD{ppsfClause}. Без регистрации.", avg: "в среднем" },
  ar: { title: "تقييم عقارات {name} | كم تبلغ قيمة عقاري؟ | بناية", desc: "تقييم فوري مجاني للعقارات في {name}، دبي. اعرف قيمة شقتك أو فيلتك من بيانات مبيعات DLD الحقيقية{ppsfClause}. بدون تسجيل.", avg: "متوسط" },
  zh: { title: "{name}房产估价 | 我的房产价值多少？| Binayah", desc: "{name}（迪拜）房产免费即时估价。基于DLD真实成交数据了解您的公寓或别墅价值{ppsfClause}。无需注册。", avg: "均价" },
  vi: { title: "Định giá bất động sản {name} | Nhà tôi trị giá bao nhiêu? | Binayah", desc: "Định giá tức thì miễn phí cho bất động sản tại {name}, Dubai. Xem căn hộ hoặc biệt thự của bạn trị giá bao nhiêu từ dữ liệu bán hàng DLD thực tế{ppsfClause}. Không cần đăng ký.", avg: "trung bình" },
  he: { title: "הערכת נכסים ב{name} | כמה שווה הנכס שלי? | Binayah", desc: "הערכת נכס מיידית וחינמית ב{name}, דובאי. גלו כמה שווה הדירה או הווילה שלכם לפי נתוני מכירות DLD אמיתיים{ppsfClause}. ללא הרשמה.", avg: "ממוצע" },
  fr: { title: "Estimation immobilière {name} | Quelle est la valeur de mon bien ? | Binayah", desc: "Estimation immobilière instantanée et gratuite à {name}, Dubaï. Découvrez la valeur de votre appartement ou villa à partir des données de vente réelles du DLD{ppsfClause}. Sans inscription.", avg: "moy." },
};

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
  const M = META_T[locale] ?? META_T.en;
  const ppsfVal = stats?.avgPricePerSqft ? `AED ${stats.avgPricePerSqft.toLocaleString("en-AE")}/sqft` : (c.priceRange || "");
  const ppsfClause = ppsfVal ? ` (${M.avg} ${ppsfVal})` : "";
  const title = M.title.replace(/\{name\}/g, c.name);
  const full = M.desc.replace(/\{name\}/g, c.name).replace("{ppsfClause}", ppsfClause);
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

  // Localized seller FAQs, with real DLD figures interpolated per community.
  const T = FAQ_T[locale] ?? FAQ_T.en;
  const fill = (s: string) => s.replace(/\{name\}/g, c.name);
  const priceClause = stats?.avgSalePrice ? T.priceClause.replace("{price}", fmtAed(stats.avgSalePrice)) : "";
  const a1pre = stats?.avgPricePerSqft
    ? fill(T.a1pre).replace("{ppsf}", stats.avgPricePerSqft.toLocaleString("en-AE")).replace("{priceClause}", priceClause)
    : "";
  const faqs = [
    { question: fill(T.q1), answer: a1pre + fill(T.a1) },
    { question: fill(T.q2), answer: fill(T.a2) },
    { question: fill(T.q3), answer: fill(T.a3) },
  ];
  const factorsPara = fill(T.factors);

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
            {factorsPara}
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
