import { notFound } from "next/navigation";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { ArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import ProjectArticleDetailClient from "@/app/_clients/construction-updates/[slug]/ConstructionUpdateDetailClient";

const GUIDES_LABEL: Record<string, string> = {
  fr: "Guides de Projets",
  en: "Project Guides", ru: "Гайды по проектам", ar: "أدلة المشاريع", zh: "项目指南", vi: "Hướng dẫn dự án", he: "מדריכי פרויקטים",
};
const HOME_LABEL: Record<string, string> = {
  fr: "Accueil",
  en: "Home", ru: "Главная", ar: "الرئيسية", zh: "首页", vi: "Trang chủ", he: "בית",
};

// Indexable article content — ISR like news/[slug]. No per-request state is
// read, so an hourly-revalidated static render serves crawlers faster.
export const revalidate = 3600;

interface Props { params: Promise<{ slug: string; locale: string }> }

async function fetchArticle(slug: string, locale: string) {
  try {
    const res = await serverFetch(serverApiUrl(`/api/project-articles/${slug}?lang=${locale}`));
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  const article = await fetchArticle(slug, locale);
  if (!article) return { title: "Not Found" };
  return {
    title: article.metaTitle || `${article.h1} | Binayah`,
    description: article.metaDescription || article.excerpt || "",
    alternates: {
      canonical: canonical(locale, `/construction-updates/${slug}`),
      languages: altLangs(`/construction-updates/${slug}`),
    },
    openGraph: {
      title: article.metaTitle || article.h1,
      description: article.metaDescription || "",
      url: canonical(locale, `/construction-updates/${slug}`),
      type: "article",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: article.heroImage?.url || DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function ProjectArticlePage({ params }: Props) {
  const { slug, locale } = await params;
  const article = await fetchArticle(slug, locale);
  if (!article) return notFound();

  const lp = locale === "en" ? "" : `/${locale}`;
  const url = canonical(locale, `/construction-updates/${slug}`);

  // FAQ is rendered visibly on the page, so the schema matches the content.
  const faqItems: { question: string; answer: string }[] = Array.isArray(article.faq)
    ? article.faq
        .map((f: any) => ({ question: f?.question ?? f?.q ?? "", answer: f?.answer ?? f?.a ?? "" }))
        .filter((f: { question: string; answer: string }) => f.question && f.answer)
    : [];

  return (
    <>
      <ArticleJsonLd
        headline={article.h1}
        description={article.metaDescription || article.excerpt || article.h1}
        url={url}
        imageUrl={article.heroImage?.url}
        datePublished={article.publishedAt || article.createdAt || new Date(0).toISOString()}
        dateModified={article.updatedAt}
        wordCount={article.wordCount}
        locale={locale}
      />
      <BreadcrumbJsonLd
        items={[
          { name: HOME_LABEL[locale] ?? HOME_LABEL.en, href: `${lp}/` },
          { name: GUIDES_LABEL[locale] ?? GUIDES_LABEL.en, href: `${lp}/construction-updates` },
          { name: article.h1, href: `${lp}/construction-updates/${slug}` },
        ]}
      />
      {faqItems.length > 0 && <FAQJsonLd faqs={faqItems} />}
      <ProjectArticleDetailClient article={article} locale={locale} />
    </>
  );
}
