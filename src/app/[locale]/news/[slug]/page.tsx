import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/news/[slug]/NewsDetailClient";
import { getNewsArticle, getRelatedNews } from "@/lib/api";

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
  const related = await getRelatedNews(slug, article.category, 3);
  return <NewsDetailClient article={article} related={related} />;
}
