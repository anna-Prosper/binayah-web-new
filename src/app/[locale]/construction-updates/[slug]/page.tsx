import { notFound } from "next/navigation";
import ConstructionUpdateDetailClient from "@/app/_clients/construction-updates/[slug]/ConstructionUpdateDetailClient";
import { getConstructionUpdate } from "@/lib/api";
import { canonical, altLangs } from "@/lib/site";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const data = await getConstructionUpdate(slug);
  if (!data) return { title: "Not Found" };
  const { update } = data;
  return {
    title: `${update.title} Construction Update | Binayah Properties`,
    description: `Track construction progress of ${update.title} by ${update.developerName}. Currently at ${update.progress ?? 0}% completion.`,
    alternates: {
      canonical: canonical(locale, `/construction-updates/${slug}`),
      languages: altLangs(`/construction-updates/${slug}`),
    },
    openGraph: {
      title: `${update.title} Construction Update`,
      url: canonical(locale, `/construction-updates/${slug}`),
      type: "website",
    },
  };
}

export default async function ConstructionUpdatePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const data = await getConstructionUpdate(slug);
  if (!data) return notFound();
  const { update, related } = data;
  return <ConstructionUpdateDetailClient update={update} related={related} />;
}
