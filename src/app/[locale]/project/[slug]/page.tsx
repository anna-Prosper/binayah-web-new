import { notFound } from "next/navigation";
import ProjectDetailClient from "@/app/project/[slug]/ProjectDetailClient";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = applyTranslation(await getProject(slug), locale);
  if (!project) return { title: "Not Found" };
  const seo = project.seo || {};

  const priceStr = project.startingPrice
    ? ` | From ${project.currency || "AED"} ${project.startingPrice < 1_000 ? `${project.startingPrice}M` : (project.startingPrice / 1_000_000).toFixed(1) + "M"}`
    : "";
  const communityStr = project.community ? ` | ${project.community}` : "";
  const titleFallback = `${project.name}${priceStr}${communityStr} | Binayah`;
  const descFallback = project.shortOverview ||
    `${project.name} is an off-plan project${project.community ? ` in ${project.community}` : ""} by ${project.developerName || "a leading developer"} in Dubai.${project.startingPrice ? ` Starting from ${project.currency || "AED"} ${(project.startingPrice / 1_000_000).toFixed(1)}M.` : ""} Explore floor plans, payment plans and availability.`;

  return {
    title: seo.metaTitle || titleFallback,
    description: seo.metaDescription || descFallback,
    alternates: {
      canonical: seo.canonicalUrl || `/${locale}/project/${slug}`,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || titleFallback,
      description: seo.ogDescription || seo.metaDescription || descFallback,
      images: seo.ogImage ? [{ url: seo.ogImage }] : project.featuredImage ? [{ url: project.featuredImage, width: 1200, height: 630, alt: project.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.metaTitle || titleFallback,
      description: seo.twitterDescription || seo.metaDescription || descFallback,
      ...(project.featuredImage ? { images: [project.featuredImage] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = applyTranslation(await getProject(slug), locale);
  if (!project) return notFound();
  return <ProjectDetailClient serverProject={project} />;
}
