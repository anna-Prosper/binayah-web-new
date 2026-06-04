/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CONTENT = {
  en: {
    metaTitle: "Off-Plan Properties in Dubai 2026 | New Launches | Binayah",
    metaDesc: "Browse 3,000+ off-plan properties in Dubai. New project launches from Emaar, DAMAC, Sobha, Aldar. Flexible payment plans, high ROI. Expert guidance.",
    heroLabel: "OFF-PLAN DUBAI",
    h1: "Off-Plan Properties in Dubai",
    heroDesc: "Discover Dubai's best new-launch off-plan projects. Flexible payment plans, developer guarantees, and potential 15–30% capital appreciation before handover.",
    faqs: [
      { question: "What is an off-plan property in Dubai?", answer: "Off-plan means buying a property before it is built or during construction. You pay a portion upfront (typically 10–20%) with the rest due in instalments during construction or after handover. Off-plan properties are often 15–30% cheaper than ready units in the same building." },
      { question: "What are the risks of buying off-plan in Dubai?", answer: "Main risks include project delays and (rarely) developer insolvency. Dubai's RERA regulates escrow accounts — developer funds are held in ring-fenced accounts until construction milestones are met. Choose RERA-registered projects and experienced developers with a track record." },
      { question: "Can I sell an off-plan property before handover?", answer: "Yes. Once you have paid a minimum of 30–40% of the property value, most developers allow resale on the secondary market. This is called 'flipping' and can generate 10–30% profit in a rising market before you ever receive the keys." },
      { question: "Which developers have the best off-plan projects in Dubai?", answer: "Top developers include Emaar (Downtown, Dubai Creek Harbour), DAMAC (Cavalli, Lagoons), Sobha Realty (Hartland II), Aldar (Yas Island), Nakheel (Palm Jumeirah), and Mag (MBR City). Each has different price points, locations, and payment structures." },
      { question: "What payment plans do off-plan developers offer?", answer: "Typical structures: 10% on booking + 10% on SPA + 30% during construction + 50% on handover. Some developers offer post-handover payment plans (e.g. 40% during construction + 60% over 3 years after handover). Zero-interest plans are also available from selected developers." },
      { question: "Is off-plan better than ready property in Dubai?", answer: "Off-plan offers lower entry price, capital appreciation potential, and flexible payment plans — but you wait 2–4 years for the keys. Ready properties provide immediate rental income, are easier to mortgage, and have no completion risk. The right choice depends on your investment horizon and cash flow needs." },
    ],
    breadcrumb: "Off-Plan",
    searchTitle: "Browse Off-Plan Projects",
  },
  ru: {
    metaTitle: "Новостройки в Дубае 2026 | Новые проекты | Binayah Properties",
    metaDesc: "Более 3000 объектов off-plan в Дубае. Новые проекты от Emaar, DAMAC, Sobha, Aldar. Гибкие планы рассрочки, высокий ROI.",
    heroLabel: "НОВОСТРОЙКИ ДУБАЙ",
    h1: "Новостройки и объекты Off-Plan в Дубае",
    heroDesc: "Откройте для себя лучшие новостройки Дубая: гибкие планы рассрочки, гарантии застройщика и потенциальный рост стоимости на 15–30% до сдачи.",
    faqs: [
      { question: "Что такое объект off-plan в Дубае?", answer: "Off-plan — покупка объекта до или в процессе строительства. Обычно 10–20% вносится сразу, остаток — в рассрочку в ходе строительства или после сдачи. Off-plan объекты нередко на 15–30% дешевле готовых аналогов." },
      { question: "Каковы риски покупки off-plan в Дубае?", answer: "Основные риски: задержки строительства и (редко) банкротство застройщика. RERA Дубая регулирует эскроу-счета — средства покупателей хранятся отдельно до достижения строительных этапов. Выбирайте проекты, зарегистрированные RERA, и застройщиков с подтверждённым опытом." },
      { question: "Можно ли продать off-plan объект до сдачи?", answer: "Да. После оплаты минимум 30–40% стоимости большинство застройщиков разрешают перепродажу на вторичном рынке. Это может принести прибыль 10–30% ещё до получения ключей." },
      { question: "Какие крупнейшие застройщики в Дубае?", answer: "Ведущие застройщики: Emaar (Даунтаун, Дубай Крик Харбор), DAMAC (Cavalli, Lagoons), Sobha Realty (Hartland II), Aldar (о-в Яс), Nakheel (Пальма Джумейра), Mag (MBR City)." },
      { question: "Какие планы рассрочки предлагают застройщики?", answer: "Типичная структура: 10% при бронировании + 10% при SPA + 30% в ходе строительства + 50% при сдаче. Некоторые предлагают пост-хандоверные планы (оплата после получения ключей). Также доступны беспроцентные рассрочки." },
      { question: "Что выгоднее — новостройка или готовый объект?", answer: "Off-plan предлагает более низкую цену входа, потенциальный рост стоимости и гибкие платежи — но придётся ждать 2–4 года. Готовые объекты дают немедленный доход от аренды и проще в получении ипотеки." },
    ],
    breadcrumb: "Новостройки",
    searchTitle: "Найти объекты Off-Plan",
  },
  ar: {
    metaTitle: "العقارات على الخارطة في دبي 2026 | مشاريع جديدة | بناية",
    metaDesc: "أكثر من 3000 عقار على الخارطة في دبي. إطلاقات جديدة من إعمار وداماك وسوبها والدار. خطط سداد مرنة وعائد مرتفع.",
    heroLabel: "على الخارطة في دبي",
    h1: "العقارات على الخارطة في دبي",
    heroDesc: "اكتشف أفضل مشاريع دبي على الخارطة: خطط سداد مرنة وضمانات المطوّر وإمكانية ارتفاع القيمة 15-30% قبل التسليم.",
    faqs: [
      { question: "ما المقصود بالعقار على الخارطة في دبي؟", answer: "العقار على الخارطة هو شراء وحدة قبل اكتمال بنائها. تُدفع عادةً 10-20% مقدمًا والباقي بالتقسيط خلال البناء أو بعد التسليم. غالبًا أرخص 15-30% من الوحدات الجاهزة." },
      { question: "ما مخاطر الشراء على الخارطة في دبي؟", answer: "المخاطر الرئيسية: التأخير في التسليم وإفلاس المطوّر (نادر). تُنظّم RERA حسابات الضمان لحماية الأموال. اختر مشاريع مسجَّلة في RERA ومطوّرين ذوي سجل حافل." },
      { question: "هل يمكن بيع وحدة على الخارطة قبل التسليم؟", answer: "نعم. بعد دفع 30-40% من قيمة العقار، يسمح معظم المطوّرين بإعادة البيع. قد يُدرّ ربحًا 10-30% في السوق المتنامي قبل استلام المفاتيح." },
      { question: "ما أبرز المطوّرين في دبي؟", answer: "إعمار (وسط المدينة، دبي كريك هاربر)، داماك (كافالي، لاغونز)، سوبها ريلتي (هارتلاند II)، الدار (جزيرة ياس)، نخيل (نخلة جميرا)، ماغ (مدينة محمد بن راشد)." },
      { question: "ما خطط الدفع المتاحة للشراء على الخارطة؟", answer: "نموذج شائع: 10% عند الحجز + 10% عند توقيع SPA + 30% أثناء البناء + 50% عند التسليم. بعض المطوّرين يُقدّمون خطط دفع ما بعد التسليم وتمويلًا بدون فوائد." },
    ],
    breadcrumb: "على الخارطة",
    searchTitle: "استعرض المشاريع على الخارطة",
  },
  zh: {
    metaTitle: "迪拜期房项目2026 | 新楼盘 | Binayah Properties",
    metaDesc: "浏览3000多套迪拜期房。Emaar、DAMAC、Sobha、Aldar新项目发布。灵活付款计划，高回报率。",
    heroLabel: "迪拜期房",
    h1: "迪拜期房项目",
    heroDesc: "探索迪拜最佳新楼盘：灵活付款计划、开发商保障，以及交房前15-30%的潜在资本增值。",
    faqs: [
      { question: "什么是迪拜期房？", answer: "期房是指在建筑建成前购买的房产。通常预付10-20%，其余在施工期间或交付后分期支付。期房通常比同楼现房便宜15-30%。" },
      { question: "购买迪拜期房有什么风险？", answer: "主要风险包括工程延期和（极少情况下的）开发商破产。迪拜RERA监管托管账户，在建设里程碑完成前资金单独保管。选择RERA注册项目和有记录的知名开发商。" },
      { question: "交房前可以出售期房吗？", answer: "可以。在支付最低30-40%房款后，大多数开发商允许在二手市场转售。在上升市场中，可在拿到钥匙之前获得10-30%的利润。" },
      { question: "迪拜有哪些顶级开发商？", answer: "主要开发商：Emaar（市中心、迪拜溪港）、DAMAC（Cavalli、Lagoons）、Sobha Realty（Hartland II）、Aldar（雅斯岛）、Nakheel（棕榈岛）、Mag（MBR城）。" },
      { question: "期房付款计划是怎样的？", answer: "典型结构：预订时10% + 签约时10% + 施工期间30% + 交房时50%。部分开发商提供交房后付款计划（交房后3年内支付60%）以及零息分期计划。" },
    ],
    breadcrumb: "期房",
    searchTitle: "浏览期房项目",
  },
} as const;

