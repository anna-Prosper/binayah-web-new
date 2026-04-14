import { notFound } from "next/navigation";
import ConstructionUpdateDetailClient from "./ConstructionUpdateDetailClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await serverFetch(serverApiUrl(`/api/construction-updates/${slug}`));
    if (!res.ok) return { title: "Not Found" };
    const { update } = await res.json();
    return {
      title: `${update.title} Construction Update | Binayah Properties`,
      description: `Track construction progress of ${update.title} by ${update.developerName}. Currently at ${update.progress ?? 0}% completion.`,
    };
  } catch {
    return { title: "Binayah Properties" };
  }
}

export default async function ConstructionUpdatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await serverFetch(serverApiUrl(`/api/construction-updates/${slug}`));
    if (res.status === 404) return notFound();
    if (!res.ok) return notFound();
    const { update, related } = await res.json();
    return <ConstructionUpdateDetailClient update={update} related={related} />;
  } catch {
    return notFound();
  }
}
