/* eslint-disable i18next/no-literal-string */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import WeeklySubscribeForm from "@/components/WeeklySubscribeForm";
import WeeklyReportView, { type ReportData } from "@/components/WeeklyReportView";
import { Link } from "@/navigation";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { getNonce } from "@/lib/nonce";
import { canonical, altLangs, OG_LOCALE, AE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";
import { Calendar, Clock, ArrowLeft, ArrowRight, FileText } from "lucide-react";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

interface ReportArticle {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category?: string;
  author?: string;
  readTime?: string;
  publishedAt?: string;
  updatedAt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  reportData?: ReportData | null;
}

async function getReport(slug: string, locale: string): Promise<ReportArticle | null> {
  try {
    const res = await serverFetch(serverApiUrl(`/api/news/${slug}?lang=${locale}`));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || Array.isArray(data) || !data.slug) return null;
    return data as ReportArticle;
  } catch {
    return null;
  }
}

// Prev/next by publish date — internal linking + crawl continuity as the archive
// grows. Uses the same list the hub renders (category "Weekly Report").
async function getAdjacent(slug: string): Promise<{ prev?: { slug: string; title: string }; next?: { slug: string; title: string } }> {
  try {
    const res = await serverFetch(serverApiUrl(`/api/news?category=Weekly%20Report&limit=60`));
    if (!res.ok) return {};
    const items = (await res.json()) as { slug: string; title: string }[];
    const idx = items.findIndex((a) => a.slug === slug); // list is newest-first
    if (idx < 0) return {};
    return {
      next: idx > 0 ? { slug: items[idx - 1].slug, title: items[idx - 1].title } : undefined,
      prev: idx < items.length - 1 ? { slug: items[idx + 1].slug, title: items[idx + 1].title } : undefined,
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi", "he", "fr"];
  try {
    const res = await fetch(serverApiUrl("/api/news?category=Weekly%20Report&limit=24"), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const items = (await res.json()) as Array<{ slug?: string }>;
    const slugs = items.map((a) => a?.slug).filter((s): s is string => !!s);
    return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getReport(slug, locale);
  if (!article) return { title: "Not Found" };
  const title = article.metaTitle || `${article.title} | Binayah Properties`;
  const description = article.metaDescription || article.excerpt || "";
  const ogImage = article.featuredImage || DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: canonical(locale, `/pulse/reports/${slug}`), languages: altLangs(`/pulse/reports/${slug}`) },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical(locale, `/pulse/reports/${slug}`),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

function fmtDate(d?: string, locale = "en"): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "en" ? "en-GB" : locale, { day: "numeric", month: "long", year: "numeric" });
}

export default async function ReportDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const nonce = await getNonce();
  const [article, adjacent] = await Promise.all([getReport(slug, locale), getAdjacent(slug)]);
  if (!article) notFound();

  const rd = article.reportData;
  const hasStructured = !!(rd && (rd.kpis || (rd.movers && rd.movers.length) || (rd.launches && rd.launches.length)));
  const contentHtml = article.content ? sanitizeArticleHtml(article.content) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/pulse/reports" locale={locale} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> All market reports
        </Link>

        <div className="mt-6 flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase">
          <FileText className="h-3.5 w-3.5" style={{ color: "#B8922F" }} />
          <span style={{ color: "#B8922F" }}>Market Report</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {article.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{fmtDate(article.publishedAt, locale)}</span>
          {article.readTime && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{article.readTime}</span>}
          <span>By {article.author || "Binayah Editorial"}</span>
        </div>

        {hasStructured ? (
          <WeeklyReportView data={rd!} locale={locale} />
        ) : contentHtml ? (
          <div
            className="mt-8 prose prose-lg max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
        )}

        <div className="mt-14">
          <WeeklySubscribeForm source={`pulse-report:${slug}`} variant="card" />
        </div>

        {/* Prev / next report — internal linking + crawl continuity */}
        {(adjacent.prev || adjacent.next) && (
          <nav className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adjacent.prev ? (
              <Link href={`/pulse/reports/${adjacent.prev.slug}`} locale={locale} className="group flex flex-col rounded-2xl border border-border/60 bg-card px-5 py-4 hover:border-primary/20 transition-colors">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Previous report</span>
                <span className="mt-1 font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{adjacent.prev.title}</span>
              </Link>
            ) : <span />}
            {adjacent.next && (
              <Link href={`/pulse/reports/${adjacent.next.slug}`} locale={locale} className="group flex flex-col rounded-2xl border border-border/60 bg-card px-5 py-4 hover:border-primary/20 transition-colors sm:text-right">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground sm:justify-end">Next report <ArrowRight className="h-3.5 w-3.5" /></span>
                <span className="mt-1 font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{adjacent.next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      <Footer />

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.excerpt,
              image: [article.featuredImage || DEFAULT_OG_IMAGE],
              datePublished: article.publishedAt,
              dateModified: article.updatedAt || article.publishedAt,
              author: { "@type": "Organization", name: article.author || "Binayah Editorial", url: AE_URL },
              publisher: {
                "@type": "Organization",
                name: "Binayah Properties",
                logo: { "@type": "ImageObject", url: `${AE_URL}/assets/binayah-logo.webp` },
              },
              mainEntityOfPage: { "@type": "WebPage", "@id": canonical(locale, `/pulse/reports/${slug}`) },
              url: canonical(locale, `/pulse/reports/${slug}`),
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${AE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Market Reports", item: canonical(locale, "/pulse/reports") },
                { "@type": "ListItem", position: 3, name: article.title },
              ],
            },
          ]).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
