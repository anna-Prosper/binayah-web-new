import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/_clients/news/[slug]/NewsDetailClient";
import { getNewsArticle, getRelatedNews, serverApiUrl, serverFetch } from "@/lib/api";
import { canonical, altLangs, AE_URL } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import { sanitizeArticleHtml } from "@/lib/sanitize";

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
  const nonce = await getNonce();
  // Fetch the article and the (heavy, independent) market snapshot in PARALLEL.
  // These previously ran sequentially — article → related → market-stats —
  // stacking API latency onto cold ISR renders (~8s). market-stats doesn't
  // depend on the article, so it shouldn't be on the critical path after it.
  const [article, marketStats] = await Promise.all([
    getNewsArticle(slug, locale),
    serverFetch(serverApiUrl('/api/market-stats'))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);
  // article.content is scraped HTML rendered via dangerouslySetInnerHTML — sanitize
  // server-side (CSP allows 'unsafe-inline', so injected scripts would execute).
  if (article?.content) article.content = sanitizeArticleHtml(article.content);
  // Related news needs the article's category, so it runs after the article.
  let related: any[] = [];
  try {
    related = await getRelatedNews(slug, article.category, 3, locale);
  } catch {
    related = [];
  }
  return (
    <>
      <NewsDetailClient article={article} related={related} marketStats={marketStats} />
      <script
        type="application/ld+json"
        nonce={nonce}
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
