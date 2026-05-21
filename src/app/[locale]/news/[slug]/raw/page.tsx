import { notFound } from "next/navigation";
import { getNewsArticle } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import NewsDetailClient from "@/app/_clients/news/[slug]/NewsDetailClient";

export const revalidate = 0;

const OVERRIDE_IMAGE = "https://sm-automation-5464.s3.amazonaws.com/nanobanana-inputs/00317cd9e39a46b382824a469fb76dd7.png";

export default async function NewsRawPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = applyTranslation(await getNewsArticle(slug), locale);
  if (!article) return notFound();

  return <NewsDetailClient article={{ ...article, featuredImage: OVERRIDE_IMAGE }} />;
}
