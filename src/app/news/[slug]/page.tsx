import { notFound } from "next/navigation";
import NewsDetailClient from "./NewsDetailClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await serverFetch(serverApiUrl(`/api/news/${slug}`));
    if (!res.ok) return { title: "Not Found" };
    const article = await res.json();
    return {
      title: article.metaTitle || `${article.title} | Binayah Properties`,
      description: article.metaDescription || article.excerpt,
    };
  } catch {
    return { title: "Binayah Properties" };
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await serverFetch(serverApiUrl(`/api/news/${slug}`));
    if (res.status === 404) return notFound();
    if (!res.ok) return notFound();
    const article = await res.json();
    return <NewsDetailClient article={article} />;
  } catch {
    return notFound();
  }
}
