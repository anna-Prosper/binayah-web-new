import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import { notFound } from "next/navigation";
import NewsDetailClient from "./NewsDetailClient";

export const revalidate = 300;

function cleanWpHtml(html: string): string {
  if (!html) return "";
  let clean = html;
  // Remove inline styles
  clean = clean.replace(/ style="[^"]*"/gi, "");
  clean = clean.replace(/ class="[^"]*"/gi, "");
  // Remove empty tags
  clean = clean.replace(/<(\w+)[^>]*>\s*<\/\1>/g, "");
  clean = clean.replace(/<(\w+)[^>]*>\s*<\/\1>/g, "");
  return clean.trim();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const article = await Article.findOne({ slug, publishStatus: "Published" }).lean();
  if (!article) return { title: "Not Found" };
  return {
    title: (article as any).metaTitle || `${(article as any).title} | Binayah Properties`,
    description: (article as any).metaDescription || (article as any).excerpt,
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const article = await Article.findOne({ slug, publishStatus: "Published" }).lean();
  if (!article) notFound();

  const serialized = JSON.parse(JSON.stringify(article));
  if (serialized.content) {
    serialized.content = cleanWpHtml(serialized.content);
  }
  const plainContent = serialized.content ? serialized.content.replace(/<[^>]*>/g, "").trim() : "";
  const plainExcerpt = serialized.excerpt ? String(serialized.excerpt).trim() : "";
  if (!plainContent && !plainExcerpt) notFound();

  return <NewsDetailClient article={serialized} />;
}
