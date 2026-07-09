/* eslint-disable i18next/no-literal-string */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import WeeklySubscribeForm from "@/components/WeeklySubscribeForm";
import { Link } from "@/navigation";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { getNonce } from "@/lib/nonce";
import { canonical, altLangs, OG_LOCALE, AE_URL } from "@/lib/site";
import { Calendar, Clock, ArrowLeft, FileText } from "lucide-react";

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
  metaTitle?: string;
  metaDescription?: string;
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
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
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
  const article = await getReport(slug, locale);
  if (!article) notFound();

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

        {contentHtml ? (
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
      </article>

      <Footer />

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            author: { "@type": "Organization", name: article.author || "Binayah Editorial" },
            publisher: {
              "@type": "Organization",
              name: "Binayah Properties",
              logo: { "@type": "ImageObject", url: `${AE_URL}/assets/binayah-logo.webp` },
            },
            url: canonical(locale, `/pulse/reports/${slug}`),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
