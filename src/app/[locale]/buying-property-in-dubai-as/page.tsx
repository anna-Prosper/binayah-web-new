/* eslint-disable i18next/no-literal-string -- multilingual SEO hub page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { FOREIGN_BUYERS, localizeBuyerText } from "@/lib/foreign-buyers";
import { canonical as makeCanonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";

export const revalidate = 86400;

const PATH = "/buying-property-in-dubai-as";

export function generateStaticParams() {
  return ["en", "ar", "zh", "ru", "vi", "he", "fr"].map((locale) => ({ locale }));
}

// ── Locale-aware UI copy ───────────────────────────────────────────────────
// The nationality profiles themselves are localized in FOREIGN_BUYERS; only the
// hub's own chrome lives here.
const CONTENT = {
  en: {
    title: "Buying Property in Dubai by Nationality | Country Guides",
    description:
      "Country-by-country guides to buying Dubai property: ownership rights, financing, tax at home, and repatriating funds. Written for buyers from each market.",
    heroLabel: "Foreign buyer guides",
    h1: "Buying property in Dubai, by nationality",
    intro:
      "Foreign nationals of every country can own freehold property in Dubai's designated zones. What changes from one passport to the next is not the right to buy — it is the financing route, the tax treatment back home, and how funds move. Each guide below covers one market.",
    countGuides: "guides",
    pick: "Choose your country",
    notListedHeading: "Your country isn't listed?",
    notListedBody:
      "The purchase process is the same for every nationality. Message us and we'll walk you through the parts specific to your market.",
    cta: "Talk to an adviser",
    browse: "Browse properties",
    breadcrumbs: { home: "Home", guides: "Guides", hub: "By nationality" },
  },
  ru: {
    title: "Покупка недвижимости в Дубае по гражданству | Гид по странам",
    description:
      "Гиды по покупке недвижимости в Дубае для разных стран: права собственности, финансирование, налоги на родине и вывод средств.",
    heroLabel: "Гиды для иностранных покупателей",
    h1: "Покупка недвижимости в Дубае — по гражданству",
    intro:
      "Граждане любой страны могут владеть недвижимостью в Дубае в полную собственность (freehold) в выделенных зонах. От паспорта зависит не право покупки, а способ финансирования, налоги на родине и порядок перевода средств. Каждый гид ниже посвящён одному рынку.",
    countGuides: "гидов",
    pick: "Выберите страну",
    notListedHeading: "Вашей страны нет в списке?",
    notListedBody:
      "Процесс покупки одинаков для всех гражданств. Напишите нам, и мы разберём детали, специфичные для вашего рынка.",
    cta: "Связаться с консультантом",
    browse: "Смотреть объекты",
    breadcrumbs: { home: "Главная", guides: "Гиды", hub: "По гражданству" },
  },
  ar: {
    title: "شراء عقار في دبي حسب الجنسية | أدلة حسب الدولة",
    description:
      "أدلة لشراء العقارات في دبي حسب الدولة: حقوق التملك، والتمويل، والضرائب في بلد الإقامة، وتحويل الأموال.",
    heroLabel: "أدلة المشتري الأجنبي",
    h1: "شراء عقار في دبي حسب الجنسية",
    intro:
      "يمكن لمواطني جميع الدول التملّك الحر (freehold) في المناطق المخصصة في دبي. ما يختلف من جواز سفر لآخر ليس حق الشراء، بل طريقة التمويل، والمعاملة الضريبية في بلد الإقامة، وكيفية تحويل الأموال. يغطي كل دليل أدناه سوقاً واحدة.",
    countGuides: "أدلة",
    pick: "اختر دولتك",
    notListedHeading: "دولتك غير مدرجة؟",
    notListedBody:
      "إجراءات الشراء واحدة لجميع الجنسيات. راسلنا وسنشرح لك التفاصيل الخاصة بسوقك.",
    cta: "تحدّث إلى مستشار",
    browse: "تصفّح العقارات",
    breadcrumbs: { home: "الرئيسية", guides: "الأدلة", hub: "حسب الجنسية" },
  },
  zh: {
    title: "按国籍看迪拜购房指南 | 各国专属指南",
    description: "按国家整理的迪拜购房指南：产权、融资方式、母国税务处理与资金汇回。",
    heroLabel: "外籍买家指南",
    h1: "按国籍看迪拜购房",
    intro:
      "任何国家的外籍人士都可以在迪拜指定区域拥有永久产权（freehold）房产。护照带来的差别不在于能否购买，而在于融资途径、母国税务处理，以及资金如何跨境流动。以下每份指南对应一个市场。",
    countGuides: "份指南",
    pick: "选择您的国家",
    notListedHeading: "没有找到您的国家？",
    notListedBody: "所有国籍的购房流程都相同。请联系我们，我们会为您说明您所在市场的具体事项。",
    cta: "咨询顾问",
    browse: "浏览房源",
    breadcrumbs: { home: "首页", guides: "指南", hub: "按国籍" },
  },
  vi: {
    title: "Mua bất động sản Dubai theo quốc tịch | Hướng dẫn theo quốc gia",
    description:
      "Hướng dẫn mua bất động sản Dubai theo từng quốc gia: quyền sở hữu, tài chính, thuế tại quê nhà và chuyển tiền về nước.",
    heroLabel: "Hướng dẫn cho người mua nước ngoài",
    h1: "Mua bất động sản Dubai theo quốc tịch",
    intro:
      "Công dân của mọi quốc gia đều có thể sở hữu bất động sản freehold tại các khu vực được chỉ định ở Dubai. Điều thay đổi theo từng hộ chiếu không phải là quyền mua, mà là cách thu xếp tài chính, nghĩa vụ thuế tại quê nhà và cách chuyển tiền. Mỗi hướng dẫn dưới đây dành cho một thị trường.",
    countGuides: "hướng dẫn",
    pick: "Chọn quốc gia của bạn",
    notListedHeading: "Không thấy quốc gia của bạn?",
    notListedBody:
      "Quy trình mua giống nhau với mọi quốc tịch. Hãy nhắn cho chúng tôi để được hướng dẫn phần riêng cho thị trường của bạn.",
    cta: "Trao đổi với chuyên viên",
    browse: "Xem bất động sản",
    breadcrumbs: { home: "Trang chủ", guides: "Hướng dẫn", hub: "Theo quốc tịch" },
  },
  he: {
    title: "רכישת נכס בדובאי לפי אזרחות | מדריכים לפי מדינה",
    description:
      "מדריכים לרכישת נכס בדובאי לפי מדינה: זכויות בעלות, מימון, מיסוי בארץ המוצא והעברת כספים.",
    heroLabel: "מדריכים לרוכשים זרים",
    h1: "רכישת נכס בדובאי, לפי אזרחות",
    intro:
      "אזרחים מכל מדינה יכולים להחזיק בבעלות מלאה (freehold) בנכס באזורים המיועדים בדובאי. מה שמשתנה בין דרכון לדרכון אינו הזכות לרכוש, אלא מסלול המימון, המיסוי בארץ המוצא, ואופן העברת הכספים. כל מדריך להלן עוסק בשוק אחד.",
    countGuides: "מדריכים",
    pick: "בחרו את המדינה שלכם",
    notListedHeading: "המדינה שלכם לא ברשימה?",
    notListedBody: "תהליך הרכישה זהה לכל האזרחויות. כתבו לנו ונעבור אתכם על מה שרלוונטי לשוק שלכם.",
    cta: "לשיחה עם יועץ",
    browse: "עיון בנכסים",
    breadcrumbs: { home: "דף הבית", guides: "מדריכים", hub: "לפי אזרחות" },
  },
  fr: {
    title: "Acheter un bien à Dubaï selon la nationalité | Guides par pays",
    description:
      "Guides pays par pays pour acheter à Dubaï : droits de propriété, financement, fiscalité dans le pays d'origine et rapatriement des fonds.",
    heroLabel: "Guides acheteurs étrangers",
    h1: "Acheter un bien à Dubaï, selon la nationalité",
    intro:
      "Les ressortissants de tous les pays peuvent détenir un bien en pleine propriété (freehold) dans les zones désignées de Dubaï. Ce qui change d'un passeport à l'autre n'est pas le droit d'acheter, mais le mode de financement, la fiscalité dans le pays d'origine et la circulation des fonds. Chaque guide ci-dessous traite d'un marché.",
    countGuides: "guides",
    pick: "Choisissez votre pays",
    notListedHeading: "Votre pays n'est pas listé ?",
    notListedBody:
      "Le processus d'achat est identique pour toutes les nationalités. Écrivez-nous et nous détaillerons les points propres à votre marché.",
    cta: "Parler à un conseiller",
    browse: "Voir les biens",
    breadcrumbs: { home: "Accueil", guides: "Guides", hub: "Par nationalité" },
  },
} as const;

type Locale = keyof typeof CONTENT;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: makeCanonical(locale, PATH),
      languages: altLangs(PATH),
    },
    openGraph: {
      title: c.title,
      description: c.description,
      type: "website",
      url: makeCanonical(locale, PATH),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
  };
}

export default async function ForeignBuyerHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = CONTENT[locale as Locale] ?? CONTENT.en;
  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;

  // Alphabetical by the English country label so the grid order is stable and
  // doesn't shuffle when new profiles are appended to FOREIGN_BUYERS.
  const buyers = [...FOREIGN_BUYERS].sort((a, b) => a.country.localeCompare(b.country));

  const breadcrumbs = [
    { name: c.breadcrumbs.home, href: `${lp}/` },
    { name: c.breadcrumbs.guides, href: `${lp}/pulse/guides` },
    { name: c.breadcrumbs.hub, href: `${lp}${PATH}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-accent mb-4">
            {c.heroLabel}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-tight mb-5">
            {c.h1}
          </h1>
          <p className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-3xl">
            {c.intro}
          </p>
          <p className="mt-4 text-xs sm:text-sm text-foreground/50">
            {buyers.length} {c.countGuides}
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">{c.pick}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {buyers.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`${lp}/buying-property-in-dubai-as/${b.slug}`}
                  className="group block h-full rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 sm:p-5 hover:border-accent/50 hover:bg-accent/[0.04] transition-colors"
                >
                  <span className="flex items-center gap-3 mb-2">
                    <span className="text-2xl leading-none" aria-hidden="true">{b.flag}</span>
                    <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-accent transition-colors">
                      {b.country}
                    </span>
                  </span>
                  {/* First sentence of the localized intro: enough to differentiate
                      the cards without duplicating the target page's opening. */}
                  <span className="block text-xs sm:text-sm text-foreground/60 leading-relaxed line-clamp-3">
                    {localizeBuyerText(b.intro, locale).split(". ")[0]}.
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-2xl border border-foreground/10 p-6 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            {c.notListedHeading}
          </h2>
          <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto mb-6 leading-relaxed">
            {c.notListedBody}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`${lp}/contact`}
              className="px-6 py-3 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {c.cta}
            </Link>
            <Link
              href={`${lp}/buy`}
              className="px-6 py-3 rounded-full border border-foreground/15 text-foreground text-sm font-medium hover:border-accent hover:text-accent transition-colors"
            >
              {c.browse}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
