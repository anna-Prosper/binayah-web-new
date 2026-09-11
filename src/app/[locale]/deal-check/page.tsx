/* eslint-disable i18next/no-literal-string -- per-locale copy lives in the CONTENT maps below, matching the /valuation page pattern */
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DealCheckClient from "@/components/deal-check/DealCheckClient";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = "/deal-check";

const titles: Record<string, string> = {
  en: "Deal Check — Is That Dubai Property Priced Right? | Binayah",
  ru: "Deal Check — Справедлива ли цена на эту недвижимость в Дубае? | Binayah",
  ar: "فحص الصفقة — هل سعر هذا العقار في دبي مناسب؟ | بناية",
  zh: "Deal Check — 迪拜这套房产定价合理吗？| Binayah",
  fr: "Deal Check — Ce bien à Dubaï est-il au bon prix ? | Binayah",
  vi: "Deal Check — Bất động sản Dubai này có đúng giá? | Binayah",
  he: "Deal Check — האם הנכס הזה בדובאי מתומחר נכון? | Binayah",
};

const descriptions: Record<string, string> = {
  en: "Send any Dubai property — a link, screenshot or brochure, from any agency. Get the price checked against DLD-registered sales, the real cash required, and the questions to ask. Free.",
  ru: "Отправьте любой объект в Дубае — ссылку, скриншот или брошюру от любого агентства. Проверим цену по зарегистрированным сделкам DLD, посчитаем реальные затраты и подскажем вопросы. Бесплатно.",
  ar: "أرسل أي عقار في دبي — رابط أو لقطة شاشة أو كتيب من أي وكالة. نقارن السعر بصفقات دائرة الأراضي المسجلة، ونحسب النقد المطلوب فعلياً، ونحدد الأسئلة المهمة. مجاناً.",
  zh: "发送任何迪拜房产——链接、截图或任何中介的宣传册。我们对照迪拜土地局登记交易核查价格、计算实际所需现金，并列出应问的问题。免费。",
  fr: "Envoyez n'importe quel bien à Dubaï — lien, capture ou brochure, de n'importe quelle agence. Prix vérifié face aux ventes enregistrées au DLD, trésorerie réelle nécessaire et questions à poser. Gratuit.",
  vi: "Gửi bất kỳ bất động sản Dubai nào — liên kết, ảnh chụp hoặc tài liệu từ bất kỳ đại lý nào. Kiểm tra giá so với giao dịch đã đăng ký DLD, tiền mặt thực tế cần có và câu hỏi nên hỏi. Miễn phí.",
  he: "שלחו כל נכס בדובאי — קישור, צילום מסך או חוברת מכל סוכנות. נבדוק את המחיר מול עסקאות רשומות ב-DLD, נחשב את המזומן הנדרש באמת ונציע שאלות לשאול. חינם.",
};

/** Supporting guides. Kept here so the tool page and the guides cross-link. */
const RELATED_GUIDES = [
  {
    slug: "true-cost-buying-property-dubai",
    en: "The True Cost of Buying Property in Dubai",
    blurb: "Every fee, with real figures — and the 2025 rule that stopped buyers financing them.",
  },
  {
    slug: "how-to-tell-if-dubai-property-overpriced",
    en: "How to Tell If a Dubai Property Is Overpriced",
    blurb: "The method we use: price per square foot against registered sales, not asking prices.",
  },
  {
    slug: "questions-to-ask-before-buying-dubai-property",
    en: "17 Questions to Ask Before You Buy",
    blurb: "What listings leave out — service charges, tenancy, escrow and handover terms.",
  },
];

