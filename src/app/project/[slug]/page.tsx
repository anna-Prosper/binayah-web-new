import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    await connectDB();
    const project = await Project.findOne({ slug, publishStatus: "published" }).lean();
    if (!project) return { title: "Not Found" };
    const p = project as any;
    const seo = p.seo || {};
    return {
      title: seo.metaTitle || `${p.name} | Binayah Properties`,
      description: seo.metaDescription || p.shortOverview || "",
      openGraph: {
        title: seo.ogTitle || seo.metaTitle || p.name,
        description: seo.ogDescription || seo.metaDescription || p.shortOverview || "",
        images: seo.ogImage ? [{ url: seo.ogImage }] : p.featuredImage ? [{ url: p.featuredImage }] : [],
        type: seo.ogType || "website",
      },
      twitter: {
        card: seo.twitterCard || "summary_large_image",
        title: seo.twitterTitle || seo.metaTitle || p.name,
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
    await connectDB();
    const project = await Project.findOne({ slug, publishStatus: "published" }).lean();
    if (!project) notFound();
    const serialized = JSON.parse(JSON.stringify(project));

    // imageGallery: extract URLs for backward compat with client component
    if (serialized.imageGallery && Array.isArray(serialized.imageGallery)) {
      serialized.imageGallery = serialized.imageGallery.map((item: any) =>
        typeof item === "object" && item.url ? item.url : item
      );
    }

    // localImages: same
    if (serialized.localImages && Array.isArray(serialized.localImages)) {
      serialized.localImages = serialized.localImages.map((item: any) =>
        typeof item === "object" && item.url ? item.url : item
      );
    }

    return <ProjectDetailClient serverProject={serialized} />;
  } catch {
    notFound();
  }
}
