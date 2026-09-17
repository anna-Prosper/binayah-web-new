/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waHref, WA_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { SOURCE_CITIES, findSourceCity } from "@/lib/source-cities";
import { findForeignBuyer, localizeBuyerText } from "@/lib/foreign-buyers";
import { canonical as makeCanonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";

export const revalidate = 86400;

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  return locales.flatMap((locale) =>
    SOURCE_CITIES.map((c) => ({ locale, city: c.slug }))
  );
}

// Display names in SourceCity.areas are labels, not slugs. Same trap as the
// citizen pages: naive slugification produced /buy-property-in/jvc and friends,
// none of which exist. Areas with no community entry are omitted, not linked.
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
    eyebrow: "Buying from abroad",
    remoteHeading: "Buying without being there",
    moneyHeading: "Getting the money to Dubai",
    managingHeading: "Owning it from",
    areasHeading: "Where buyers from",
    areasOutro: "tend to buy",
    areasCta: "Browse property in",
    citizenHeading: "The legal and tax position",
    citizenBody: "Ownership rights, financing, tax at home and repatriating funds are covered in full on the nationality guide:",
    citizenCta: "Read the guide for",
    ctaTitle: "Thinking about it from abroad?",
    ctaDesc: "Our RERA-certified agents work with remote buyers every week. We handle the search, video viewings, legal coordination and post-purchase management.",
    ctaBtn: "Talk to our team",
    ctaBtn2: "Browse properties",
    breadcrumbs: { home: "Home", guides: "Guides" },
  },
  ru: {
    eyebrow: "Покупка из-за рубежа",
    remoteHeading: "Покупка без личного присутствия",
    moneyHeading: "Как перевести деньги в Дубай",
    managingHeading: "Владение из города",
    areasHeading: "Где обычно покупают из города",
    areasOutro: "",
    areasCta: "Смотреть недвижимость в районе",
    citizenHeading: "Правовой и налоговый статус",
    citizenBody: "Права собственности, финансирование, налоги на родине и вывод средств полностью разобраны в гиде по гражданству:",
    citizenCta: "Открыть гид для страны",
    ctaTitle: "Рассматриваете покупку из-за рубежа?",
    ctaDesc: "Наши сертифицированные RERA агенты еженедельно работают с удалёнными покупателями. Мы берём на себя подбор, видеопросмотры, юридическое сопровождение и управление после покупки.",
    ctaBtn: "Связаться с командой",
    ctaBtn2: "Смотреть объекты",
    breadcrumbs: { home: "Главная", guides: "Гиды" },
  },
  ar: {
    eyebrow: "الشراء من الخارج",
    remoteHeading: "الشراء دون الحضور",
    moneyHeading: "إيصال الأموال إلى دبي",
    managingHeading: "التملّك من",
    areasHeading: "أين يشتري القادمون من",
    areasOutro: "عادةً",
    areasCta: "تصفّح العقارات في",
    citizenHeading: "الوضع القانوني والضريبي",
    citizenBody: "حقوق التملك والتمويل والضرائب في بلد الإقامة وتحويل الأموال مشروحة بالكامل في دليل الجنسية:",
    citizenCta: "اقرأ الدليل الخاص بـ",
    ctaTitle: "تفكّر في الأمر من الخارج؟",
    ctaDesc: "يعمل وكلاؤنا المعتمدون من RERA مع المشترين عن بُعد أسبوعياً. نتولى البحث والمعاينات بالفيديو والتنسيق القانوني والإدارة بعد الشراء.",
    ctaBtn: "تحدّث إلى فريقنا",
    ctaBtn2: "تصفّح العقارات",
    breadcrumbs: { home: "الرئيسية", guides: "الأدلة" },
  },
  zh: {
    eyebrow: "从境外购房",
    remoteHeading: "无需到场即可完成购买",
    moneyHeading: "如何把资金汇到迪拜",
    managingHeading: "远程持有，所在城市：",
    areasHeading: "来自以下城市的买家通常购买的区域：",
    areasOutro: "",
    areasCta: "浏览该区域房源：",
    citizenHeading: "法律与税务地位",
    citizenBody: "产权、融资、母国税务与资金汇回，均在国籍指南中完整说明：",
    citizenCta: "阅读该国指南：",
    ctaTitle: "正在境外考虑置业？",
    ctaDesc: "我们持有 RERA 认证的顾问每周都在服务远程买家。我们负责房源筛选、视频看房、法律协调与购后管理。",
    ctaBtn: "联系我们的团队",
    ctaBtn2: "浏览房源",
    breadcrumbs: { home: "首页", guides: "指南" },
  },
  vi: {
    eyebrow: "Mua từ nước ngoài",
    remoteHeading: "Mua mà không cần có mặt",
    moneyHeading: "Chuyển tiền tới Dubai",
    managingHeading: "Sở hữu từ",
    areasHeading: "Người mua từ",
    areasOutro: "thường chọn mua ở",
    areasCta: "Xem bất động sản tại",
    citizenHeading: "Vị thế pháp lý và thuế",
    citizenBody: "Quyền sở hữu, tài chính, thuế tại quê nhà và chuyển tiền về nước được trình bày đầy đủ ở hướng dẫn theo quốc tịch:",
    citizenCta: "Đọc hướng dẫn cho",
    ctaTitle: "Đang cân nhắc từ nước ngoài?",
    ctaDesc: "Các chuyên viên được RERA chứng nhận của chúng tôi làm việc với người mua từ xa mỗi tuần. Chúng tôi lo việc tìm kiếm, xem nhà qua video, phối hợp pháp lý và quản lý sau mua.",
    ctaBtn: "Trao đổi với đội ngũ",
    ctaBtn2: "Xem bất động sản",
    breadcrumbs: { home: "Trang chủ", guides: "Hướng dẫn" },
  },
  he: {
    eyebrow: "רכישה מחו\"ל",
    remoteHeading: "רכישה בלי להיות שם",
    moneyHeading: "העברת הכספים לדובאי",
    managingHeading: "בעלות מ",
    areasHeading: "היכן רוכשים מ",
    areasOutro: "נוטים לקנות",
    areasCta: "עיון בנכסים ב",
    citizenHeading: "המעמד המשפטי והמיסויי",
    citizenBody: "זכויות בעלות, מימון, מיסוי בארץ המוצא והעברת כספים מפורטים במלואם במדריך לפי אזרחות:",
    citizenCta: "לקריאת המדריך עבור",
    ctaTitle: "שוקלים את זה מחו\"ל?",
    ctaDesc: "הסוכנים שלנו המוסמכים מטעם RERA עובדים עם רוכשים מרחוק מדי שבוע. אנו מטפלים בחיפוש, בצפייה בווידאו, בתיאום המשפטי ובניהול שלאחר הרכישה.",
    ctaBtn: "לשיחה עם הצוות",
    ctaBtn2: "עיון בנכסים",
    breadcrumbs: { home: "דף הבית", guides: "מדריכים" },
  },
  fr: {
    eyebrow: "Acheter depuis l'étranger",
    remoteHeading: "Acheter sans être sur place",
    moneyHeading: "Acheminer les fonds vers Dubaï",
    managingHeading: "Être propriétaire depuis",
    areasHeading: "Où achètent les acquéreurs de",
    areasOutro: "",
    areasCta: "Voir les biens à",
    citizenHeading: "La situation juridique et fiscale",
    citizenBody: "Droits de propriété, financement, fiscalité dans le pays d'origine et rapatriement des fonds sont traités en détail dans le guide par nationalité :",
    citizenCta: "Lire le guide pour",
    ctaTitle: "Vous y réfléchissez depuis l'étranger ?",
    ctaDesc: "Nos conseillers certifiés RERA accompagnent chaque semaine des acheteurs à distance. Nous gérons la recherche, les visites vidéo, la coordination juridique et la gestion après acquisition.",
    ctaBtn: "Parler à notre équipe",
    ctaBtn2: "Voir les biens",
    breadcrumbs: { home: "Accueil", guides: "Guides" },
  },
} as const;

