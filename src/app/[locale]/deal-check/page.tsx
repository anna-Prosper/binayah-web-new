/* eslint-disable i18next/no-literal-string -- landing copy is per-locale in the CONTENT map below, matching the /valuation pattern */
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DealCheckClient from "@/components/deal-check/DealCheckClient";

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = "/deal-check";

const titles: Record<string, string> = {
  en: "Binayah Deal Check | Is That Dubai Property Priced Right?",
  ru: "Binayah Deal Check | Проверка цены на недвижимость в Дубае",
  ar: "فحص الصفقة من بناية | هل سعر العقار في دبي مناسب؟",
  zh: "Binayah 交易检查 | 迪拜房产定价是否合理？",
  fr: "Binayah Deal Check | Ce bien à Dubaï est-il au bon prix ?",
  vi: "Binayah Deal Check | Bất động sản Dubai này có đúng giá?",
  he: "Binayah Deal Check | האם הנכס בדובאי מתומחר נכון?",
};

const descriptions: Record<string, string> = {
  en: "Send us any Dubai property — a link, a screenshot or a brochure, from any agency — and get an honest read on the price against registered DLD sales, the real cash you'll need, the rental maths, and the questions to ask. Free, no sign-up.",
  ru: "Отправьте любой объект в Дубае — ссылку, скриншот или брошюру от любого агентства — и получите честную оценку цены по данным DLD, реальную сумму наличных, расчёт доходности и вопросы продавцу. Бесплатно.",
  ar: "أرسل أي عقار في دبي — رابط أو لقطة شاشة أو كتيب من أي وكالة — واحصل على تقييم صادق للسعر مقابل صفقات دائرة الأراضي المسجلة، والنقد المطلوب فعليًا، وحسابات الإيجار، والأسئلة التي يجب طرحها. مجانًا.",
  zh: "发送任何迪拜房产——链接、截图或任何中介的宣传册——获得基于DLD登记交易的诚实价格评估、实际所需现金、租金测算以及应问的问题。免费，无需注册。",
  fr: "Envoyez n'importe quel bien à Dubaï — lien, capture d'écran ou brochure, de n'importe quelle agence — et obtenez une lecture honnête du prix face aux ventes enregistrées au DLD, la trésorerie réelle nécessaire, les calculs locatifs et les questions à poser. Gratuit.",
  vi: "Gửi bất kỳ bất động sản Dubai nào — liên kết, ảnh chụp màn hình hoặc tài liệu từ bất kỳ đại lý nào — và nhận đánh giá trung thực về giá so với giao dịch đã đăng ký DLD, tiền mặt thực tế cần có, phép tính cho thuê và các câu hỏi nên hỏi. Miễn phí.",
  he: "שלחו כל נכס בדובאי — קישור, צילום מסך או חוברת מכל סוכנות — וקבלו קריאה כנה של המחיר מול עסקאות רשומות ב-DLD, המזומן האמיתי שתצטרכו, חישובי השכירות והשאלות שכדאי לשאול. חינם.",
};

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
      question: "How accurate are the service charge figures?",
      answer:
        "They are estimates, and we label them as such. Dubai publishes service charges per building through the DLD Mollak index, not per community, so there is no feed we can query for your specific tower. We use a community-level planning figure and tell you to check your actual building on the DLD service charge index. Service charges are the single biggest drag on net yield, so this is a number worth verifying rather than assuming.",
    },
    {
      question: "Is the assessment hidden behind a form?",
      answer:
        "No. You get the complete assessment — price, cash required, rental economics, questions and alternatives — without giving us anything. There is an optional button at the end if you want an agent to talk it through with you, but the analysis itself is never gated. Withholding financial analysis until someone hands over their phone number would defeat the purpose.",
    },
    {
      question: "Can I use this instead of a valuation?",
      answer:
        "No. This is market information to help you ask better questions and spot things worth checking. It is not a valuation and not financial advice. Banks require a RICS-certified or bank-approved valuer for mortgage purposes, and anything with legal consequences needs a professional appraisal.",
    },
    {
      question: "What does 'total cash required' include?",
      answer:
        "The purchase price or deposit, the 4% DLD transfer fee, DLD admin and title deed charges, the trustee office fee, agency commission where it applies, the developer NOC, and — if you're financing — mortgage registration, the bank's arrangement fee and its valuation. Since February 2025 the DLD fee and agency commission can no longer be added to a mortgage, so those have to be paid in cash. On a ready purchase the total typically lands around 7% of the price.",
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
    alternates: {
      canonical: canonical(locale, PATH),
      languages: altLangs(PATH),
    },
    openGraph: {
      title,
      description,
      url: canonical(locale, PATH),
      siteName: "Binayah",
      locale: OG_LOCALE[locale] ?? "en_AE",
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE }],
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

  const faqs = FAQS[locale] ?? FAQS.en;

  return (
    <>
      <Navbar />

      <main className="bg-background">
        {/* Hero */}
        <section className="pt-28 pb-10 sm:pt-32 sm:pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="h-[2px] w-12 bg-accent mx-auto mb-6" />
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs mb-4">
              Deal Check
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Is this property{" "}
              <span className="font-light">actually a good deal?</span>
            </h1>
            <p className="mt-5 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Send us any Dubai property — from any agency, any portal, anywhere. We&apos;ll tell you
              how the price compares with sales actually registered at the Land Department, what
              you&apos;d really need in cash, what it earns as a rental, and what to ask before you
              commit.
            </p>
          </div>
        </section>

        {/* Tool */}
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <DealCheckClient />
          </div>
        </section>

        {/* What you get */}
        <section className="py-16 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
              What you get back
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  t: "Price against real comparables",
                  d: "How the asking price sits against sales registered with the DLD for the same community, type and bedroom count — with the sample size, so you know how much it's worth.",
                },
                {
                  t: "The cash you actually need",
                  d: "Booking, instalments, the 4% DLD fee, agency commission, NOC, mortgage costs. On a ready purchase this is usually around 7% on top of the price.",
                },
                {
                  t: "Rental economics, with the assumptions shown",
                  d: "Estimated income after service charges, vacancy, management and the municipality housing fee most calculators leave out. Every assumption is visible and challengeable.",
                },
                {
                  t: "The questions to ask",
                  d: "What's missing from the listing, which payment terms to pin down, and the drawbacks worth raising with the seller before you commit to anything.",
                },
              ].map((f) => (
                <div key={f.t} className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-2">{f.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-border/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
              Common questions
            </h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.question}
                  className="group rounded-2xl bg-card border border-border/50 p-5 shadow-sm"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-sm font-medium text-foreground">
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
          { name: "Deal Check", href: locale === "en" ? PATH : `/${locale}${PATH}` },
        ]}
      />
    </>
  );
}
