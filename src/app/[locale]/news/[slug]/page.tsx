import { notFound } from "next/navigation";
import { Suspense } from "react";
import NewsDetailClient from "@/app/_clients/news/[slug]/NewsDetailClient";
import { getNewsArticle, getRelatedNews, serverApiUrl } from "@/lib/api";
import { getMarketStats } from "@/lib/market";
import { canonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const revalidate = 3600;
// Pre-render the most recent articles (the hot pages) at build so they never hit
// a cold on-demand render; the long tail still renders on-demand and is cached
// (dynamicParams defaults to true).
export async function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  try {
    const res = await fetch(serverApiUrl("/api/news?limit=24"), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const items = (await res.json()) as Array<{ slug?: string }>;
    const slugs = items.map((a) => a?.slug).filter((s): s is string => !!s);
    return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
  } catch {
    return [];
  }
}

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
      locale: OG_LOCALE[locale] ?? "en_AE",
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
    getMarketStats(), // cross-request cached (1h) — no longer a live call per render
  ]);
  // A slug may exist in one locale but not another (e.g. no Arabic translation) →
  // getNewsArticle returns null. Bail to 404 before dereferencing it below; without
  // this, prerendering such a locale crashed the whole build (reading .title of null).
  if (!article) notFound();
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
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: locale === "fr" ? "Accueil" : locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${localePrefix}/` },
    { name: locale === "fr" ? "Actualités" : locale === "ru" ? "Новости" : locale === "ar" ? "الأخبار" : locale === "zh" ? "新闻" : locale === "vi" ? "Tin tức" : locale === "he" ? "חדשות" : "News", href: `${localePrefix}/news` },
    { name: article.title, href: `${localePrefix}/news/${slug}` },
  ];

  return (
    <>
      {/* NewsDetailClient reads useSearchParams() (a debug-only ?hero= layout
          toggle). Without a Suspense boundary around it, Next.js can't SSR the
          component at all — the ENTIRE tree, including the LCP hero image,
          silently drops out of the server HTML and only renders after client
          hydration. That was tanking mobile LCP across every article page. */}
      <Suspense>
        <NewsDetailClient article={article} related={related} marketStats={marketStats} />
      </Suspense>
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
            ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
            author: { "@type": "Person", name: article.author || "Binayah Editorial" },
            publisher: { "@type": "Organization", name: "Binayah Properties", logo: { "@type": "ImageObject", url: `${AE_URL}/assets/binayah-logo.webp` } },
            url: canonical(locale, `/news/${slug}`),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
    </>
  );
}
