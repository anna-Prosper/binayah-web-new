import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/news/[slug]/NewsDetailClient";
import { getNewsArticle } from "@/lib/api";

export const revalidate = 600;

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
  return <NewsDetailClient article={article} />;
}