const FAQS: Record<string, { question: string; answer: string }[]> = {
  en: [
    {
      question: "Does the property have to be a Binayah listing?",
      answer:
        "No. Deal Check works on any Dubai property from any source — another agency's listing, a portal link, a developer brochure, or a screenshot someone sent you on WhatsApp. That is the point of it: you should be able to get a straight answer about a property regardless of who is selling it.",
    },
    {
      question: "Where do the price comparisons come from?",
      answer:
        "From sale transactions registered with the Dubai Land Department — actual recorded sales, not asking prices. We match your property to the same community, property type and bedroom count, and show you the sample size so you can judge how much weight the comparison carries. Where the sample is small, we say so rather than presenting a confident-looking number.",
    },
    {
      question: "Can I check a rental listing too?",
      answer:
        "Yes. If you send a rental, Deal Check compares the asking rent against the median of tenancy contracts registered with Ejari for that area, per square foot, and shows the sample size. It also estimates what buying the same unit would cost and the gross yield that implies, so you can weigh renting against buying.",
    },
    {
      question: "How accurate are the service charge figures?",
      answer:
        "They are estimates, and we label them as such. Dubai publishes service charges per building through the DLD Mollak index, not per community, so there is no feed we can query for your specific tower. We use a community-level planning figure and tell you to check your actual building on the DLD service charge index. Service charges are the single biggest drag on net yield, so this is a number worth verifying rather than assuming.",
    },
    {
      question: "What does it cost, and what do you need from me?",
      answer:
        "The check is free. You see the verdict, the price against comparable registered sales, and the total cash required without giving us anything. The full cost breakdown, the rental economics, the questions to ask and the comparable properties need a name and a phone number, because an agent may follow up about the property.",
    },
    {
      question: "How do I know if a Dubai asking price is fair, and is there room to negotiate?",
      answer:
        "Compare the price per square foot against what comparable units in the same community actually sold for, not against other asking prices — asking prices anchor to each other and drift above the market together. Deal Check does that comparison for you and shows the sample size. A property more than 10% above comparable registered sales needs a concrete justification, such as a high floor, an unobstructed view or a recent full renovation. Without one, that gap is your negotiating room.",
    },
    {
      question: "What rental yield should I expect in Dubai?",
      answer:
        "Gross rental yields in Dubai typically run from around 4% in prime waterfront communities to 7-8% in higher-yielding areas like Jumeirah Village Circle. Net yield is the figure that matters, and it lands well below the gross once the service charge, vacancy, management, maintenance and the 5% municipality housing fee come out. Deal Check models the net figure and shows every deduction, so you can see where the gap goes.",
    },
    {
      question: "Can I use this instead of a valuation?",
      answer:
        "No. This is market information to help you ask better questions and spot things worth checking. It is not a valuation and not financial advice. Banks require a RICS-certified or bank-approved valuer for mortgage purposes, and anything with legal consequences needs a professional appraisal.",
    },
    {
      question: "What does 'total cash required' include?",
      answer:
        "The purchase price or deposit, the 4% DLD transfer fee, DLD admin and title deed charges, the trustee office fee, agency commission where it applies, the developer NOC, and — if you're financing — mortgage registration, the bank's arrangement fee and its valuation. Since February 2025 the DLD fee and agency commission can no longer be added to a mortgage, so those must be paid in cash. On a ready purchase the total typically lands around 7% of the price.",
    },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = titles[locale] ?? titles.en;
  const description = descriptions[locale] ?? descriptions.en;

  return {
    title,
    description,
    keywords: [
      "Dubai property price check",
      "is this Dubai property overpriced",
      "DLD transaction data",
      "Dubai property purchase costs",
      "Dubai rental yield calculator",
      "Dubai service charges",
    ],
    alternates: { canonical: canonical(locale, PATH), languages: altLangs(PATH) },
    openGraph: {
      title,
      description,
      url: canonical(locale, PATH),
      siteName: "Binayah",
      locale: OG_LOCALE[locale] ?? "en_AE",
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Binayah Deal Check" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function DealCheckPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dealCheck");

  const faqs = FAQS[locale] ?? FAQS.en;
  const lp = locale === "en" ? "" : `/${locale}`;

  // SoftwareApplication schema: this is a tool, not an article, and marking it
  // as one is what earns the richer result for "dubai property price check".
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Binayah Deal Check",
    url: `${SITE_URL}${lp}${PATH}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    description: descriptions[locale] ?? descriptions.en,
    offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
    provider: { "@type": "RealEstateAgent", name: "Binayah Properties", url: SITE_URL },
    featureList: [
      "Price against DLD-registered comparable sales",
      "Total cash required including all purchase costs",
      "Rental economics with assumptions shown",
      "Diligence questions specific to the property",
      "Comparable alternatives",
    ],
  };

  return (
    <>
      <Navbar />

      <main className="bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-14">
          {/* Soft brand wash — subtle, doesn't compete with the tool */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgba(212,168,71,0.10) 0%, rgba(212,168,71,0) 70%)",
            }}
          />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="h-[2px] w-12 bg-accent mx-auto mb-5 sm:mb-6" />
            <p className="text-accent font-semibold tracking-[0.35em] sm:tracking-[0.4em] uppercase text-[10px] sm:text-xs mb-3 sm:mb-4">
              {t("eyebrow")}
            </p>
            <h1 className="text-[28px] leading-tight sm:text-4xl lg:text-5xl font-bold text-foreground">
              {t("heroTitle")} <span className="font-light">{t("heroTitleLight")}</span>
            </h1>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>

            {/* Trust row */}
            <ul className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {[
                { icon: Zap, label: t("trustFree") },
                { icon: ShieldCheck, label: t("trustNoSignup") },
                { icon: BadgeCheck, label: t("trustDld") },
                { icon: Sparkles, label: t("trustAnyAgency") },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-accent" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tool */}
        <section className="pb-14 sm:pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <DealCheckClient />
          </div>
        </section>

        {/* What you get */}
        <section className="py-14 sm:py-16 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
              {t("whatYouGet")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { t: t("wyg1Title"), d: t("wyg1Desc") },
                { t: t("wyg2Title"), d: t("wyg2Desc") },
                { t: t("wyg3Title"), d: t("wyg3Desc") },
                { t: t("wyg4Title"), d: t("wyg4Desc") },
              ].map((f) => (
                <div key={f.t} className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2">{f.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related guides — internal links both ways */}
        <section className="py-14 sm:py-16 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
              {t("relatedTitle")}
            </h2>
            <ul className="grid sm:grid-cols-3 gap-3 sm:gap-4">
              {RELATED_GUIDES.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/pulse/guides/${g.slug}`}
                    className="group flex h-full flex-col p-4 sm:p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-accent/40 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                      {g.en}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">{g.blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                      Read
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 sm:py-16 border-t border-border/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
              {t("faqTitle")}
            </h2>
            <div className="space-y-2.5 sm:space-y-3">
              {faqs.map((f) => (
                <details key={f.question} className="group rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-sm">
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none text-sm font-medium text-foreground">
                    {f.question}
                    <span className="text-accent shrink-0 transition-transform group-open:rotate-45 text-lg leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <FAQJsonLd faqs={faqs} inLanguage={locale} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: locale === "en" ? "/" : `/${locale}` },
          { name: "Deal Check", href: `${lp}${PATH}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(appSchema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
