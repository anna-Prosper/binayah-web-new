import { notFound } from "next/navigation";
import { getNewsArticle } from "@/lib/api";
import Image from "next/image";

export const revalidate = 1800;

const FALLBACK = "/assets/dubai-hero.webp";

export default async function NewsRawHeroPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return notFound();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src={article.featuredImage || FALLBACK}
        alt={article.title}
        fill
        className="object-cover"
        priority
        unoptimized
      />
    </div>
  );
}
