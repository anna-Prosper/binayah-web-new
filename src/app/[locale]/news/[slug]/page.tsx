import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { pickRouteMessages } from "@/i18n/client-namespaces";
import { Suspense } from "react";
import NewsDetailClient from "@/app/_clients/news/[slug]/NewsDetailClient";
import { getNewsArticle, getRelatedNews, serverApiUrl } from "@/lib/api";
import { getMarketStats } from "@/lib/market";
import { canonical, altLangs, AE_URL, OG_LOCALE } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import { sanitizeArticleHtml, articleBodyText, newsBodyToPlainText } from "@/lib/sanitize";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { isIndexableNewsArticle } from "@/lib/news-topicality";
import { newsAuthorOrDefault } from "@/lib/news-author";

// A scraped article's body is immutable once published — only the "related"
// rail and the market-stats sidebar drift, and both are cosmetic. At 1,029
// articles x 7 locales an hourly timer was the largest single source of ISR
// writes on the site (~25k/day at full coverage) for content that does not
// change. Safe to lengthen because an edit or a retraction can be published
// immediately via POST /api/revalidate, which carries this route pattern in
// DEFAULT_TARGETS.
//
// EFFECTIVE WINDOW: 86400, not the 604800 exported here — and that is by
// design, not an oversight. A route's window is the MINIMUM across every fetch
// in its render, and the floor is deliberately set by the "related" rail:
// getRelatedNews reads the news FEED, which genuinely gains ~4 articles a day,
// so it is pinned to 24h rather than a week. The article body and the market
// stats (both immutable / slow-moving) are passed a week and do not constrain
// it. Net effect is 3600 -> 86400, a 24x cut in ISR writes on this route.
// Verified in .next/prerender-manifest.json — the export alone proves nothing.
export const revalidate = 604800;

// Window constants, named so the trade-off above is legible at each call site.
const ARTICLE_TTL = 604800; // 7d — a published article's body is immutable
const FEED_TTL = 86400; // 24h — the related rail must not freeze as news lands
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
  // Same ARTICLE_TTL as the page body: generateMetadata runs as part of the
  // route's render, so a 3600 fetch here would cap the whole route at an hour
  // no matter what the body passes. React cache() dedupes it with the body's
  // identical call within a single render.
  const article = await getNewsArticle(slug, locale, ARTICLE_TTL);
  if (!article) return { title: "Not Found" };
  // The /news feed is a general UAE news scrape, so a chunk of it (restaurant
  // openings, concerts, chip fabs) has nothing to do with property. Those pages
  // stay live and readable, but they are noindexed so they stop diluting the
  // domain's topical authority and stop eating crawl budget — follow stays on,
  // so they still pass link equity to the property pages they link to.
  // sitemap.ts imports this SAME predicate, so a noindexed article is never
  // submitted (a drift between the two produces GSC's "Submitted URL marked
  // noindex"). Classification runs on the English base fields, which every
  // locale shares, so all 7 locales agree.
  const indexable = isIndexableNewsArticle(article);
  return {
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
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
    getNewsArticle(slug, locale, ARTICLE_TTL),
    getMarketStats(ARTICLE_TTL), // cosmetic sidebar; must not cap this page's window
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
    related = await getRelatedNews(slug, article.category, 3, locale, FEED_TTL);
  } catch {
    related = [];
  }
  // Flattened once: feeds both articleBody and the wordCount derived from it.
  const newsBodyText = articleBodyText(newsBodyToPlainText(article.body));
  const newsWordCount = newsBodyText ? newsBodyText.split(/\s+/).filter(Boolean).length : undefined;
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: locale === "fr" ? "Accueil" : locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${localePrefix}/` },
    { name: locale === "fr" ? "Actualités" : locale === "ru" ? "Новости" : locale === "ar" ? "الأخبار" : locale === "zh" ? "新闻" : locale === "vi" ? "Tin tức" : locale === "he" ? "חדשות" : "News", href: `${localePrefix}/news` },
    { name: article.title, href: `${localePrefix}/news/${slug}` },
  ];

  return (
    <NextIntlClientProvider messages={pickRouteMessages(await getMessages(), ["newsDetail"])}>
      <>
        {/* NewsDetailClient reads useSearchParams() (a debug-only ?hero= layout
            toggle). Without a Suspense boundary around it, Next.js can't SSR the
            component at all — the ENTIRE tree, including the LCP hero image,
            silently drops out of the server HTML and only renders after client
            hydration. That was tanking mobile LCP across every article page. */}
        <Suspense>
          <NewsDetailClient article={article} related={related} marketStats={marketStats} />
        </Suspense>
        {/* Was a hand-rolled block that omitted description/mainEntityOfPage and
            drifted from the other three article types. Shares ArticleJsonLd now;
            author stays a Person because 502 of these carry a real human byline
            (newsAuthorOrDefault falls back to the editorial name for the rest). */}
        <ArticleJsonLd
          type="NewsArticle"
          headline={article.title}
          description={article.metaDescription || article.excerpt || article.title}
          url={canonical(locale, `/news/${slug}`)}
          imageUrl={article.featuredImage || `${AE_URL}/assets/dubai-hero.webp`}
          datePublished={article.publishedAt}
          dateModified={article.updatedAt}
          authorName={newsAuthorOrDefault(article.author)}
          authorType="Person"
          articleBody={newsBodyText}
          wordCount={newsWordCount}
          locale={locale}
          nonce={nonce}
        />
        <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      </>
    </NextIntlClientProvider>
  );
}
