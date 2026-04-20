import DeveloperDetailClient from "@/app/developers/[slug]/DeveloperDetailClient";
import { notFound } from "next/navigation";
import { getDeveloper } from "@/lib/api";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DeveloperDetailPage({ params }: Props) {
  const { slug } = await params;

  const data = await getDeveloper(slug);

  if (!data || !data.developer) return notFound();

  const { developer, projects } = data;

  return (
    <DeveloperDetailClient
      developer={developer}
      projects={projects || []}
    />
  );
}
