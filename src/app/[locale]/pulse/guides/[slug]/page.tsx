import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import GuideDetailClient from "./GuideDetailClient";
import { PULSE_GUIDES, findGuide } from "@/lib/pulse-guides";
import { getTranslations } from "next-intl/server";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, AE_URL } from "@/lib/site";

export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi"];
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
  const url = canonical(locale, `/pulse/guides/${slug}`);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: altLangs(`/pulse/guides/${slug}`),
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: OG_LOCALE[locale] ?? "en_AE",
      siteName: "Binayah Properties",
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${AE_URL}/assets/og-image.webp`],
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();

  const t = await getTranslations({ locale, namespace: "pulseGuides" });
  const title = t(guide.titleKey as Parameters<typeof t>[0]);
  const description = t(guide.descriptionKey as Parameters<typeof t>[0]);
  const url = canonical(locale, `/pulse/guides/${slug}`);
  const lp = locale === "en" ? "" : `/${locale}`;

  // Estimate word count from body
  const wordCount = guide.body.split(/\s+/).length;

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
        imageUrl={`${AE_URL}/assets/og-image.webp`}
        datePublished="2026-01-01"
        dateModified="2026-06-01"
        wordCount={wordCount}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />
      <PulseEmirateNav />
      <GuideDetailClient guide={guide} />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
