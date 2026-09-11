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
  en: "Send any Dubai property — a link, screenshot or brochure, from any agency. We'll check the price against what similar homes nearby actually sold for, work out what you really need in cash, and tell you what to ask. Free.",
  ru: "Отправьте любой объект в Дубае — ссылку, скриншот или брошюру от любого агентства. Сравним цену с тем, за сколько недавно продавались похожие квартиры рядом, посчитаем реальные расходы и подскажем, о чём спросить. Бесплатно.",
  ar: "أرسل أي عقار في دبي — رابط أو لقطة شاشة أو كتيب من أي وكالة. نقارن السعر بما بيعت به فعلاً منازل مشابهة قريبة، ونحسب ما تحتاجه نقداً بالضبط، ونخبرك بما يجب أن تسأل عنه. مجاناً.",
  zh: "发送任何迪拜房产——链接、截图或任何中介的宣传册。我们会把价格和附近同类房子最近的真实成交价作比较，算出你实际需要准备多少现金，并告诉你该问些什么。免费。",
  fr: "Envoyez n'importe quel bien à Dubaï — lien, capture ou brochure, de n'importe quelle agence. On compare le prix à ce que des logements similaires se sont réellement vendus juste à côté, on calcule ce qu'il vous faut vraiment en liquide, et on vous dit quoi demander. Gratuit.",
  vi: "Gửi bất kỳ bất động sản Dubai nào — liên kết, ảnh chụp hoặc tài liệu từ bất kỳ đại lý nào. Chúng tôi so giá với mức mà những căn tương tự gần đó đã thực sự bán được, tính ra số tiền mặt bạn thật sự cần, và mách bạn nên hỏi gì. Miễn phí.",
  he: "שלחו כל נכס בדובאי — קישור, צילום מסך או חוברת מכל סוכנות. נשווה את המחיר למה שדירות דומות באזור באמת נמכרו בו לאחרונה, נחשב כמה מזומן תצטרכו בפועל, ונגיד לכם מה לשאול. חינם.",
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
    blurb: "The method we use: price per square foot against what places actually sold for, not asking prices.",
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
        "No. Send us anything — another agency's listing, a portal link, a developer's brochure, even a screenshot someone forwarded you on WhatsApp. That's rather the point: you should be able to get a straight answer about a place no matter who happens to be selling it.",
    },
    {
      question: "Where do the price comparisons come from?",
      answer:
        "From what homes actually sold for — real recorded sale prices, not what other sellers are asking. Asking prices drift upward together and tell you very little. We line your property up against ones in the same area, the same type and the same number of bedrooms, and tell you how many sales we found. If it's only a handful, we say so instead of dressing a guess up as a verdict.",
    },
    {
      question: "Can I check a rental listing too?",
      answer:
        "Yes. Send a rental and we'll compare what they're asking against what people nearby are actually paying — from real signed tenancy contracts, worked out per square foot so size doesn't skew it. We'll also show roughly what it would cost to buy the same place, in case you're weighing renting against buying.",
    },
    {
      question: "How accurate are the service charge estimates?",
      answer:
        "They're estimates, and we say so on the page. Service charges are set building by building, not area by area, so there's no way for us to look up your exact tower. We use a sensible figure for the area and point you at the official index to check yours. It's worth doing — the service charge is the single biggest thing eating into what you actually keep from rent.",
    },
    {
      question: "What does it cost, and what do you need from me?",
      answer:
        "The check is free. You get the verdict, how the price compares, and the total cash figure without giving us anything at all. For the rest — the full cost breakdown, what it earns as a rental, the questions to ask and places worth comparing — we ask for a name and a number, because one of our agents may call you about it.",
    },
    {
      question: "How do I know if a Dubai asking price is fair, and is there room to negotiate?",
      answer:
        "Work out the price per square foot and compare it with what similar homes in the same area actually sold for — not with what other sellers are asking, since those drift upward together. We do that for you. If a place is more than 10% above what comparable homes went for, there should be a concrete reason: a high floor, a proper view, a recent renovation. If nobody can point to one, that gap is your room to negotiate.",
    },
    {
      question: "What rental yield should I expect in Dubai?",
      answer:
        "Rents in Dubai tend to work out at roughly 4% of a property's value a year in the prime waterfront spots, and 7-8% in cheaper areas like Jumeirah Village Circle. But that's before costs. What you actually keep is a good deal less once the service charge, empty months, management and the municipality fee come out — and that's the number worth caring about. We show you both, and every deduction in between.",
    },
    {
      question: "Can I use this instead of a valuation?",
      answer:
        "No — and we'd rather be straight about that. This is here to help you ask sharper questions and notice things worth checking. It isn't a formal valuation and it isn't financial advice. If you need one for a mortgage or anything legal, banks will want a certified valuer.",
    },
    {
      question: "What's actually included in the cash figure?",
      answer:
        "The price or your deposit, the 4% government transfer fee, the registration and title paperwork, the trustee office fee, the agent's commission where it applies, the developer's clearance certificate, and if you're borrowing, the bank's arrangement fee, its valuation and the mortgage registration. One thing worth knowing: since February 2025 the transfer fee and commission can't be added to your loan, so you need them in cash. On a finished home it usually comes to about 7% on top of the price.",
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
      "Dubai property sold prices",
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
      "Price compared with what similar homes actually sold for",
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
        {/* ── Hero ──────────────────────────────────────────────────────────
            The thesis of the page is the comparison itself, so the hero shows
            a real one rather than describing it: the deep-green panel is the
            product's actual output, in miniature. Figures are from a genuine
            Business Bay check and labelled as an example, so nobody mistakes
            it for their own result. */}
        <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(70% 55% at 50% -5%, rgba(212,168,71,0.13) 0%, rgba(212,168,71,0) 72%)",
            }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
              {/* Left — the claim */}
              <div className="text-center lg:text-start">
                <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  {t("eyebrow")}
                </p>
                <h1 className="mt-5 text-[30px] leading-[1.12] sm:text-[42px] lg:text-[52px] font-bold text-foreground text-balance">
                  {t("heroTitle")}{" "}
                  <span className="font-light italic text-[#1A7A5A]">{t("heroTitleLight")}</span>
                </h1>
                <p className="mt-5 text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t("heroSubtitle")}
                </p>

                <ul className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2">
                  {[
                    { icon: Zap, label: t("trustFree") },
                    { icon: ShieldCheck, label: t("trustNoSignup") },
                    { icon: BadgeCheck, label: t("trustDld") },
                    { icon: Sparkles, label: t("trustAnyAgency") },
                  ].map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      <Icon className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — a real result, in miniature */}
              <figure className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-3 -z-10 rounded-[28px] opacity-60 blur-2xl"
                  style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(11,61,46,0.20), transparent 70%)" }}
                />
                <div className="rounded-3xl bg-[#0B3D2E] p-5 sm:p-6 shadow-xl ring-1 ring-black/5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                      {t("sampleLabel")}
                    </span>
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      {t("vBelow")}
                    </span>
                  </div>

                  <p className="mt-4 text-white/90 text-sm">{t("sampleProperty")}</p>

                  {/* The comparison — the one number the page exists to produce */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/[0.06] px-4 py-3">
                      <p className="text-[11px] text-white/50">{t("priceThis")}</p>
                      <p className="mt-1 text-xl sm:text-2xl font-semibold text-white tabular-nums">2,298</p>
                      <p className="text-[11px] text-white/40">{t("perSqft")}</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.06] px-4 py-3">
                      <p className="text-[11px] text-white/50">{t("priceComparable")}</p>
                      <p className="mt-1 text-xl sm:text-2xl font-semibold text-white tabular-nums">2,419</p>
                      <p className="text-[11px] text-white/40">{t("perSqft")}</p>
                    </div>
                  </div>

                  {/* Scale bar: both marks sit on one axis, so the gap is visible
                      rather than merely stated. */}
                  <div className="mt-5">
                    <div className="relative h-1.5 rounded-full bg-white/10">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-400/70" style={{ width: "95%" }} />
                      <div className="absolute -top-1 h-3.5 w-0.5 rounded bg-white" style={{ left: "95%" }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-white/45">
                      <span>{t("sampleCheaper")}</span>
                      <span className="tabular-nums text-emerald-300 font-medium">−5.0%</span>
                    </div>
                  </div>

                  <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/45">
                    {t("sampleBasis")}
                  </p>
                </div>
                <figcaption className="mt-3 text-center lg:text-start text-[11px] text-muted-foreground/70">
                  {t("sampleCaption")}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Tool */}
        <section className="pb-14 sm:pb-16">
          <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6">
            <DealCheckClient />
          </div>
        </section>

        {/* What you get */}
        <section className="py-14 sm:py-16 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10 text-balance">
              {t("whatYouGet")}
            </h2>
            {/* Numbered because these genuinely are the four sections of the
                report, in the order they appear — not decorative sequence. */}
            <ol className="grid sm:grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/50">
              {[
                { t: t("wyg1Title"), d: t("wyg1Desc") },
                { t: t("wyg2Title"), d: t("wyg2Desc") },
                { t: t("wyg3Title"), d: t("wyg3Desc") },
                { t: t("wyg4Title"), d: t("wyg4Desc") },
              ].map((f, i) => (
                <li key={f.t} className="flex gap-4 bg-card p-5 sm:p-6">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B3D2E]/[0.07] text-xs font-semibold tabular-nums text-[#0B3D2E]"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] sm:text-base font-semibold text-foreground mb-1.5">{f.t}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
                  </div>
                </li>
              ))}
            </ol>
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
