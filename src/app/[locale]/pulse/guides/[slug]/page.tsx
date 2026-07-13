import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import GuideDetailClient from "./GuideDetailClient";
import { PULSE_GUIDES, findGuide, guideDates } from "@/lib/pulse-guides";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical, OG_LOCALE, AE_URL } from "@/lib/site";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return {};
  const t = await getTranslations({ locale, namespace: "pulseGuides" });
  const title = `${t(guide.titleKey as Parameters<typeof t>[0])} | Dubai Pulse | Binayah`;
  const description = t(guide.descriptionKey as Parameters<typeof t>[0]);
  const isEn = locale === "en";
  // Guide bodies are authored in English only. The non-English routes render a
  // translated title over an English body, so we consolidate ranking signals on
  // the English page: non-EN pages are noindex,follow and canonicalise to EN.
  const enUrl = canonical("en", `/pulse/guides/${slug}`);
  const url = isEn ? enUrl : canonical(locale, `/pulse/guides/${slug}`);
  const ogImage = guide.heroImage?.url ?? `${AE_URL}/assets/og-image.webp`;
  return {
    title,
    description,
    robots: isEn ? undefined : { index: false, follow: true },
    alternates: {
      canonical: isEn ? url : enUrl,
      languages: isEn ? { en: enUrl, "x-default": enUrl } : undefined,
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

  // Estimate word count from body
  const wordCount = guide.body.split(/\s+/).length;
  const { published, modified } = guideDates(slug);

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
      {guide.faq && guide.faq.length > 0 && <FAQJsonLd faqs={guide.faq} />}
      <Navbar />
      <PulseEmirateNav />
      <GuideDetailClient guide={guide} />
      <Footer />
    </div>
  );
}
