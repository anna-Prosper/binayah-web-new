import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import GuideDetailClient from "./GuideDetailClient";
import { PULSE_GUIDES, findGuide, guideDates } from "@/lib/pulse-guides";
import { getAreaStats } from "@/lib/area-stats";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical, OG_LOCALE, AE_URL } from "@/lib/site";
import { getGuideTranslation, isGuideLocaleTranslated, TRANSLATED_GUIDE_LOCALES } from "@/lib/guide-i18n";

export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  return locales.flatMap((locale) =>
    PULSE_GUIDES.map((g) => ({ locale, slug: g.slug }))
  );
}

const PULSE_SUFFIX: Record<string, string> = {
  ru: "Дубай Пульс | Binayah Properties",
  ar: "نبض دبي | بناية للعقارات",
  zh: "迪拜脉搏 | Binayah Properties",
  vi: "Dubai Pulse | Binayah Properties",
  he: "דובאי פולס | Binayah Properties",
  fr: "Dubai Pulse | Binayah Properties",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return {};
  const t = await getTranslations({ locale, namespace: "pulseGuides" });
  const suffix = PULSE_SUFFIX[locale] ?? "Dubai Pulse | Binayah Properties";
  const title = `${t(guide.titleKey as Parameters<typeof t>[0])} | ${suffix}`;
  const description = t(guide.descriptionKey as Parameters<typeof t>[0]);
  const isEn = locale === "en";
  // A guide is indexable in English, and in any locale whose bodies+FAQs are
  // fully translated (see @/lib/guide-i18n). Locales that render a translated
  // title over an English body stay noindex,follow and canonicalise to EN so we
  // don't index near-duplicate pages. Translated locales get a self-canonical
  // and full hreflang linking EN + every translated locale.
  const path = `/pulse/guides/${slug}`;
  const enUrl = canonical("en", path);
  const indexable = isEn || isGuideLocaleTranslated(locale);
  const url = indexable ? canonical(locale, path) : enUrl;
  const languages: Record<string, string> = { en: enUrl, "x-default": enUrl };
  for (const l of TRANSLATED_GUIDE_LOCALES) languages[l] = canonical(l, path);
  const ogImage = guide.heroImage?.url ?? `${AE_URL}/assets/og-image.webp`;
  return {
    title,
    description,
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: {
      canonical: url,
      languages: indexable ? languages : undefined,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: OG_LOCALE[locale] ?? "en_AE",
      siteName: "Binayah Properties",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const guide = findGuide(slug);
  if (!guide) notFound();

  const t = await getTranslations({ locale, namespace: "pulseGuides" });
  const title = t(guide.titleKey as Parameters<typeof t>[0]);
  const description = t(guide.descriptionKey as Parameters<typeof t>[0]);
  const url = canonical(locale, `/pulse/guides/${slug}`);
  const lp = locale === "en" ? "" : `/${locale}`;

  // Use the fully-translated body/FAQ where available; otherwise the English body.
  const translation = locale !== "en" ? await getGuideTranslation(locale, slug) : null;
  const body = translation?.body || guide.body;
  const faq = translation?.faq && translation.faq.length > 0 ? translation.faq : guide.faq;
  const localizedGuide = translation ? { ...guide, body, faq } : guide;

  // Estimate word count from body
  const wordCount = body.split(/\s+/).length;
  const { published, modified } = guideDates(slug);

  // Area investor guides render a live DLD stats panel.
  const areaStats = guide.area ? await getAreaStats(guide.area) : null;

  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: locale === "ru" ? "Аналитика" : locale === "ar" ? "تحليل السوق" : locale === "zh" ? "市场分析" : locale === "vi" ? "Phân tích thị trường" : locale === "he" ? "דופק השוק" : "Market Pulse", href: `${lp}/pulse` },
    { name: locale === "ru" ? "Руководства" : locale === "ar" ? "الأدلة" : locale === "zh" ? "投资指南" : locale === "vi" ? "Hướng dẫn" : locale === "he" ? "מדריכים" : "Guides", href: `${lp}/pulse/guides` },
    { name: title, href: `${lp}/pulse/guides/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ArticleJsonLd
        headline={title}
        description={description}
        url={url}
        imageUrl={guide.heroImage?.url ?? `${AE_URL}/assets/og-image.webp`}
        datePublished={published}
        dateModified={modified}
        wordCount={wordCount}
        locale={locale}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faq && faq.length > 0 && <FAQJsonLd faqs={faq} />}
      <Navbar />
      <PulseEmirateNav />
      <GuideDetailClient guide={localizedGuide} areaStats={areaStats} published={published} />
      <Footer />
    </div>
  );
}
