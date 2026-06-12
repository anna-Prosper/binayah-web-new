import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/_clients/news/[slug]/NewsDetailClient";
import { getNewsArticle, getRelatedNews, serverApiUrl, serverFetch } from "@/lib/api";
import { canonical, altLangs, AE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const article = await getNewsArticle(slug, locale);
  if (!article) return { title: "Not Found" };
  return {
    title: article.metaTitle || `${article.title} | Binayah Properties`,
    description: article.metaDescription || article.excerpt,
    alternates: {
      canonical: canonical(locale, `/news/${slug}`),
      languages: altLangs(`/news/${slug}`),
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      type: "article",
      url: canonical(locale, `/news/${slug}`),
      locale: locale === "ar" ? "ar_AE" : locale === "ru" ? "ru_RU" : locale === "zh" ? "zh_CN" : locale === "vi" ? "vi_VN" : locale === "he" ? "en_AE" : "en_AE",
      ...(article.featuredImage ? { images: [article.featuredImage] } : {}),
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  // Pass locale so API returns translated title/body/excerpt when available
  const article = await getNewsArticle(slug, locale);
  let related: any[] = [];
  try {
    related = await getRelatedNews(slug, article.category, 3, locale);
  } catch {
    related = [];
  }
  let marketStats: any = null;
  try {
    const r = await serverFetch(serverApiUrl('/api/market-stats'));
    if (r.ok) marketStats = await r.json();
  } catch {}
  return (
    <>
      <NewsDetailClient article={article} related={related} marketStats={marketStats} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            image: article.featuredImage || `${AE_URL}/assets/dubai-hero.webp`,
            datePublished: article.publishedAt,
            author: { "@type": "Person", name: article.author || "Binayah Editorial" },
            publisher: { "@type": "Organization", name: "Binayah Properties", logo: { "@type": "ImageObject", url: `${AE_URL}/assets/binayah-logo.webp` } },
            url: canonical(locale, `/news/${slug}`),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
