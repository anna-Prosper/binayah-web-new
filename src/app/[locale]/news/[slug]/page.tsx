import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/news/[slug]/NewsDetailClient";
import { getNewsArticle, getRelatedNews, serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return { title: "Not Found" };
  return {
    title: article.metaTitle || `${article.title} | Binayah Properties`,
    description: article.metaDescription || article.excerpt,
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return notFound();
  let related: any[] = [];
  try {
    related = await getRelatedNews(slug, article.category, 3);
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
            image: article.featuredImage || "https://staging.binayahhub.com/assets/dubai-hero.webp",
            datePublished: article.publishedAt,
            author: { "@type": "Person", name: article.author || "Binayah Editorial" },
            publisher: { "@type": "Organization", name: "Binayah Properties", logo: { "@type": "ImageObject", url: "https://staging.binayahhub.com/assets/binayah-logo.webp" } },
            url: `https://staging.binayahhub.com/news/${slug}`,
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
