import DeveloperDetailClient from "@/app/developers/[slug]/DeveloperDetailClient";
import { notFound } from "next/navigation";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DeveloperDetailPage({ params }: Props) {
  const { slug } = await params;

  let developer: any = null;
  let projects: any[] = [];

  try {
    const res = await serverFetch(serverApiUrl(`/api/developers/${slug}`));
    if (res.status === 404) return notFound();
    if (res.ok) {
      const data = await res.json();
      developer = data.developer;
      projects = data.projects || [];
    }
  } catch (err) {
    console.warn("[DeveloperDetailPage] API unavailable:", (err as Error).message);
  }

  if (!developer) return notFound();

  return (
    <DeveloperDetailClient
      developer={developer}
      projects={projects}
    />
  );
}
