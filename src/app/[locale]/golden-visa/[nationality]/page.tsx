/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { GOLDEN_VISA_NATIONALITIES, findGoldenVisaNationality } from "@/lib/golden-visa-nationalities";
import { findForeignBuyer, localizeBuyerText } from "@/lib/foreign-buyers";
import { canonical as makeCanonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";

export const revalidate = 86400;

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  return locales.flatMap((locale) =>
    GOLDEN_VISA_NATIONALITIES.map((g) => ({ locale, nationality: g.slug }))
  );
}

const AREA_COMMUNITY_SLUGS: Record<string, string> = {
  "Dubai Marina": "dubai-marina",
  "Downtown Dubai": "downtown-dubai",
  "Dubai Hills Estate": "dubai-hills-estate",
  "Palm Jumeirah": "palm-jumeirah",
  "Business Bay": "business-bay",
  "DIFC": "difc",
  "Jumeirah Beach Residence": "jumeirah-beach-residence",
  "Jumeirah Village Circle": "jumeirah-village-circle",
};

const CONTENT = {
  en: {
    eyebrow: "Golden Visa",
    whatHeading: "What the AED 2M route grants",
    notHeading: "What it does not grant",
    docsHeading: "Documents and the practical path",
    genericHeading: "The full process, step by step",
    genericBody: "Thresholds, the five-step application, renewal and the general FAQ are on the main Golden Visa guide. This page covers only what differs for",
    genericCta: "Read the full Golden Visa guide",
    citizenHeading: "Buying the qualifying property",
    citizenBody: "Ownership rights, financing, tax at home and moving funds are covered on the nationality buyer guide:",
    citizenCta: "Read the buyer guide for",
    areasHeading: "Communities where AED 2M buys",
    areasCta: "Browse property in",
    ctaTitle: "Want to check if you qualify?",
    ctaDesc: "Our RERA-certified agents structure purchases to meet the AED 2M threshold cleanly, including off-plan payment plans. No obligation.",
    ctaBtn: "Talk to our team",
    ctaBtn2: "Browse AED 2M+ properties",
    breadcrumbs: { home: "Home", gv: "Golden Visa" },
  },
  ru: {
    eyebrow: "Golden Visa",
    whatHeading: "Что даёт путь от AED 2M",
    notHeading: "Чего он не даёт",
    docsHeading: "Документы и практический путь",
    genericHeading: "Полный процесс по шагам",
    genericBody: "Пороги, пятишаговая подача, продление и общий FAQ — в основном гиде по Golden Visa. Эта страница о том, что отличается для граждан страны",
    genericCta: "Открыть полный гид по Golden Visa",
    citizenHeading: "Покупка квалифицирующего объекта",
    citizenBody: "Права собственности, финансирование, налоги на родине и перевод средств разобраны в гиде покупателя по гражданству:",
    citizenCta: "Открыть гид покупателя для страны",
    areasHeading: "Районы, где AED 2M достаточно",
    areasCta: "Смотреть недвижимость в районе",
    ctaTitle: "Хотите проверить, подходите ли вы?",
    ctaDesc: "Наши сертифицированные RERA агенты структурируют покупку так, чтобы чисто закрыть порог AED 2M, включая рассрочки на строящиеся объекты. Без обязательств.",
    ctaBtn: "Связаться с командой",
    ctaBtn2: "Объекты от AED 2M",
    breadcrumbs: { home: "Главная", gv: "Golden Visa" },
  },
  ar: {
    eyebrow: "الإقامة الذهبية",
    whatHeading: "ما يمنحه مسار الـ AED 2M",
    notHeading: "ما لا يمنحه",
    docsHeading: "المستندات والمسار العملي",
    genericHeading: "العملية الكاملة خطوة بخطوة",
    genericBody: "الحدود، وخطوات التقديم الخمس، والتجديد، والأسئلة الشائعة العامة موجودة في دليل الإقامة الذهبية الرئيسي. وتتناول هذه الصفحة ما يختلف بالنسبة لـ",
    genericCta: "اقرأ دليل الإقامة الذهبية الكامل",
    citizenHeading: "شراء العقار المؤهِّل",
    citizenBody: "حقوق التملك والتمويل والضرائب في بلد الإقامة وتحويل الأموال مشروحة في دليل المشتري حسب الجنسية:",
    citizenCta: "اقرأ دليل المشتري الخاص بـ",
    areasHeading: "مجتمعات يكفي فيها مبلغ AED 2M",
    areasCta: "تصفّح العقارات في",
    ctaTitle: "تريد التأكد من أهليتك؟",
    ctaDesc: "يهيكل وكلاؤنا المعتمدون من RERA عمليات الشراء لبلوغ حد AED 2M بوضوح، بما في ذلك خطط السداد على الخارطة. دون أي التزام.",
    ctaBtn: "تحدّث إلى فريقنا",
    ctaBtn2: "عقارات بـ AED 2M فأكثر",
    breadcrumbs: { home: "الرئيسية", gv: "الإقامة الذهبية" },
  },
  zh: {
    eyebrow: "黄金签证",
    whatHeading: "AED 2M 路径能带来什么",
    notHeading: "它不能带来什么",
    docsHeading: "文件与实际路径",
    genericHeading: "完整流程，逐步说明",
    genericBody: "门槛、五步申请、续签与通用常见问题，均在黄金签证主指南中。本页只讲对以下人群而言有何不同：",
    genericCta: "阅读完整黄金签证指南",
    citizenHeading: "购买符合条件的房产",
    citizenBody: "产权、融资、母国税务与资金调动，均在按国籍的买家指南中说明：",
    citizenCta: "阅读买家指南：",
    areasHeading: "AED 2M 可以买到的社区",
    areasCta: "浏览该区域房源：",
    ctaTitle: "想确认您是否符合条件？",
    ctaDesc: "我们持有 RERA 认证的顾问会把购房结构安排妥当，干净地达到 AED 2M 门槛，包括期房付款计划。无任何义务。",
    ctaBtn: "联系我们的团队",
    ctaBtn2: "浏览 AED 2M 以上房源",
    breadcrumbs: { home: "首页", gv: "黄金签证" },
  },
  vi: {
    eyebrow: "Golden Visa",
    whatHeading: "Lộ trình AED 2M mang lại gì",
    notHeading: "Điều nó không mang lại",
    docsHeading: "Giấy tờ và lộ trình thực tế",
    genericHeading: "Toàn bộ quy trình, từng bước",
    genericBody: "Ngưỡng, quy trình nộp năm bước, gia hạn và phần hỏi đáp chung nằm ở hướng dẫn Golden Visa chính. Trang này chỉ nói điều khác biệt với",
    genericCta: "Đọc hướng dẫn Golden Visa đầy đủ",
    citizenHeading: "Mua bất động sản đủ điều kiện",
    citizenBody: "Quyền sở hữu, tài chính, thuế tại quê nhà và chuyển tiền được trình bày ở hướng dẫn người mua theo quốc tịch:",
    citizenCta: "Đọc hướng dẫn người mua cho",
    areasHeading: "Những cộng đồng mà AED 2M mua được",
    areasCta: "Xem bất động sản tại",
    ctaTitle: "Muốn kiểm tra xem bạn có đủ điều kiện?",
    ctaDesc: "Các chuyên viên được RERA chứng nhận của chúng tôi sắp xếp giao dịch để đạt ngưỡng AED 2M một cách rõ ràng, kể cả qua kế hoạch thanh toán. Không ràng buộc.",
    ctaBtn: "Trao đổi với đội ngũ",
    ctaBtn2: "Xem bất động sản từ AED 2M",
    breadcrumbs: { home: "Trang chủ", gv: "Golden Visa" },
  },
  he: {
    eyebrow: "ויזת זהב",
    whatHeading: "מה מסלול ה-AED 2M מעניק",
    notHeading: "מה הוא אינו מעניק",
    docsHeading: "מסמכים והמסלול המעשי",
    genericHeading: "התהליך המלא, שלב אחר שלב",
    genericBody: "הספים, חמשת שלבי הבקשה, החידוש והשאלות הנפוצות הכלליות נמצאים במדריך ויזת הזהב הראשי. העמוד הזה עוסק רק במה ששונה עבור",
    genericCta: "לקריאת מדריך ויזת הזהב המלא",
    citizenHeading: "רכישת הנכס המזכה",
    citizenBody: "זכויות בעלות, מימון, מיסוי בארץ המוצא והעברת כספים מפורטים במדריך הרוכש לפי אזרחות:",
    citizenCta: "לקריאת מדריך הרוכש עבור",
    areasHeading: "שכונות שבהן AED 2M מספיק",
    areasCta: "עיון בנכסים ב",
    ctaTitle: "רוצים לבדוק אם אתם עומדים בתנאים?",
    ctaDesc: "הסוכנים שלנו המוסמכים מטעם RERA בונים את הרכישה כך שתעמוד בסף AED 2M באופן נקי, כולל תוכניות תשלומים על הנייר. ללא התחייבות.",
    ctaBtn: "לשיחה עם הצוות",
    ctaBtn2: "נכסים מעל AED 2M",
    breadcrumbs: { home: "דף הבית", gv: "ויזת זהב" },
  },
  fr: {
    eyebrow: "Golden Visa",
    whatHeading: "Ce que la voie à 2 M AED accorde",
    notHeading: "Ce qu'elle n'accorde pas",
    docsHeading: "Documents et parcours pratique",
    genericHeading: "Le processus complet, étape par étape",
    genericBody: "Les seuils, la demande en cinq étapes, le renouvellement et la FAQ générale figurent dans le guide principal du Golden Visa. Cette page ne traite que ce qui diffère pour",
    genericCta: "Lire le guide complet du Golden Visa",
    citizenHeading: "Acquérir le bien éligible",
    citizenBody: "Droits de propriété, financement, fiscalité dans le pays d'origine et transfert des fonds sont traités dans le guide acheteur par nationalité :",
    citizenCta: "Lire le guide acheteur pour",
    areasHeading: "Communautés accessibles à 2 M AED",
    areasCta: "Voir les biens à",
    ctaTitle: "Vous voulez vérifier votre éligibilité ?",
    ctaDesc: "Nos conseillers certifiés RERA structurent l'acquisition pour atteindre proprement le seuil de 2 M AED, échéanciers sur plan inclus. Sans engagement.",
    ctaBtn: "Parler à notre équipe",
    ctaBtn2: "Voir les biens à 2 M AED et +",
    breadcrumbs: { home: "Accueil", gv: "Golden Visa" },
  },
} as const;

