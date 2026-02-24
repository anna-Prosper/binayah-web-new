import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

export const dynamic = "force-dynamic";

/**
 * Clean WordPress HTML content:
 * - Remove CTA/marketing headers ("Get Exclusive Access", "Register Your Details")
 * - Remove base64-encoded form IDs and shortcode artifacts
 * - Strip empty tags and excessive whitespace
 * - Keep real content paragraphs, lists, headings
 */
function cleanWpHtml(html: string): string {
  if (!html) return "";

  let clean = html;

  // Remove everything before the first real content heading (h2/h3) or first real paragraph
  // Pattern: CTA h4 + base64 noise at the start
  clean = clean.replace(/^<h4[^>]*>[\s\S]*?<\/h4>\s*/i, "");

  // Remove base64/encoded strings (long alphanumeric blobs)
  clean = clean.replace(/[A-Za-z0-9+/=]{40,}/g, "");

  // Remove "Get Exclusive Access" type CTAs
  clean = clean.replace(/<[^>]*>(\s*Get Exclusive Access[^<]*)<\/[^>]*>/gi, "");
  clean = clean.replace(/<[^>]*>(\s*Register Your Details[^<]*)<\/[^>]*>/gi, "");
  clean = clean.replace(/<[^>]*>(\s*Book Now[^<]*)<\/[^>]*>/gi, "");

  // Remove empty tags
  clean = clean.replace(/<(\w+)[^>]*>\s*<\/\1>/g, "");
  clean = clean.replace(/<(\w+)[^>]*>\s*<\/\1>/g, ""); // second pass

  // Remove inline styles (WordPress adds font-weight, color, etc.)
  clean = clean.replace(/ style="[^"]*"/gi, "");
  clean = clean.replace(/ aria-level="[^"]*"/gi, "");

  // Clean up whitespace
  clean = clean.replace(/\n{3,}/g, "\n\n").trim();

  return clean;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const project = await Project.findOne({ slug, publishStatus: "Published" }).lean();
  if (!project) return { title: "Not Found" };
  return {
    title: (project as any).metaTitle || `${(project as any).name} | Binayah Properties`,
    description: (project as any).metaDescription || (project as any).shortOverview,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const project = await Project.findOne({ slug, publishStatus: "Published" }).lean();
  if (!project) notFound();
  
  const serialized = JSON.parse(JSON.stringify(project));

  // Clean HTML content from WordPress
  if (serialized.fullDescription) {
    serialized.fullDescription = cleanWpHtml(serialized.fullDescription);
  }
  if (serialized.shortOverview) {
    // shortOverview should be plain text
    serialized.shortOverview = serialized.shortOverview.replace(/<[^>]*>/g, "").trim();
  }

  return <ProjectDetailClient serverProject={serialized} />;
}
