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
  return {
    title: seo.metaTitle || `${project.name} | Binayah Properties`,
    description: seo.metaDescription || project.shortOverview || "",
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || project.name,
      description: seo.ogDescription || seo.metaDescription || project.shortOverview || "",
      images: seo.ogImage ? [{ url: seo.ogImage }] : project.featuredImage ? [{ url: project.featuredImage }] : [],
      type: seo.ogType || "website",
    },
    twitter: {
      card: seo.twitterCard || "summary_large_image",
      title: seo.twitterTitle || seo.metaTitle || project.name,
      description: seo.twitterDescription || seo.metaDescription || "",
    },
    ...(seo.canonicalUrl ? { alternates: { canonical: seo.canonicalUrl } } : {}),
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = applyTranslation(await getProject(slug), locale);
  if (!project) return notFound();
  return <ProjectDetailClient serverProject={project} />;
}
