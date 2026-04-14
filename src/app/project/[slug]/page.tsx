import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";
import { serverApiUrl } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await fetch(serverApiUrl(`/api/projects/${slug}`), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Not Found" };
    const project = await res.json();
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
  } catch {
    return { title: "Binayah Properties" };
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await fetch(serverApiUrl(`/api/projects/${slug}`), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return notFound();
    const project = await res.json();
    return <ProjectDetailClient serverProject={project} />;
  } catch {
    return notFound();
  }
}