type Locale = keyof typeof CONTENT;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city } = await params;
  const c = findSourceCity(city);
  if (!c) return {};
  const path = `/buying-property-in-dubai-from/${c.slug}`;
  const title = localizeBuyerText(c.metaTitle, locale);
  const description = localizeBuyerText(c.metaDesc, locale);
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

export default async function SourceCityPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city } = await params;
  const sc = findSourceCity(city);
  if (!sc) notFound();

  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const buyer = findForeignBuyer(sc.citizenSlug);

  const path = `/buying-property-in-dubai-from/${sc.slug}`;
  const breadcrumbs = [
    { name: c.breadcrumbs.home, href: `${lp}/` },
    { name: c.breadcrumbs.guides, href: `${lp}/pulse/guides` },
    { name: localizeBuyerText(sc.h1, locale), href: `${lp}${path}` },
  ];

  const sections = [
    { heading: c.remoteHeading, body: localizeBuyerText(sc.remote, locale) },
    { heading: c.moneyHeading, body: localizeBuyerText(sc.money, locale) },
    { heading: `${c.managingHeading} ${sc.city}`, body: localizeBuyerText(sc.managing, locale) },
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-5">
            <span className="text-3xl sm:text-4xl me-2" aria-hidden="true">{sc.flag}</span>
            {localizeBuyerText(sc.h1, locale)}
          </h1>
          <p className="text-base text-foreground/80 leading-relaxed">
            {localizeBuyerText(sc.intro, locale)}
          </p>
        </section>

        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{s.heading}</h2>
            <p className="text-base text-foreground/80 leading-relaxed">{s.body}</p>
          </section>
        ))}

        {/* The nationality guide. These pages deliberately do not restate the
            legal and tax position; they point at the page that owns it. */}
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">
            {c.areasHeading} {sc.city} {c.areasOutro}
          </h2>
          <div className="flex flex-wrap gap-3">
            {sc.areas.flatMap((area) => {
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
            <p className="text-white/75 text-sm sm:text-base mb-7 max-w-lg mx-auto">
              {c.ctaDesc}
            </p>
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