type Locale = keyof typeof CONTENT;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/off-plan");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: { canonical: url, languages: altLangs("/off-plan") },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      url,
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    keywords: locale === "ru"
      ? ["новостройки дубай", "купить новостройку дубай", "off-plan дубай 2026", "инвестиции новостройки дубай"]
      : locale === "ar"
      ? ["عقارات على الخارطة دبي", "مشاريع على الخارطة دبي 2026", "استثمار على الخارطة دبي"]
      : locale === "zh"
      ? ["迪拜期房", "迪拜新楼盘2026", "迪拜期房投资", "迪拜开发商楼盘"]
      : ["off-plan properties dubai", "off-plan dubai 2026", "new launch dubai", "dubai off plan investment", "buy off plan dubai"],
  };
}

export default async function OffPlanPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const isRtl = locale === "ar";
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : "Home", href: `${lp}/` },
    { name: c.breadcrumb, href: `${lp}/off-plan` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={c.faqs.map(f => ({ question: f.question, answer: f.answer }))} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-28 pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3">{c.heroLabel}</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{c.h1}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{c.heroDesc}</p>
        </div>
      </section>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SearchPageClient defaultStatus="Off-Plan" defaultIntent="off-plan" />
      </div>

      {/* FAQ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="text-center mb-10">
          <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
          <h2 className="text-3xl font-bold text-foreground">
            {locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : "Off-Plan FAQs"}
          </h2>
        </div>
        <div className="space-y-3">
          {c.faqs.map((faq, i) => (
            <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors text-sm sm:text-base">
                <span>{faq.question}</span>
                <span className="text-accent text-xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