type Locale = keyof typeof CONTENT;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; nationality: string }>;
}): Promise<Metadata> {
  const { locale, nationality } = await params;
  const g = findGoldenVisaNationality(nationality);
  if (!g) return {};
  const path = `/golden-visa/${g.slug}`;
  const title = localizeBuyerText(g.metaTitle, locale);
  const description = localizeBuyerText(g.metaDesc, locale);
  return {
    title,
    description,
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: {
      title,
      description,
      type: "article",
      url: makeCanonical(locale, path),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
  };
}

export default async function GoldenVisaNationalityPage({
  params,
}: {
  params: Promise<{ locale: string; nationality: string }>;
}) {
  const { locale, nationality } = await params;
  const g = findGoldenVisaNationality(nationality);
  if (!g) notFound();

  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const buyer = findForeignBuyer(g.citizenSlug);

  const path = `/golden-visa/${g.slug}`;
  const breadcrumbs = [
    { name: c.breadcrumbs.home, href: `${lp}/` },
    { name: c.breadcrumbs.gv, href: `${lp}/golden-visa` },
    { name: localizeBuyerText(g.h1, locale), href: `${lp}${path}` },
  ];

  const sections = [
    { heading: c.whatHeading, body: localizeBuyerText(g.whatItIs, locale) },
    { heading: c.notHeading, body: localizeBuyerText(g.whatItIsNot, locale) },
    { heading: c.docsHeading, body: localizeBuyerText(g.documents, locale) },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-24 space-y-12 sm:space-y-16">
        <section>
          <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">
            {c.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            <span className="text-3xl sm:text-4xl me-2" aria-hidden="true">{g.flag}</span>
            {localizeBuyerText(g.h1, locale)}
          </h1>
        </section>

        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{s.heading}</h2>
            <p className="text-base text-foreground/80 leading-relaxed">{s.body}</p>
          </section>
        ))}

        {/* Point at the generic guide rather than restating the process, so
            these pages do not compete with /golden-visa for the same query. */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            {c.genericHeading}
          </h2>
          <p className="text-sm sm:text-base text-foreground/75 leading-relaxed mb-5">
            {c.genericBody} {g.demonym}.
          </p>
          <Link
            href={`${lp}/golden-visa`}
            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
          >
            {c.genericCta}
          </Link>
        </section>

        {buyer && (
          <section className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              {c.citizenHeading}
            </h2>
            <p className="text-sm sm:text-base text-foreground/75 leading-relaxed mb-5">
              {c.citizenBody}
            </p>
            <Link
              href={`${lp}/buying-property-in-dubai-as/${buyer.slug}`}
              className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
            >
              <span aria-hidden="true">{buyer.flag}</span>
              {c.citizenCta} {buyer.citizen}
            </Link>
          </section>
        )}

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">{c.areasHeading}</h2>
          <div className="flex flex-wrap gap-3">
            {g.areas.flatMap((area) => {
              const slug = AREA_COMMUNITY_SLUGS[area];
              if (!slug) return [];
              return [
                <Link
                  key={slug}
                  href={`${lp}/buy-property-in/${slug}`}
                  className="bg-card border border-border/50 rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:border-accent/60 hover:text-accent transition-colors"
                >
                  {c.areasCta} {area}
                </Link>,
              ];
            })}
          </div>
        </section>

        <section
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{c.ctaTitle}</h2>
            <p className="text-white/75 text-sm sm:text-base mb-7 max-w-lg mx-auto">{c.ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`${lp}/contact`}
                className="font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}
              >
                {c.ctaBtn}
              </Link>
              <Link
                href={`${lp}/buy`}
                className="border-2 border-white/30 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                {c.ctaBtn2}
              </Link>
              <a
                href={waHref(WA_DEFAULT_MESSAGE, path)}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/20 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
